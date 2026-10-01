<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    fail(405, 'Method not allowed');
}

requireAuth();

try {
    // Canonical gift name (admin-managed rewards_config), fallback to per-program value
    $giftRow = $pdo->query("SELECT reward_name FROM rewards_config WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $defaultGift = $giftRow['reward_name'] ?? 'Free Reward';

    $rows = $pdo->query("
        SELECT rp.id, rp.name, rp.description, rp.trigger_product_id, rp.required_quantity,
               rp.reward_product_name, rp.reward_description,
               p.name AS product_name, p.subtitle, p.image_tag, p.category
        FROM reward_programs rp
        JOIN products p ON rp.trigger_product_id = p.id
        WHERE rp.is_active = 1 AND p.status = 'Active'
        ORDER BY p.name ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'programs' => array_map(fn($r) => [
            'programId'        => (int)$r['id'],
            'programName'      => $r['name'],
            'productId'        => $r['trigger_product_id'],
            'productName'      => $r['product_name'],
            'subtitle'         => $r['subtitle'],
            'imageTag'         => $r['image_tag'],
            'category'         => $r['category'],
            'requiredQuantity' => (int)$r['required_quantity'],
            'rewardName'       => $defaultGift,
            'rewardDescription'=> $r['reward_description'] ?? '',
            'description'      => $r['description'] ?? '',
        ], $rows),
    ]);
} catch (PDOException $e) {
    fail(500, 'Failed to load reward programs', ['details' => $e->getMessage()]);
}
?>
