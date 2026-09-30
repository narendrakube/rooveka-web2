<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------
// GET /api/orders.php — Fetch all orders for Admin
// -------------------------------------------------------
if ($method === 'GET') {
    try {
        $stmtOrders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmtOrders->fetchAll();

        $stmtItems = $pdo->query("SELECT * FROM order_items");
        $allItems  = $stmtItems->fetchAll();

        $formatted = array_map(function ($ord) use ($allItems) {
            $items = array_values(array_filter($allItems, fn($it) => $it['order_id'] === $ord['order_id']));
            $itemsMapped = array_map(fn($it) => [
                'id'           => $it['product_id'] . '-' . $it['size_label'],
                'productId'    => $it['product_id'],
                'name'         => $it['product_name'],
                'selectedSize' => $it['size_label'],
                'price'        => (float) $it['price'],
                'quantity'     => (int) $it['quantity'],
                'imageTag'     => $it['image_tag'],
            ], $items);

            return [
                'orderId'       => $ord['order_id'],
                'createdAt'     => $ord['created_at'],
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
                'items'         => $itemsMapped,
            ];
        }, $orders);

        http_response_code(200);
        echo json_encode($formatted);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch orders', 'details' => $e->getMessage()]);
    }

// -------------------------------------------------------
// POST /api/orders.php — Create a new customer order
// -------------------------------------------------------
} elseif ($method === 'POST') {
    try {
        $body = json_decode(file_get_contents('php://input'), true);

        $orderId       = $body['orderId']       ?? null;
        $createdAt     = $body['createdAt']     ?? date('d M Y, h:i A');
        $customerName  = $body['customerName']  ?? null;
        $email         = $body['email']         ?? null;
        $phone         = $body['phone']         ?? null;
        $address       = $body['address']       ?? null;
        $city          = $body['city']          ?? null;
        $pincode       = $body['pincode']       ?? null;
        $state         = $body['state']         ?? null;
        $paymentMethod = $body['paymentMethod'] ?? null;
        $subtotal      = $body['subtotal']      ?? 0;
        $shippingCost  = $body['shippingCost']  ?? 0;
        $totalAmount   = $body['totalAmount']   ?? 0;
        $status        = $body['status']        ?? 'Pending';
        $items         = $body['items']         ?? [];

        if (!$orderId || !$customerName || !$email) {
            http_response_code(400);
            echo json_encode(['error' => 'orderId, customerName and email are required']);
            exit();
        }

        // Begin transaction
        $pdo->beginTransaction();

        $stmtOrder = $pdo->prepare("
            INSERT INTO orders 
            (order_id, customer_name, email, phone, address, city, pincode, state, payment_method, subtotal, shipping_cost, total_amount, status, created_at)
            VALUES (:order_id, :customer_name, :email, :phone, :address, :city, :pincode, :state, :payment_method, :subtotal, :shipping_cost, :total_amount, :status, :created_at)
        ");
        $stmtOrder->execute([
            ':order_id'       => $orderId,
            ':customer_name'  => $customerName,
            ':email'          => $email,
            ':phone'          => $phone,
            ':address'        => $address,
            ':city'           => $city,
            ':pincode'        => $pincode,
            ':state'          => $state,
            ':payment_method' => $paymentMethod,
            ':subtotal'       => $subtotal,
            ':shipping_cost'  => $shippingCost,
            ':total_amount'   => $totalAmount,
            ':status'         => $status,
            ':created_at'     => $createdAt,
        ]);

        $stmtItem = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, size_label, quantity, price, image_tag)
            VALUES (:order_id, :product_id, :product_name, :size_label, :quantity, :price, :image_tag)
        ");

        foreach ($items as $item) {
            $stmtItem->execute([
                ':order_id'    => $orderId,
                ':product_id'  => $item['productId']    ?? '',
                ':product_name'=> $item['name']         ?? '',
                ':size_label'  => $item['selectedSize'] ?? '',
                ':quantity'    => $item['quantity']     ?? 1,
                ':price'       => $item['price']        ?? 0,
                ':image_tag'   => $item['imageTag']     ?? '',
            ]);
        }

        $pdo->commit();

        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Order created successfully', 'orderId' => $orderId]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create order', 'details' => $e->getMessage()]);
    }

// -------------------------------------------------------
// PATCH /api/orders.php — Update order status
// Body: { "orderId": "ROOV-123", "status": "Dispatched" }
// -------------------------------------------------------
} elseif ($method === 'PATCH') {
    try {
        $body    = json_decode(file_get_contents('php://input'), true);
        $orderId = $body['orderId'] ?? null;
        $status  = $body['status']  ?? null;

        if (!$orderId || !$status) {
            http_response_code(400);
            echo json_encode(['error' => 'orderId and status are required']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE order_id = :order_id");
        $stmt->execute([':status' => $status, ':order_id' => $orderId]);

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
