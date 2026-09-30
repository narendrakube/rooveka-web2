<?php
/**
 * ROOVEKA DB Migration Script
 * Run once: C:\xampp\php\php.exe php-backend/migrate.php
 */

$pdo = new PDO(
    'mysql:host=localhost;port=3306;dbname=rooveka_db;charset=utf8mb4',
    'rooveka_admin',
    'Rooveka@SecurePass123',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

echo "🚀 Running ROOVEKA DB Migration...\n\n";

// 1. Create categories table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✅ categories table created\n";

// Seed categories
$pdo->exec("
    INSERT IGNORE INTO categories (name, slug) VALUES
    ('Tablets', 'tablets'),
    ('Hot Chocolate', 'hot-chocolate'),
    ('Gift Sets', 'gift-sets'),
    ('Seasonal', 'seasonal');
");
echo "✅ categories seeded\n";

// 2. Add new columns to products table (safe with IF NOT EXISTS via SHOW COLUMNS)
$existing = $pdo->query('SHOW COLUMNS FROM products')->fetchAll(PDO::FETCH_COLUMN);

$alterations = [
    'slug'           => "ALTER TABLE products ADD COLUMN slug VARCHAR(150)",
    'discount_price' => "ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2) DEFAULT NULL",
    'stock_quantity' => "ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0",
    'sku'            => "ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT NULL",
    'status'         => "ALTER TABLE products ADD COLUMN status ENUM('Active','Inactive') DEFAULT 'Active'",
    'tags'           => "ALTER TABLE products ADD COLUMN tags TEXT DEFAULT NULL",
    'category_id'    => "ALTER TABLE products ADD COLUMN category_id INT DEFAULT NULL",
];

foreach ($alterations as $col => $sql) {
    if (!in_array($col, $existing)) {
        $pdo->exec($sql);
        echo "✅ Added column: products.$col\n";
    } else {
        echo "⏭️  Column already exists: products.$col\n";
    }
}

// Patch existing 3 products with slug + status + category_id
$tablets  = $pdo->query("SELECT id FROM categories WHERE slug = 'tablets'")->fetch();
$hotchoc  = $pdo->query("SELECT id FROM categories WHERE slug = 'hot-chocolate'")->fetch();

$patches = [
    ['id' => 'rooveka-70-dark',       'slug' => 'rooveka-70-dark',       'cat' => $tablets['id'],  'stock' => 100],
    ['id' => 'rooveka-50-dark',       'slug' => 'rooveka-50-dark',       'cat' => $tablets['id'],  'stock' => 120],
    ['id' => 'rooveka-hot-chocolate', 'slug' => 'rooveka-hot-chocolate', 'cat' => $hotchoc['id'],  'stock' => 80],
];

$stmt = $pdo->prepare("
    UPDATE products
    SET slug = :slug, stock_quantity = :stock, status = 'Active', category_id = :cat
    WHERE id = :id AND (slug IS NULL OR slug = '')
");
foreach ($patches as $p) {
    $stmt->execute([':slug' => $p['slug'], ':stock' => $p['stock'], ':cat' => $p['cat'], ':id' => $p['id']]);
}
echo "✅ Existing products patched with slug/status/category\n";

// 3. Create product_images table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        is_primary TINYINT(1) DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✅ product_images table created\n";

echo "\n🎉 Migration complete!\n";
?>
