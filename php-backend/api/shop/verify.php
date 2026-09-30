<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getInput();
    $verificationCode = strtoupper(trim($input['verificationCode'] ?? ''));
    $action = $input['action'] ?? 'verify';

    if (!$verificationCode) {
        fail(400, 'Verification code is required');
    }

    if (!checkRateLimit($verificationCode, 'shop_verify', 10, 60)) {
        fail(429, 'Too many verification attempts for this code');
    }

    $codeHash = hashCode($verificationCode);

    $stmt = $pdo->prepare("
        SELECT rr.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
               rp.name as program_name, rp.reward_product_name, rp.reward_description
        FROM reward_redemptions rr
        LEFT JOIN users u ON rr.customer_id = u.id
        LEFT JOIN reward_programs rp ON rr.reward_program_id = rp.id
        WHERE rr.shop_verification_code_hash = ?
    ");
    $stmt->execute([$codeHash]);
    $redemption = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$redemption) {
        fail(404, 'Invalid verification code');
    }

    if ($redemption['status'] === 'redeemed') {
        fail(400, 'This reward has already been redeemed');
    }
    if ($redemption['status'] === 'cancelled') {
        fail(400, 'This reward has been cancelled');
    }
    if ($redemption['status'] === 'expired') {
        fail(400, 'This reward has expired');
    }
    if ($redemption['fulfillment_type'] !== 'shop_collection') {
        fail(400, 'This reward is not eligible for shop collection');
    }
    if ($redemption['status'] !== 'pending_fulfillment' && $redemption['status'] !== 'fulfilled') {
        fail(400, 'This reward is not ready for collection. Current status: ' . $redemption['status']);
    }

    if ($action === 'verify') {
        echo json_encode([
            'success' => true,
            'redemption' => [
                'id' => (int)$redemption['id'],
                'redemptionUid' => $redemption['redemption_uid'],
                'customerName' => $redemption['customer_name'],
                'customerEmail' => $redemption['customer_email'],
                'programName' => $redemption['program_name'],
                'rewardProductName' => $redemption['reward_product_name'],
                'rewardDescription' => $redemption['reward_description'],
                'status' => $redemption['status'],
                'createdAt' => $redemption['created_at'],
            ],
            'message' => 'Code verified. Confirm handover to complete redemption.',
        ]);

    } elseif ($action === 'confirm_handover') {
        $shopUser = requireRole('shopkeeper');

        if (!checkRateLimit($shopUser['email'] . ':handover', 'confirm', 30, 60)) {
            fail(429, 'Too many handover attempts');
        }

        $pdo->beginTransaction();
        try {
            $pdo->prepare("
                UPDATE reward_redemptions 
                SET status = 'redeemed', shop_user_id = ?, verified_at = NOW(), handover_at = NOW()
                WHERE id = ? AND status IN ('pending_fulfillment', 'fulfilled')
            ")->execute([$shopUser['id'], $redemption['id']]);

            logAudit('shop_handover', 'reward_redemption', (int)$redemption['id'], $shopUser['id'], [
                'customerName' => $redemption['customer_name'],
                'programName' => $redemption['program_name'],
                'shopName' => $shopUser['shop_name'] ?? '',
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Reward successfully handed over to customer',
                'redemption' => [
                    'id' => (int)$redemption['id'],
                    'customerName' => $redemption['customer_name'],
                    'programName' => $redemption['program_name'],
                    'rewardProductName' => $redemption['reward_product_name'],
                    'status' => 'redeemed',
                ],
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            fail(500, 'Handover confirmation failed');
        }

    } else {
        fail(400, 'Invalid action');
    }

} elseif ($method === 'GET') {
    $shopUser = requireRole('shopkeeper');

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $filter = $_GET['filter'] ?? 'today';

    $where = "WHERE rr.fulfillment_type = 'shop_collection'";
    $params = [];

    if ($filter === 'today') {
        $where .= " AND DATE(rr.created_at) = CURDATE()";
    } elseif ($filter === 'pending') {
        $where .= " AND rr.status IN ('pending_fulfillment', 'fulfilled')";
    } elseif ($filter === 'redeemed') {
        $where .= " AND rr.status = 'redeemed'";
    } elseif ($filter === 'expired') {
        $where .= " AND rr.status = 'expired'";
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM reward_redemptions rr $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT rr.*, u.name as customer_name, u.email as customer_email,
               rp.name as program_name, rp.reward_product_name
        FROM reward_redemptions rr
        LEFT JOIN users u ON rr.customer_id = u.id
        LEFT JOIN reward_programs rp ON rr.reward_program_id = rp.id
        $where
        ORDER BY rr.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $redemptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'redemptions' => array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'customerName' => $r['customer_name'] ?? '',
                'customerEmail' => $r['customer_email'] ?? '',
                'programName' => $r['program_name'] ?? '',
                'rewardProductName' => $r['reward_product_name'] ?? '',
                'shopVerificationCode' => $r['shop_verification_code'] ?? '',
                'status' => $r['status'],
                'verifiedAt' => $r['verified_at'],
                'handoverAt' => $r['handover_at'],
                'createdAt' => $r['created_at'],
            ];
        }, $redemptions),
        'total' => $total,
    ]);

} else {
    fail(405, 'Method not allowed');
}
