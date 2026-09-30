<?php
require_once __DIR__ . '/../../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');
    $programId = $_GET['programId'] ?? '';
    $status = $_GET['status'] ?? '';
    $shopId = $_GET['shopId'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search) {
        $where .= " AND (rr.customer_reward_code LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR rp.name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if ($programId) { $where .= " AND rr.reward_program_id = ?"; $params[] = $programId; }
    if ($status) { $where .= " AND rr.status = ?"; $params[] = $status; }
    if ($shopId) { $where .= " AND rr.shop_user_id = ?"; $params[] = $shopId; }

    $countStmt = $pdo->prepare("
        SELECT COUNT(*) FROM reward_redemptions rr
        LEFT JOIN users u ON rr.customer_id = u.id
        LEFT JOIN reward_programs rp ON rr.reward_program_id = rp.id
        $where
    ");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT rr.*, u.name as customer_name, u.email as customer_email,
               rp.name as program_name, rp.reward_product_name,
               su.name as shop_name
        FROM reward_redemptions rr
        LEFT JOIN users u ON rr.customer_id = u.id
        LEFT JOIN reward_programs rp ON rr.reward_program_id = rp.id
        LEFT JOIN users su ON rr.shop_user_id = su.id
        $where
        ORDER BY rr.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $redemptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'redemptions' => array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'redemptionUid' => $r['redemption_uid'],
                'customerId' => (int)$r['customer_id'],
                'customerName' => $r['customer_name'] ?? '',
                'customerEmail' => $r['customer_email'] ?? '',
                'rewardProgramId' => (int)$r['reward_program_id'],
                'programName' => $r['program_name'] ?? '',
                'rewardProductName' => $r['reward_product_name'] ?? '',
                'customerRewardCode' => $r['customer_reward_code'],
                'shopVerificationCode' => $r['shop_verification_code'],
                'fulfillmentType' => $r['fulfillment_type'],
                'status' => $r['status'],
                'shopName' => $r['shop_name'] ?? '',
                'verifiedAt' => $r['verified_at'],
                'handoverAt' => $r['handover_at'],
                'createdAt' => $r['created_at'],
            ];
        }, $redemptions),
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
    ]);

} elseif ($method === 'PATCH') {
    $user = requireRole('admin');
    $input = getInput();
    $id = (int)($input['id'] ?? 0);
    $newStatus = $input['status'] ?? '';

    if (!$id) fail(400, 'Redemption ID is required');
    if (!in_array($newStatus, ['cancelled', 'expired'])) fail(400, 'Invalid status');

    $pdo->prepare("UPDATE reward_redemptions SET status = ? WHERE id = ?")->execute([$newStatus, $id]);
    logAudit("update_redemption_$newStatus", 'reward_redemption', $id, $user['id']);

    echo json_encode(['success' => true]);

} else {
    fail(405, 'Method not allowed');
}
