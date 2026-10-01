<?php
require_once __DIR__ . '/config/db.php';

$ran = [];

try {
    // ── Gift product: Coffee Whisker (shown in Gift Catalog, added at ₹0 on redemption) ──
    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = 'gift-coffee-whisker'");
    $stmt->execute();
    if (!$stmt->fetchColumn()) {
        $pdo->prepare("
            INSERT INTO products
            (id, name, subtitle, short_description, full_description, category, image_tag, bg_theme, slug, stock_quantity, sku, status, tags)
            VALUES
            ('gift-coffee-whisker', 'Coffee Whisker', 'Handcrafted reward gift',
             'A artisan milk coffee whisk — FREE when you unlock a Rooveka reward.',
             'The Coffee Whisk is our handcrafted reward gift. Earn it by entering 3 qualifying product codes on the Rooveka Rewards page — it is added to your cart at Rs 0.00 so you can check out immediately.',
             'Gifts', 'gift-whisker', 'cream-beige', 'gift-coffee-whisker', 999, 'GIFT-WHISKER-001', 'Active', 'gift,reward,freebie')
        ")->execute();
        $ran[] = 'seeded gift product gift-coffee-whisker';
    }

    // ── Reward program: Hot Chocolate → 3 codes → Coffee Whisker ──
    $stmt = $pdo->prepare("SELECT id FROM reward_programs WHERE trigger_product_id = 'hot-chocolate-985e77'");
    $stmt->execute();
    if (!$stmt->fetchColumn()) {
        $pdo->prepare("
            INSERT INTO reward_programs
            (name, description, trigger_product_id, required_quantity, reward_product_name, reward_description, is_active)
            VALUES
            ('Hot Chocolate Rewards', 'Enter 3 Hot Chocolate codes to unlock a free Coffee Whisker',
             'hot-chocolate-985e77', 3, 'Coffee Whisker',
             'Three qualifying codes from Hot Chocolate packs unlock a complimentary Coffee Whisker added straight to your cart.', 1)
        ")->execute();
        $ran[] = 'seeded Hot Chocolate reward program';
    }

    echo json_encode([
        'success' => true,
        'message' => $ran ? ('Seeded: ' . implode(', ', $ran)) : 'Gift rewards already seeded',
        'applied' => $ran,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Seed failed', 'details' => $e->getMessage()]);
}
?>
