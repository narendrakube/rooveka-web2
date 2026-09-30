<?php
require_once __DIR__ . '/../../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

if ($method === 'GET') {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');
    $status = $_GET['status'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search) {
        $where .= " AND (rp.name LIKE ? OR rp.reward_product_name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if ($status === 'active') { $where .= " AND rp.is_active = 1"; }
    elseif ($status === 'inactive') { $where .= " AND rp.is_active = 0"; }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM reward_programs rp $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT rp.*, p.name as trigger_product_name
        FROM reward_programs rp
        LEFT JOIN products p ON rp.trigger_product_id = p.id
        $where
        ORDER BY rp.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $programs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'programs' => array_map(function($p) {
            return [
                'id' => (int)$p['id'],
                'name' => $p['name'],
                'description' => $p['description'],
                'triggerProductId' => $p['trigger_product_id'],
                'triggerProductName' => $p['trigger_product_name'] ?? '',
                'requiredQuantity' => (int)$p['required_quantity'],
                'rewardProductName' => $p['reward_product_name'],
                'rewardDescription' => $p['reward_description'],
                'expiryDate' => $p['expiry_date'],
                'maxTotalRedemptions' => $p['max_total_redemptions'] ? (int)$p['max_total_redemptions'] : null,
                'currentRedemptions' => (int)$p['current_redemptions'],
                'isActive' => (bool)$p['is_active'],
                'createdAt' => $p['created_at'],
            ];
        }, $programs),
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
    ]);

} elseif ($method === 'POST') {
    $user = requireRole('admin');
    $input = getInput();

    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $triggerProductId = trim($input['triggerProductId'] ?? '');
    $requiredQuantity = (int)($input['requiredQuantity'] ?? 0);
    $rewardProductName = trim($input['rewardProductName'] ?? '');
    $rewardDescription = trim($input['rewardDescription'] ?? '');
    $expiryDate = $input['expiryDate'] ?? null;
    $maxTotalRedemptions = $input['maxTotalRedemptions'] ? (int)$input['maxTotalRedemptions'] : null;

    if (!$name) fail(400, 'Reward name is required');
    if (!$triggerProductId) fail(400, 'Trigger product is required');
    if ($requiredQuantity < 1) fail(400, 'Required quantity must be at least 1');
    if (!$rewardProductName) fail(400, 'Reward product name is required');

    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$triggerProductId]);
    if (!$stmt->fetch()) fail(400, 'Invalid trigger product');

    $stmt = $pdo->prepare("
        INSERT INTO reward_programs (name, description, trigger_product_id, required_quantity, reward_product_name, reward_description, expiry_date, max_total_redemptions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $triggerProductId, $requiredQuantity, $rewardProductName, $rewardDescription, $expiryDate, $maxTotalRedemptions]);

    $id = (int)$pdo->lastInsertId();
    logAudit('create_program', 'reward_program', $id, $user['id'], ['name' => $name]);

    echo json_encode(['success' => true, 'id' => $id]);

} elseif ($method === 'PUT') {
    $user = requireRole('admin');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);

    if (!$id) fail(400, 'Program ID is required');

    $fields = [];
    $params = [];
    $map = [
        'name' => 'name', 'description' => 'description', 'triggerProductId' => 'trigger_product_id',
        'requiredQuantity' => 'required_quantity', 'rewardProductName' => 'reward_product_name',
        'rewardDescription' => 'reward_description', 'expiryDate' => 'expiry_date',
        'maxTotalRedemptions' => 'max_total_redemptions', 'isActive' => 'is_active',
    ];

    foreach ($map as $inputKey => $dbCol) {
        if (array_key_exists($inputKey, $input)) {
            $fields[] = "$dbCol = ?";
            $params[] = $input[$inputKey];
        }
    }

    if (empty($fields)) fail(400, 'No fields to update');

    $params[] = $id;
    $pdo->prepare("UPDATE reward_programs SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);

    logAudit('update_program', 'reward_program', $id, $user['id'], $input);

    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $user = requireRole('admin');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);

    if (!$id) fail(400, 'Program ID is required');

    $pdo->prepare("DELETE FROM reward_programs WHERE id = ?")->execute([$id]);
    logAudit('delete_program', 'reward_program', $id, $user['id']);

    echo json_encode(['success' => true]);

} else {
    fail(405, 'Method not allowed');
}
