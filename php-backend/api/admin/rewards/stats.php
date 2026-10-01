<?php
require_once __DIR__ . '/../../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireRole('admin');

if ($method === 'GET') {
    $dateFrom = $_GET['dateFrom'] ?? null;
    $dateTo = $_GET['dateTo'] ?? null;
    $productId = $_GET['productId'] ?? '';
    $programId = $_GET['programId'] ?? '';
    $status = $_GET['status'] ?? '';

    $dateFilter = "";
    $params = [];
    if ($dateFrom) { $dateFilter .= " AND created_at >= ?"; $params[] = $dateFrom; }
    if ($dateTo) { $dateFilter .= " AND created_at <= ?"; $params[] = $dateTo . ' 23:59:59'; }

    // Reward programs
    $stmt = $pdo->query("SELECT COUNT(*) as total, SUM(is_active = 1) as active FROM reward_programs");
    $progStats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Gift Pool coupons (the codes My Rewards verifies against)
    $codeWhere = "WHERE 1=1";
    $codeParams = [];
    if ($productId) { $codeWhere .= " AND product_id = ?"; $codeParams[] = $productId; }
    if ($dateFrom) { $codeWhere .= " AND created_at >= ?"; $codeParams[] = $dateFrom; }
    if ($dateTo) { $codeWhere .= " AND created_at <= ?"; $codeParams[] = $dateTo . ' 23:59:59'; }

    $stmt = $pdo->prepare("SELECT 
        COUNT(*) as total,
        SUM(status = 'active') as active,
        SUM(status = 'inactive') as redeemed,
        SUM(status = 'expired') as expired,
        0 as cancelled
        FROM coupons_pool $codeWhere");
    $stmt->execute($codeParams);
    $codeStats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Redemptions
    $redeemWhere = "WHERE 1=1";
    $redeemParams = [];
    if ($programId) { $redeemWhere .= " AND reward_program_id = ?"; $redeemParams[] = $programId; }
    if ($status) { $redeemWhere .= " AND status = ?"; $redeemParams[] = $status; }
    if ($dateFrom) { $redeemWhere .= " AND created_at >= ?"; $redeemParams[] = $dateFrom; }
    if ($dateTo) { $redeemWhere .= " AND created_at <= ?"; $redeemParams[] = $dateTo . ' 23:59:59'; }

    $stmt = $pdo->prepare("SELECT 
        COUNT(*) as total,
        SUM(status = 'qualified') as qualified,
        SUM(status = 'pending_choice') as pendingChoice,
        SUM(status = 'pending_fulfillment') as pendingFulfillment,
        SUM(status = 'fulfilled') as fulfilled,
        SUM(status = 'redeemed') as redeemed,
        SUM(status = 'cancelled') as cancelled,
        SUM(status = 'expired') as expired,
        SUM(fulfillment_type = 'delivery') as deliveryCount,
        SUM(fulfillment_type = 'shop_collection') as shopCount
        FROM reward_redemptions $redeemWhere");
    $stmt->execute($redeemParams);
    $redeemStats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Shop redemptions
    $shopStmt = $pdo->prepare("SELECT 
        COUNT(*) as total,
        SUM(status = 'redeemed') as completed,
        SUM(status = 'pending_fulfillment') as pending
        FROM reward_redemptions 
        WHERE fulfillment_type = 'shop_collection' " . 
        ($dateFrom ? " AND created_at >= ?" : "") . 
        ($dateTo ? " AND created_at <= ?" : ""));
    $shopParams = array_filter([$dateFrom, $dateTo ? $dateTo . ' 23:59:59' : null]);
    $shopStmt->execute($shopParams);
    $shopStats = $shopStmt->fetch(PDO::FETCH_ASSOC);

    // Products for filter
    $products = $pdo->query("SELECT id, name FROM products ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
    $programs = $pdo->query("SELECT id, name FROM reward_programs ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);

    // Recent activity
    $activity = $pdo->prepare("
        SELECT al.*, u.name as user_name
        FROM reward_audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
    ");
    $activity->execute();
    $recentActivity = $activity->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'programs' => [
            'total' => (int)($progStats['total'] ?? 0),
            'active' => (int)($progStats['active'] ?? 0),
        ],
        'codes' => [
            'total' => (int)($codeStats['total'] ?? 0),
            'active' => (int)($codeStats['active'] ?? 0),
            'redeemed' => (int)($codeStats['redeemed'] ?? 0),
            'expired' => (int)($codeStats['expired'] ?? 0),
            'cancelled' => (int)($codeStats['cancelled'] ?? 0),
        ],
        'redemptions' => [
            'total' => (int)($redeemStats['total'] ?? 0),
            'qualified' => (int)($redeemStats['qualified'] ?? 0),
            'pendingChoice' => (int)($redeemStats['pendingChoice'] ?? 0),
            'pendingFulfillment' => (int)($redeemStats['pendingFulfillment'] ?? 0),
            'fulfilled' => (int)($redeemStats['fulfilled'] ?? 0),
            'redeemed' => (int)($redeemStats['redeemed'] ?? 0),
            'cancelled' => (int)($redeemStats['cancelled'] ?? 0),
            'expired' => (int)($redeemStats['expired'] ?? 0),
            'deliveryCount' => (int)($redeemStats['deliveryCount'] ?? 0),
            'shopCount' => (int)($redeemStats['shopCount'] ?? 0),
        ],
        'shop' => [
            'total' => (int)($shopStats['total'] ?? 0),
            'completed' => (int)($shopStats['completed'] ?? 0),
            'pending' => (int)($shopStats['pending'] ?? 0),
        ],
        'filterOptions' => [
            'products' => $products,
            'programs' => $programs,
        ],
        'recentActivity' => array_map(function($a) {
            return [
                'id' => (int)$a['id'],
                'action' => $a['action'],
                'entityType' => $a['entity_type'],
                'entityId' => $a['entity_id'] ? (int)$a['entity_id'] : null,
                'userName' => $a['user_name'] ?? 'System',
                'details' => $a['details'] ? json_decode($a['details'], true) : null,
                'createdAt' => $a['created_at'],
            ];
        }, $recentActivity),
    ]);

} else {
    fail(405, 'Method not allowed');
}
