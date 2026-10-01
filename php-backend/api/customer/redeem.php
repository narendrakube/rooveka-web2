<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

if ($method === 'POST') {
    $input = getInput();
    $codes = $input['codes'] ?? [];
    $productId = trim((string)($input['productId'] ?? ''));

    if ($productId === '') {
        fail(400, 'Please select a product');
    }
    if (empty($codes) || !is_array($codes)) {
        fail(400, 'Please provide at least one product code');
    }
    if (count($codes) > 20) {
        fail(400, 'Maximum 20 codes per submission');
    }

    // The selected product must have an active reward program
    $progStmt = $pdo->prepare("SELECT * FROM reward_programs WHERE trigger_product_id = ? AND is_active = 1 ORDER BY id ASC LIMIT 1");
    $progStmt->execute([$productId]);
    $program = $progStmt->fetch(PDO::FETCH_ASSOC);
    if (!$program) {
        fail(400, 'No active reward program for this product');
    }
    $requiredQty = (int)$program['required_quantity'];

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!checkRateLimit($user['email'] . ':redeem', 'code_entry', 20, 60)) {
        fail(429, 'Too many redemption attempts. Please try again later.');
    }

    $pdo->beginTransaction();
    try {
        $results = [];
        $errors = [];
        $couponIds = [];
        $seen = [];

        foreach ($codes as $code) {
            $code = strtoupper(trim((string)$code));
            if (strlen($code) < 6 || strlen($code) > 64) {
                $errors[] = ['code' => $code, 'error' => 'Invalid code format'];
                continue;
            }
            if (isset($seen[$code])) {
                $errors[] = ['code' => $code, 'error' => 'Duplicate code in this submission'];
                continue;
            }
            $seen[$code] = true;

            // My Rewards verifies against the admin Gift Pool (coupons_pool)
            $stmt = $pdo->prepare("SELECT cp.*, p.name as product_name FROM coupons_pool cp LEFT JOIN products p ON cp.product_id = p.id WHERE cp.coupon_code = ?");
            $stmt->execute([$code]);
            $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$coupon) {
                $errors[] = ['code' => $code, 'error' => 'Code not found'];
                continue;
            }
            if ($coupon['product_id'] !== $productId) {
                $errors[] = ['code' => $code, 'error' => 'Code does not match the selected product'];
                continue;
            }
            if ($coupon['status'] === 'inactive') {
                $errors[] = ['code' => $code, 'error' => 'Code already redeemed'];
                continue;
            }
            if ($coupon['status'] === 'expired') {
                $errors[] = ['code' => $code, 'error' => 'Code has expired'];
                continue;
            }
            if ($coupon['status'] !== 'active') {
                $errors[] = ['code' => $code, 'error' => 'Code is ' . $coupon['status']];
                continue;
            }
            if ($coupon['expires_at'] && $coupon['expires_at'] < date('Y-m-d')) {
                $errors[] = ['code' => $code, 'error' => 'Code has expired'];
                continue;
            }

            // Consume atomically — only an still-active row flips to inactive
            $upd = $pdo->prepare("UPDATE coupons_pool SET status = 'inactive', redeemed_at = NOW(), customer_id = ?, reward_program_id = ?, ip_address = ? WHERE id = ? AND status = 'active'");
            $upd->execute([$user['id'], $program['id'], $ip, $coupon['id']]);
            if ($upd->rowCount() === 0) {
                $errors[] = ['code' => $code, 'error' => 'Code already redeemed'];
                continue;
            }

            $couponIds[] = (int)$coupon['id'];
            $results[] = ['code' => $code, 'product' => $coupon['product_name'], 'status' => 'accepted'];
        }

        if (empty($results)) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'errors' => $errors, 'message' => 'No valid codes found']);
            return;
        }

        // Gift product for the auto-added cart item (rewards_config name → real product row)
        $giftRow = $pdo->query("SELECT reward_name FROM rewards_config WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        $giftName = $giftRow['reward_name'] ?? $program['reward_product_name'];
        $giftStmt = $pdo->prepare("SELECT id FROM products WHERE name = ? AND status = 'Active' ORDER BY id LIMIT 1");
        $giftStmt->execute([$giftName]);
        $giftProductId = $giftStmt->fetchColumn() ?: ('gift-' . strtolower(preg_replace('/[^a-z0-9]+/', '-', $giftName)));

        $rewardCart = [
            'productId' => (string)$giftProductId,
            'name'      => (string)$giftName,
            'price'     => 0,
            'sizeLabel' => 'Reward Gift',
        ];

        // Qualification check — count this customer's consumed Gift Pool coupons for the program
        $rewardsEarned = [];
        $warnings = [];

        $countStmt = $pdo->prepare("
            SELECT COUNT(*) FROM coupons_pool
            WHERE customer_id = ? AND reward_program_id = ? AND status = 'inactive'
        ");
        $countStmt->execute([$user['id'], $program['id']]);
        $totalEntered = (int)$countStmt->fetchColumn();

        if ($totalEntered >= $requiredQty) {
            $checkExisting = $pdo->prepare("SELECT id FROM reward_redemptions WHERE customer_id = ? AND reward_program_id = ? AND status NOT IN ('cancelled', 'expired')");
            $checkExisting->execute([$user['id'], $program['id']]);
            if (!$checkExisting->fetch()) {
                if ($program['max_total_redemptions'] && $program['current_redemptions'] >= $program['max_total_redemptions']) {
                    $warnings[] = 'This reward program has reached its redemption limit. Please contact support.';
                    logAudit('reward_limit_reached', 'reward_program', (int)$program['id'], $user['id'], ['programName' => $program['name']]);
                } else {
                    // Record the reward claim — the gift itself is delivered as a ₹0 cart item
                    $rewardCode = generateCode(12);
                    $redemptionUid = generateUid();

                    $pdo->prepare("
                        INSERT INTO reward_redemptions (redemption_uid, customer_id, reward_program_id, customer_reward_code, customer_reward_code_hash, status)
                        VALUES (?, ?, ?, ?, ?, 'qualified')
                    ")->execute([$redemptionUid, $user['id'], $program['id'], $rewardCode, hashCode($rewardCode)]);

                    $redemptionId = (int)$pdo->lastInsertId();

                    foreach ($couponIds as $couponId) {
                        $pdo->prepare("INSERT IGNORE INTO redemption_coupons (redemption_id, coupon_id) VALUES (?, ?)")->execute([$redemptionId, $couponId]);
                    }

                    $pdo->prepare("UPDATE reward_programs SET current_redemptions = current_redemptions + 1 WHERE id = ?")->execute([$program['id']]);

                    logAudit('reward_qualified', 'reward_redemption', $redemptionId, $user['id'], [
                        'programName' => $program['name'],
                        'codesUsed'   => count($couponIds),
                        'rewardCode'  => $rewardCode,
                        'rewardCart'  => $rewardCart,
                    ]);

                    $rewardsEarned[] = [
                        'redemptionUid'      => $redemptionUid,
                        'programName'        => $program['name'],
                        'rewardProduct'      => $giftName,
                        'customerRewardCode' => $rewardCode,
                        'rewardCart'         => $rewardCart,
                        'requiredCodes'      => $requiredQty,
                        'submittedCodes'     => $totalEntered,
                    ];
                }
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'processed' => $results,
            'errors' => $errors,
            'rewardsEarned' => $rewardsEarned,
            'warnings' => $warnings,
            'message' => count($results) . ' code(s) processed'
                . (count($rewardsEarned) > 0 ? ', reward unlocked!' : '')
                . (count($warnings) > 0 ? ' — ' . count($warnings) . ' warning(s)' : ''),
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        fail(500, 'Redemption failed', ['details' => $e->getMessage()]);
    }

} elseif ($method === 'GET') {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM reward_redemptions WHERE customer_id = ?");
    $countStmt->execute([$user['id']]);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT rr.*, rp.name as program_name, rp.reward_product_name, rp.reward_description
        FROM reward_redemptions rr
        LEFT JOIN reward_programs rp ON rr.reward_program_id = rp.id
        WHERE rr.customer_id = ?
        ORDER BY rr.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute([$user['id']]);
    $redemptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $codeCountStmt = $pdo->prepare("SELECT COUNT(*) FROM coupons_pool WHERE customer_id = ? AND status = 'inactive'");
    $codeCountStmt->execute([$user['id']]);
    $totalCodesEntered = (int)$codeCountStmt->fetchColumn();

    echo json_encode([
        'redemptions' => array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'redemptionUid' => $r['redemption_uid'],
                'programName' => $r['program_name'] ?? '',
                'rewardProductName' => $r['reward_product_name'] ?? '',
                'rewardDescription' => $r['reward_description'] ?? '',
                'customerRewardCode' => $r['customer_reward_code'],
                'shopVerificationCode' => $r['shop_verification_code'],
                'fulfillmentType' => $r['fulfillment_type'],
                'status' => $r['status'],
                'createdAt' => $r['created_at'],
            ];
        }, $redemptions),
        'totalCodesEntered' => $totalCodesEntered,
        'total' => $total,
    ]);

} else {
    fail(405, 'Method not allowed');
}
?>
