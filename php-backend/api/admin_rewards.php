<?php
require_once __DIR__ . '/../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    fail(405, 'Method not allowed');
}

$user = requireRole('admin');
$input = getInput();
$action = $input['action'] ?? '';

// Lazy-expire: active codes past their expiration date become 'expired'
function expireStaleCoupons(object $pdo): void {
    $pdo->exec("UPDATE coupons_pool SET status = 'expired' WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < CURDATE()");
}

// ── get_dashboard_data: active reward gift + coupon status counts ──────────
if ($action === 'get_dashboard_data') {
    try {
        $reward = $pdo->query("SELECT * FROM rewards_config WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);

        expireStaleCoupons($pdo);

        $counts = ['active' => 0, 'inactive' => 0, 'expired' => 0];
        foreach ($pdo->query("SELECT status, COUNT(*) AS c FROM coupons_pool GROUP BY status") as $row) {
            if (isset($counts[$row['status']])) $counts[$row['status']] = (int)$row['c'];
        }

        echo json_encode([
            'success' => true,
            'reward' => $reward ? [
                'id' => (int)$reward['id'],
                'rewardName' => $reward['reward_name'],
                'status' => $reward['status'],
                'createdAt' => $reward['created_at'],
            ] : null,
            'activeCoupons' => $counts['active'],
            'inactiveCoupons' => $counts['inactive'],
            'expiredCoupons' => $counts['expired'],
            'totalCoupons' => array_sum($counts),
        ]);
    } catch (PDOException $e) {
        fail(500, 'Failed to load dashboard data', ['details' => $e->getMessage()]);
    }

// ── update_reward: set the active reward gift name (upsert) ────────────────
} elseif ($action === 'update_reward') {
    $name = trim($input['reward_name'] ?? '');
    if ($name === '') {
        fail(400, 'reward_name is required');
    }
    if (strlen($name) > 150) {
        fail(400, 'reward_name must be 150 characters or fewer');
    }

    try {
        $stmt = $pdo->prepare("UPDATE rewards_config SET reward_name = ? WHERE status = 'active'");
        $stmt->execute([$name]);
        $rewardId = null;

        if ($stmt->rowCount() === 0) {
            $existing = $pdo->query("SELECT id FROM rewards_config WHERE status = 'active' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                $rewardId = (int)$existing['id'];
            } else {
                $ins = $pdo->prepare("INSERT INTO rewards_config (reward_name, status) VALUES (?, 'active')");
                $ins->execute([$name]);
                $rewardId = (int)$pdo->lastInsertId();
            }
        } else {
            $row = $pdo->query("SELECT id FROM rewards_config WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
            $rewardId = $row ? (int)$row['id'] : null;
        }

        logAudit('update_reward', 'rewards_config', $rewardId, $user['id'], ['reward_name' => $name]);

        echo json_encode([
            'success' => true,
            'reward' => ['id' => $rewardId, 'rewardName' => $name, 'status' => 'active'],
            'message' => "Active reward set to \"$name\"",
        ]);
    } catch (PDOException $e) {
        fail(500, 'Failed to update reward', ['details' => $e->getMessage()]);
    }

// ── generate_coupons: create product-scoped codes on the admin page ────────
} elseif ($action === 'generate_coupons') {
    $productId = trim($input['productId'] ?? '');
    $quantity  = (int)($input['quantity'] ?? 0);
    $expiresAt = trim($input['expiresAt'] ?? '');

    if ($productId === '') {
        fail(400, 'Product is required');
    }
    if ($quantity < 1 || $quantity > 500) {
        fail(400, 'Quantity must be between 1 and 500');
    }
    $date = DateTime::createFromFormat('Y-m-d', $expiresAt);
    if (!$date || $date->format('Y-m-d') !== $expiresAt) {
        fail(400, 'expiresAt must be a valid date (YYYY-MM-DD)');
    }

    try {
        $prodStmt = $pdo->prepare("SELECT id, name FROM products WHERE id = ?");
        $prodStmt->execute([$productId]);
        $product = $prodStmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            fail(400, 'Unknown product: ' . $productId);
        }

        $inserted = 0;
        $codes = [];
        $attempts = 0;
        $maxAttempts = $quantity * 5;

        $insStmt = $pdo->prepare("INSERT IGNORE INTO coupons_pool (coupon_code, product_id, status, expires_at) VALUES (?, ?, 'active', ?)");

        while ($inserted < $quantity && $attempts < $maxAttempts) {
            $needed = $quantity - $inserted;
            for ($i = 0; $i < $needed && $attempts < $maxAttempts; $i++) {
                $code = generateCode(12);
                $attempts++;
                if ($insStmt->execute([$code, $productId, $expiresAt])) {
                    if ($insStmt->rowCount() > 0) {
                        $inserted++;
                        $codes[] = $code;
                    }
                }
            }
        }

        if ($inserted < $quantity) {
            fail(500, "Only generated $inserted of $quantity unique codes — please retry");
        }

        logAudit('generate_coupons', 'coupons_pool', null, $user['id'], [
            'productId' => $productId,
            'quantity' => $inserted,
            'expiresAt' => $expiresAt,
        ]);

        $activeCount = (int)$pdo->query("SELECT COUNT(*) FROM coupons_pool WHERE status = 'active'")->fetchColumn();

        echo json_encode([
            'success' => true,
            'inserted' => $inserted,
            'product' => $product['name'],
            'expiresAt' => $expiresAt,
            'codes' => $codes,
            'activeCoupons' => $activeCount,
            'message' => "Successfully generated $inserted code" . ($inserted === 1 ? '' : 's') . " for {$product['name']}!",
        ]);
    } catch (PDOException $e) {
        fail(500, 'Failed to generate coupons', ['details' => $e->getMessage()]);
    }

} else {
    fail(400, 'Unknown action: ' . ($action ?: '(missing)'));
}
?>
