<?php
require_once __DIR__ . '/config/db.php';

$hasColumn = function (string $table, string $col) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $col]);
    return (bool)$stmt->fetchColumn();
};

$hasIndex = function (string $table, string $index) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?");
    $stmt->execute([$table, $index]);
    return (bool)$stmt->fetchColumn();
};

$hasProductFk = function () use ($pdo) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'coupons_pool'
          AND COLUMN_NAME = 'product_id'
          AND REFERENCED_TABLE_NAME = 'products'
    ");
    $stmt->execute();
    return (bool)$stmt->fetchColumn();
};

try {
    // ── Drop assignment-era columns (no per-customer assignment anymore) ────
    foreach (['is_assigned', 'assigned_to_email', 'assigned_at'] as $col) {
        if ($hasColumn('coupons_pool', $col)) {
            $pdo->exec("ALTER TABLE coupons_pool DROP COLUMN `$col`");
        }
    }

    // ── Product-scoped generation + lifecycle columns ───────────────────────
    if (!$hasColumn('coupons_pool', 'product_id')) {
        $pdo->exec("ALTER TABLE coupons_pool ADD COLUMN product_id VARCHAR(50) NULL AFTER coupon_code");
    }
    if (!$hasColumn('coupons_pool', 'status')) {
        $pdo->exec("ALTER TABLE coupons_pool ADD COLUMN status ENUM('active','inactive','expired') NOT NULL DEFAULT 'active' AFTER product_id");
    }
    if (!$hasColumn('coupons_pool', 'expires_at')) {
        $pdo->exec("ALTER TABLE coupons_pool ADD COLUMN expires_at DATE NULL AFTER status");
    }
    if (!$hasColumn('coupons_pool', 'redeemed_at')) {
        $pdo->exec("ALTER TABLE coupons_pool ADD COLUMN redeemed_at TIMESTAMP NULL DEFAULT NULL AFTER expires_at");
    }

    // ── Indexes / FK ────────────────────────────────────────────────────────
    if (!$hasIndex('coupons_pool', 'idx_status')) {
        $pdo->exec("ALTER TABLE coupons_pool ADD INDEX idx_status (status)");
    }
    if (!$hasProductFk()) {
        $pdo->exec("ALTER TABLE coupons_pool ADD CONSTRAINT fk_coupons_pool_product
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE");
    }

    // Existing rows: NULL expires_at = never expires; status defaults to 'active'
    echo json_encode(['success' => true, 'message' => 'coupons_pool redesigned: product_id, status, expires_at, redeemed_at; assignment columns dropped']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}
?>
