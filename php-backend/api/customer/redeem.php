<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

if ($method === 'POST') {
    $input = getInput();
    $codes = $input['codes'] ?? [];

    if (empty($codes) || !is_array($codes)) {
        fail(400, 'Please provide at least one product code');
    }

    if (count($codes) > 20) {
        fail(400, 'Maximum 20 codes per submission');
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!checkRateLimit($user['email'] . ':redeem', 'code_entry', 20, 60)) {
        fail(429, 'Too many redemption attempts. Please try again later.');
    }

    $pdo->beginTransaction();
    try {
        $results = [];
        $validEntries = [];
        $errors = [];

        foreach ($codes as $index => $code) {
            $code = strtoupper(trim($code));
            if (strlen($code) < 6 || strlen($code) > 32) {
                $errors[] = ['code' => $code, 'error' => 'Invalid code format'];
                continue;
            }

            $codeHash = hashCode($code);
            $stmt = $pdo->prepare("SELECT pc.*, p.name as product_name FROM product_codes pc LEFT JOIN products p ON pc.product_id = p.id WHERE pc.code_hash = ?");
            $stmt->execute([$codeHash]);
            $productCode = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$productCode) {
                $errors[] = ['code' => $code, 'error' => 'Code not found'];
                continue;
            }
            if ($productCode['status'] !== 'active') {
                $errors[] = ['code' => $code, 'error' => 'Code is ' . $productCode['status']];
                continue;
            }
            if ($productCode['expires_at'] && strtotime($productCode['expires_at']) < time()) {
                $errors[] = ['code' => $code, 'error' => 'Code has expired'];
                continue;
            }

            $checkStmt = $pdo->prepare("SELECT id FROM customer_code_entries WHERE product_code_id = ?");
            $checkStmt->execute([$productCode['id']]);
            if ($checkStmt->fetch()) {
                $errors[] = ['code' => $code, 'error' => 'Code already redeemed'];
                continue;
            }

            $validEntries[] = [
                'productCode' => $productCode,
                'code' => $code,
            ];
        }

        if (empty($validEntries)) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'errors' => $errors, 'message' => 'No valid codes found']);
            return;
        }

        $programCounts = [];
        foreach ($validEntries as $entry) {
            $productId = $entry['productCode']['product_id'];

            $progStmt = $pdo->prepare("SELECT * FROM reward_programs WHERE trigger_product_id = ? AND is_active = 1");
            $progStmt->execute([$productId]);
            $programs = $progStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($programs as $prog) {
                $pid = (int)$prog['id'];
                if (!isset($programCounts[$pid])) {
                    $programCounts[$pid] = ['program' => $prog, 'entries' => []];
                }
                $programCounts[$pid]['entries'][] = $entry;
            }
        }

        foreach ($validEntries as $entry) {
            $pdo->prepare("UPDATE product_codes SET status = 'redeemed', redeemed_at = NOW(), assigned_customer_id = ? WHERE id = ?")->execute([$user['id'], $entry['productCode']['id']]);
            $pdo->prepare("INSERT INTO customer_code_entries (customer_id, product_code_id, reward_program_id, ip_address) VALUES (?, ?, ?, ?)")->execute([
                $user['id'],
                $entry['productCode']['id'],
                $entry['productCode']['product_id'] ? (reset($programs)['id'] ?? 0) : 0,
                $ip,
            ]);
            $results[] = ['code' => $entry['code'], 'product' => $entry['productCode']['product_name'], 'status' => 'accepted'];
        }

        $rewardsEarned = [];
        foreach ($programCounts as $pid => $data) {
            $prog = $data['program'];
            $requiredQty = (int)$prog['required_quantity'];

            $countStmt = $pdo->prepare("
                SELECT COUNT(*) FROM customer_code_entries cce
                JOIN product_codes pc ON cce.product_code_id = pc.id
                WHERE cce.customer_id = ? AND pc.product_id = ? AND cce.reward_program_id = ?
            ");
            $countStmt->execute([$user['id'], $prog['trigger_product_id'], $pid]);
            $totalEntered = (int)$countStmt->fetchColumn();

            if ($totalEntered >= $requiredQty) {
                $checkExisting = $pdo->prepare("SELECT id FROM reward_redemptions WHERE customer_id = ? AND reward_program_id = ? AND status NOT IN ('cancelled', 'expired')");
                $checkExisting->execute([$user['id'], $pid]);
                if (!$checkExisting->fetch()) {
                    if ($prog['max_total_redemptions'] && $prog['current_redemptions'] >= $prog['max_total_redemptions']) {
                        continue;
                    }

                    $redemptionUid = generateUid();
                    $custRewardCode = generateCode(16);
                    $custRewardHash = hashCode($custRewardCode);

                    $pdo->prepare("
                        INSERT INTO reward_redemptions (redemption_uid, customer_id, reward_program_id, customer_reward_code, customer_reward_code_hash, status)
                        VALUES (?, ?, ?, ?, ?, 'qualified')
                    ")->execute([$redemptionUid, $user['id'], $pid, $custRewardCode, $custRewardHash]);

                    $redemptionId = (int)$pdo->lastInsertId();

                    $entryIds = array_map(function($e) use ($pdo) {
                        $stmt = $pdo->prepare("SELECT id FROM customer_code_entries WHERE product_code_id = ?");
                        $stmt->execute([$e['productCode']['id']]);
                        return $stmt->fetchColumn();
                    }, $data['entries']);

                    foreach (array_filter($entryIds) as $entryId) {
                        $pdo->prepare("INSERT IGNORE INTO redemption_codes (redemption_id, product_code_id) VALUES (?, ?)")->execute([$redemptionId, $entryId]);
                    }

                    $pdo->prepare("UPDATE reward_programs SET current_redemptions = current_redemptions + 1 WHERE id = ?")->execute([$pid]);

                    logAudit('reward_qualified', 'reward_redemption', $redemptionId, $user['id'], [
                        'programName' => $prog['name'],
                        'codesUsed' => count($data['entries']),
                    ]);

                    $rewardsEarned[] = [
                        'redemptionUid' => $redemptionUid,
                        'programName' => $prog['name'],
                        'rewardProduct' => $prog['reward_product_name'],
                        'customerRewardCode' => $custRewardCode,
                        'requiredCodes' => $requiredQty,
                        'submittedCodes' => $totalEntered,
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
            'message' => count($results) . ' code(s) processed' . (count($rewardsEarned) > 0 ? ', ' . count($rewardsEarned) . ' reward(s) earned!' : ''),
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

    $codeCountStmt = $pdo->prepare("SELECT COUNT(*) FROM customer_code_entries WHERE customer_id = ?");
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
