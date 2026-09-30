<?php
require_once __DIR__ . '/../../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireRole('admin');

if ($method === 'POST') {
    $input = getInput();
    $productId = trim($input['productId'] ?? '');
    $batchLabel = trim($input['batchLabel'] ?? '');
    $quantity = (int)($input['quantity'] ?? 0);
    $status = $input['status'] ?? 'active';
    $expiresAt = $input['expiresAt'] ?? null;

    if (!$productId) fail(400, 'Product is required');
    if ($quantity < 1 || $quantity > 10000) fail(400, 'Quantity must be between 1 and 10000');
    if (!in_array($status, ['generated', 'active'])) fail(400, 'Invalid status');

    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    if (!$stmt->fetch()) fail(400, 'Invalid product');

    if (!$batchLabel) {
        $batchLabel = 'BATCH-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    $pdo->beginTransaction();
    try {
        $codes = [];
        $insertStmt = $pdo->prepare("
            INSERT INTO product_codes (code, code_hash, product_id, batch_label, status, generated_by, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $attempts = 0;
        $inserted = 0;
        while ($inserted < $quantity && $attempts < $quantity * 3) {
            $attempts++;
            $code = generateCode(12);
            $codeHash = hashCode($code);

            try {
                $insertStmt->execute([$code, $codeHash, $productId, $batchLabel, $status, $user['id'], $expiresAt]);
                $codes[] = [
                    'code' => $code,
                    'productId' => $productId,
                    'batchLabel' => $batchLabel,
                ];
                $inserted++;
            } catch (PDOException $e) {
                if (str_contains($e->getMessage(), 'Duplicate')) continue;
                throw $e;
            }
        }

        $pdo->commit();

        logAudit('generate_codes', 'product_code', null, $user['id'], [
            'productId' => $productId,
            'batchLabel' => $batchLabel,
            'quantity' => $inserted,
        ]);

        echo json_encode([
            'success' => true,
            'generated' => $inserted,
            'batchLabel' => $batchLabel,
            'codes' => $codes,
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        fail(500, 'Failed to generate codes', ['details' => $e->getMessage()]);
    }

} elseif ($method === 'GET') {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 30)));
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');
    $productId = $_GET['productId'] ?? '';
    $batchLabel = $_GET['batchLabel'] ?? '';
    $status = $_GET['status'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search) {
        $where .= " AND (pc.code LIKE ? OR pc.batch_label LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if ($productId) { $where .= " AND pc.product_id = ?"; $params[] = $productId; }
    if ($batchLabel) { $where .= " AND pc.batch_label = ?"; $params[] = $batchLabel; }
    if ($status) { $where .= " AND pc.status = ?"; $params[] = $status; }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM product_codes pc $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT pc.*, p.name as product_name
        FROM product_codes pc
        LEFT JOIN products p ON pc.product_id = p.id
        $where
        ORDER BY pc.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $codes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $batchStmt = $pdo->prepare("SELECT batch_label FROM product_codes WHERE batch_label IS NOT NULL GROUP BY batch_label ORDER BY MAX(created_at) DESC");
    $batchStmt->execute();
    $batches = $batchStmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'codes' => array_map(function($c) {
            return [
                'id' => (int)$c['id'],
                'code' => $c['code'],
                'productId' => $c['product_id'],
                'productName' => $c['product_name'] ?? '',
                'batchLabel' => $c['batch_label'],
                'status' => $c['status'],
                'assignedCustomerId' => $c['assigned_customer_id'] ? (int)$c['assigned_customer_id'] : null,
                'redeemedAt' => $c['redeemed_at'],
                'expiresAt' => $c['expires_at'],
                'createdAt' => $c['created_at'],
            ];
        }, $codes),
        'batches' => $batches,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
    ]);

} else {
    fail(405, 'Method not allowed');
}
