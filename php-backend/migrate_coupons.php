<?php
require_once __DIR__ . '/config/db.php';

try {
    // 1. Active reward gift configuration (single active row drives display name)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rewards_config (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reward_name VARCHAR(150) NOT NULL,
            status ENUM('active','inactive') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 2. Pool of pre-generated 100% off e-commerce coupon codes
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS coupons_pool (
            id INT AUTO_INCREMENT PRIMARY KEY,
            coupon_code VARCHAR(64) NOT NULL,
            is_assigned TINYINT(1) NOT NULL DEFAULT 0,
            assigned_to_email VARCHAR(150) NULL DEFAULT NULL,
            assigned_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_coupon_code (coupon_code),
            INDEX idx_available (is_assigned)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    echo json_encode(['success' => true, 'message' => 'rewards_config and coupons_pool tables created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}
?>
