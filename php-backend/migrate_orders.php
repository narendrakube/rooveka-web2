<?php
require_once __DIR__ . '/config/db.php';

$hasTable = function (string $table) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $stmt->execute([$table]);
    return (bool)$stmt->fetchColumn();
};

$hasColumn = function (string $table, string $col) use ($pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $col]);
    return (bool)$stmt->fetchColumn();
};

$ran = [];

try {
    // ── Parent table: orders ────────────────────────────────────────────────
    if (!$hasTable('orders')) {
        $pdo->exec("
            CREATE TABLE orders (
                order_id VARCHAR(20) NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(50) NOT NULL,
                pincode VARCHAR(10) NOT NULL,
                state VARCHAR(50) NOT NULL,
                payment_method VARCHAR(20) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                shipping_cost DECIMAL(10,2) NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('Pending','Dispatched','Delivered','Cancelled') DEFAULT 'Pending',
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (order_id),
                KEY idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        ");
        $ran[] = 'created orders';
    }

    // ── Child table: order_items (FK → orders, cascade delete) ──────────────
    if (!$hasTable('order_items')) {
        $pdo->exec("
            CREATE TABLE order_items (
                id INT NOT NULL AUTO_INCREMENT,
                order_id VARCHAR(20) DEFAULT NULL,
                product_id VARCHAR(50) DEFAULT NULL,
                product_name VARCHAR(100) DEFAULT NULL,
                size_label VARCHAR(20) DEFAULT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                image_tag VARCHAR(100) DEFAULT NULL,
                PRIMARY KEY (id),
                KEY order_id (order_id),
                CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        ");
        $ran[] = 'created order_items';
    } elseif (!$hasColumn('order_items', 'image_tag')) {
        $pdo->exec("ALTER TABLE order_items ADD COLUMN image_tag VARCHAR(100) DEFAULT NULL AFTER price");
        $ran[] = 'added order_items.image_tag';
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_status'");
    $stmt->execute();
    if (!$stmt->fetchColumn()) {
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_status (status)");
        $ran[] = 'added orders.idx_status';
    }

    echo json_encode([
        'success' => true,
        'message' => $ran ? ('Migration applied: ' . implode(', ', $ran)) : 'Orders schema already up to date',
        'applied' => $ran,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}
?>
