<?php
require_once __DIR__ . '/config/db.php';

$hasColumn = function (string $table, string $col) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $col]);
    return (bool)$stmt->fetchColumn();
};

$hasTable = function (string $table) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $stmt->execute([$table]);
    return (bool)$stmt->fetchColumn();
};

$ran = [];

try {
    // ── coupons_pool: customer attribution for My Rewards verification ──────
    if (!$hasColumn('coupons_pool', 'customer_id')) {
        $pdo->exec("ALTER TABLE coupons_pool
            ADD COLUMN customer_id INT NULL DEFAULT NULL AFTER redeemed_at,
            ADD COLUMN reward_program_id INT NULL DEFAULT NULL AFTER customer_id,
            ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL AFTER reward_program_id,
            ADD KEY idx_cp_cust_program (customer_id, reward_program_id)");
        $ran[] = 'coupons_pool customer_id/reward_program_id/ip_address';
    }

    // ── redemption_coupons: links a reward claim to the consumed coupons ────
    if (!$hasTable('redemption_coupons')) {
        $pdo->exec("
            CREATE TABLE redemption_coupons (
                id INT NOT NULL AUTO_INCREMENT,
                redemption_id INT NOT NULL,
                coupon_id INT NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY unique_redemption_coupon (redemption_id, coupon_id),
                KEY idx_rc_coupon (coupon_id),
                CONSTRAINT fk_rc_redemption FOREIGN KEY (redemption_id) REFERENCES reward_redemptions (id) ON DELETE CASCADE,
                CONSTRAINT fk_rc_coupon FOREIGN KEY (coupon_id) REFERENCES coupons_pool (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        ");
        $ran[] = 'created redemption_coupons';
    }

    echo json_encode([
        'success' => true,
        'message' => $ran ? ('Migration applied: ' . implode(', ', $ran)) : 'Coupons pool schema already up to date',
        'applied' => $ran,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}
?>
