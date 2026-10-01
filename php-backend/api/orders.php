<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$VALID_STATUSES = ['Pending', 'Dispatched', 'Delivered', 'Cancelled'];
$VALID_PAYMENTS = ['upi', 'card', 'cod'];

// -------------------------------------------------------
// GET /api/orders.php — List all orders (admin only)
// -------------------------------------------------------
if ($method === 'GET') {
    requireRole('admin');
    try {
        $orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC, order_id DESC")->fetchAll();
        $items  = $pdo->query("SELECT * FROM order_items")->fetchAll();

        $itemsByOrder = [];
        foreach ($items as $it) {
            $itemsByOrder[$it['order_id']][] = [
                'id'           => ($it['product_id'] ?? '') . '-' . ($it['size_label'] ?? ''),
                'productId'    => $it['product_id'] ?? '',
                'name'         => $it['product_name'] ?? '',
                'selectedSize' => $it['size_label'] ?? '',
                'price'        => (float) $it['price'],
                'quantity'     => (int) $it['quantity'],
                'imageTag'     => $it['image_tag'] ?? '',
            ];
        }

        $formatted = array_map(function ($ord) use ($itemsByOrder) {
            return [
                'orderId'       => $ord['order_id'],
                'createdAt'     => $ord['created_at'] ? date('d M Y, h:i A', strtotime($ord['created_at'])) : '',
                'customerName'  => $ord['customer_name'],
                'email'         => $ord['email'],
                'phone'         => $ord['phone'],
                'address'       => $ord['address'],
                'city'          => $ord['city'],
                'pincode'       => $ord['pincode'],
                'state'         => $ord['state'],
                'paymentMethod' => $ord['payment_method'],
                'subtotal'      => (float) $ord['subtotal'],
                'shippingCost'  => (float) $ord['shipping_cost'],
                'totalAmount'   => (float) $ord['total_amount'],
                'status'        => $ord['status'],
                'items'         => $itemsByOrder[$ord['order_id']] ?? [],
            ];
        }, $orders);

        http_response_code(200);
        echo json_encode($formatted);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch orders', 'details' => $e->getMessage()]);
    }

// -------------------------------------------------------
// POST /api/orders.php — Create order + items (public checkout)
// -------------------------------------------------------
} elseif ($method === 'POST') {
    $body = getInput();

    $required = ['customerName', 'email', 'phone', 'address', 'city', 'pincode', 'state'];
    $missing  = array_values(array_filter($required, fn($f) => trim((string)($body[$f] ?? '')) === ''));
    if ($missing) {
        fail(400, 'Missing required fields: ' . implode(', ', $missing));
    }

    $paymentMethod = $body['paymentMethod'] ?? '';
    if (!in_array($paymentMethod, $VALID_PAYMENTS, true)) {
        fail(400, 'paymentMethod must be one of: ' . implode(', ', $VALID_PAYMENTS));
    }

    foreach (['subtotal', 'shippingCost', 'totalAmount'] as $f) {
        if (!is_numeric($body[$f] ?? null)) {
            fail(400, "$f must be a number");
        }
    }
    $subtotal     = round((float)$body['subtotal'], 2);
    $shippingCost = round((float)$body['shippingCost'], 2);
    $totalAmount  = round((float)$body['totalAmount'], 2);
    if ($subtotal < 0 || $shippingCost < 0 || $totalAmount < 0) {
        fail(400, 'subtotal, shippingCost and totalAmount must not be negative');
    }
    if (abs(($subtotal + $shippingCost) - $totalAmount) > 0.01) {
        fail(400, 'totalAmount must equal subtotal + shippingCost');
    }

    $items = $body['items'] ?? [];
    if (!is_array($items) || count($items) === 0) {
        fail(400, 'Order must contain at least one item');
    }
    foreach ($items as $i => $item) {
        if (!is_array($item) || trim((string)($item['productId'] ?? '')) === '') {
            fail(400, "Item {$i}: productId is required");
        }
        if (!is_numeric($item['quantity'] ?? null) || (int)$item['quantity'] < 1) {
            fail(400, "Item {$i}: quantity must be at least 1");
        }
        if (!is_numeric($item['price'] ?? null) || (float)$item['price'] < 0) {
            fail(400, "Item {$i}: price must be a non-negative number");
        }
    }

    $orderId = trim((string)($body['orderId'] ?? ''));
    if ($orderId === '') {
        $orderId = 'ROOV-' . str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
    if (strlen($orderId) > 20) {
        fail(400, 'orderId must be at most 20 characters');
    }

    try {
        $pdo->beginTransaction();

        $stmtOrder = $pdo->prepare("
            INSERT INTO orders
            (order_id, customer_name, email, phone, address, city, pincode, state, payment_method, subtotal, shipping_cost, total_amount, status)
            VALUES (:order_id, :customer_name, :email, :phone, :address, :city, :pincode, :state, :payment_method, :subtotal, :shipping_cost, :total_amount, 'Pending')
        ");
        $stmtOrder->execute([
            ':order_id'       => $orderId,
            ':customer_name'  => trim((string)$body['customerName']),
            ':email'          => trim((string)$body['email']),
            ':phone'          => trim((string)$body['phone']),
            ':address'        => trim((string)$body['address']),
            ':city'           => trim((string)$body['city']),
            ':pincode'        => trim((string)$body['pincode']),
            ':state'          => trim((string)$body['state']),
            ':payment_method' => $paymentMethod,
            ':subtotal'       => $subtotal,
            ':shipping_cost'  => $shippingCost,
            ':total_amount'   => $totalAmount,
        ]);

        $stmtItem = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, size_label, quantity, price, image_tag)
            VALUES (:order_id, :product_id, :product_name, :size_label, :quantity, :price, :image_tag)
        ");
        foreach ($items as $item) {
            $stmtItem->execute([
                ':order_id'     => $orderId,
                ':product_id'   => (string)($item['productId'] ?? ''),
                ':product_name' => (string)($item['name'] ?? ''),
                ':size_label'   => (string)($item['selectedSize'] ?? ''),
                ':quantity'     => (int)$item['quantity'],
                ':price'        => round((float)$item['price'], 2),
                ':image_tag'    => (string)($item['imageTag'] ?? ''),
            ]);
        }

        $pdo->commit();

        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Order created successfully', 'orderId' => $orderId]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if (($e->errorInfo[0] ?? null) === '23000') {
            fail(409, "Order $orderId already exists");
        }
        fail(500, 'Failed to create order', ['details' => $e->getMessage()]);
    }

// -------------------------------------------------------
// PATCH /api/orders.php — Update order status (admin only)
// Body: { "orderId": "ROOV-123", "status": "Dispatched" }
// -------------------------------------------------------
} elseif ($method === 'PATCH') {
    requireRole('admin');
    $body    = getInput();
    $orderId = trim((string)($body['orderId'] ?? ''));
    $status  = $body['status'] ?? '';

    if ($orderId === '') {
        fail(400, 'orderId is required');
    }
    if (!in_array($status, $VALID_STATUSES, true)) {
        fail(400, 'status must be one of: ' . implode(', ', $VALID_STATUSES));
    }

    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE order_id = :order_id");
        $stmt->execute([':status' => $status, ':order_id' => $orderId]);

        if ($stmt->rowCount() === 0) {
            $exists = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE order_id = ?");
            $exists->execute([$orderId]);
            if (!$exists->fetchColumn()) {
                fail(404, "Order $orderId not found");
            }
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => "Updated order $orderId status to $status"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update order status', 'details' => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
