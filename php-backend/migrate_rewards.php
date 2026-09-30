<?php
require_once __DIR__ . '/config/db.php';

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // 1. Users table (admin, shopkeeper, customer)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin','shopkeeper','customer') NOT NULL DEFAULT 'customer',
            phone VARCHAR(20) NULL,
            shop_name VARCHAR(150) NULL,
            shop_address TEXT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            last_login_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_role (role),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 2. Reward programs
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reward_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            description TEXT NULL,
            trigger_product_id VARCHAR(50) NOT NULL,
            required_quantity INT NOT NULL DEFAULT 1,
            reward_product_name VARCHAR(150) NOT NULL,
            reward_description TEXT NULL,
            expiry_date DATE NULL,
            max_total_redemptions INT NULL,
            current_redemptions INT NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (trigger_product_id) REFERENCES products(id) ON DELETE CASCADE,
            INDEX idx_active (is_active),
            INDEX idx_trigger_product (trigger_product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 3. Product codes (physical coupon codes printed on packages)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS product_codes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(32) NOT NULL UNIQUE,
            code_hash VARCHAR(64) NOT NULL UNIQUE,
            product_id VARCHAR(50) NOT NULL,
            batch_label VARCHAR(100) NULL,
            status ENUM('generated','active','redeemed','expired','cancelled') NOT NULL DEFAULT 'generated',
            generated_by INT NULL,
            assigned_customer_id INT NULL,
            redeemed_at TIMESTAMP NULL,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (assigned_customer_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_code (code),
            INDEX idx_code_hash (code_hash),
            INDEX idx_product (product_id),
            INDEX idx_status (status),
            INDEX idx_batch (batch_label)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 4. Customer code entries (when customer enters product codes)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS customer_code_entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            product_code_id INT NOT NULL,
            reward_program_id INT NOT NULL,
            entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) NULL,
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_code_id) REFERENCES product_codes(id) ON DELETE CASCADE,
            FOREIGN KEY (reward_program_id) REFERENCES reward_programs(id) ON DELETE CASCADE,
            UNIQUE KEY unique_code_entry (product_code_id),
            INDEX idx_customer (customer_id),
            INDEX idx_program (reward_program_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 5. Reward redemptions (the actual reward transaction)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reward_redemptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            redemption_uid VARCHAR(36) NOT NULL UNIQUE,
            customer_id INT NOT NULL,
            reward_program_id INT NOT NULL,
            customer_reward_code VARCHAR(32) NOT NULL UNIQUE,
            customer_reward_code_hash VARCHAR(64) NOT NULL UNIQUE,
            shop_verification_code VARCHAR(32) NULL UNIQUE,
            shop_verification_code_hash VARCHAR(64) NULL UNIQUE,
            fulfillment_type ENUM('delivery','shop_collection') NULL,
            status ENUM('qualified','pending_choice','pending_fulfillment','fulfilled','redeemed','cancelled','expired') NOT NULL DEFAULT 'qualified',
            shop_user_id INT NULL,
            verified_at TIMESTAMP NULL,
            handover_at TIMESTAMP NULL,
            shipping_address TEXT NULL,
            shipping_status ENUM('pending','shipped','delivered') NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reward_program_id) REFERENCES reward_programs(id) ON DELETE CASCADE,
            FOREIGN KEY (shop_user_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_customer (customer_id),
            INDEX idx_status (status),
            INDEX idx_reward_code (customer_reward_code),
            INDEX idx_shop_code (shop_verification_code),
            INDEX idx_program (reward_program_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 6. Redemption codes link table (which product codes were used for which redemption)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS redemption_codes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            redemption_id INT NOT NULL,
            product_code_id INT NOT NULL,
            FOREIGN KEY (redemption_id) REFERENCES reward_redemptions(id) ON DELETE CASCADE,
            FOREIGN KEY (product_code_id) REFERENCES product_codes(id) ON DELETE CASCADE,
            UNIQUE KEY unique_redemption_code (redemption_id, product_code_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 7. Audit log
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reward_audit_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT NULL,
            user_id INT NULL,
            details JSON NULL,
            ip_address VARCHAR(45) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_action (action),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_user (user_id),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // 8. Rate limiting table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(150) NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            attempts INT NOT NULL DEFAULT 1,
            first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_identifier_action (identifier, action_type),
            INDEX idx_identifier (identifier)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Seed default admin user (password: admin123)
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT);
    $pdo->prepare("
        INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
        ('Admin', 'admin@rooveka.com', ?, 'admin')
    ")->execute([$adminHash]);

    // Seed a sample shop user (password: shop123)
    $shopHash = password_hash('shop123', PASSWORD_BCRYPT);
    $pdo->prepare("
        INSERT IGNORE INTO users (name, email, password_hash, role, shop_name, shop_address) VALUES
        ('Rooveka Shop Vijayawada', 'shop.vijayawada@rooveka.com', ?, 'shopkeeper', 'Rooveka Store - Vijayawada', 'MG Road, Labbipet, Vijayawada, AP')
    ")->execute([$shopHash]);

    echo json_encode(['success' => true, 'message' => 'Reward & coupon tables created successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}
