<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();

if ($method === 'POST') {
    $input = getInput();
    $redemptionId = (int)($input['redemptionId'] ?? 0);
    $fulfillmentType = $input['fulfillmentType'] ?? '';
    $shippingAddress = trim($input['shippingAddress'] ?? '');

    if (!$redemptionId) fail(400, 'Redemption ID is required');
    if (!in_array($fulfillmentType, ['delivery', 'shop_collection'])) fail(400, 'Invalid fulfillment type');

    if ($fulfillmentType === 'delivery' && !$shippingAddress) {
        fail(400, 'Shipping address is required for delivery');
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM reward_redemptions WHERE id = ? AND customer_id = ? AND status = 'qualified'");
        $stmt->execute([$redemptionId, $user['id']]);
        $redemption = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$redemption) {
            $pdo->rollBack();
            fail(404, 'Reward not found or not eligible');
        }

        $shopVerificationCode = null;
        $shopVerificationHash = null;

        if ($fulfillmentType === 'shop_collection') {
            $shopVerificationCode = generateCode(16);
            $shopVerificationHash = hashCode($shopVerificationCode);
        }

        $pdo->prepare("
            UPDATE reward_redemptions 
            SET fulfillment_type = ?, status = 'pending_fulfillment', 
                shop_verification_code = ?, shop_verification_code_hash = ?,
                shipping_address = ?, shipping_status = ?
            WHERE id = ?
        ")->execute([
            $fulfillmentType,
            $shopVerificationCode,
            $shopVerificationHash,
            $fulfillmentType === 'delivery' ? $shippingAddress : null,
            $fulfillmentType === 'delivery' ? 'pending' : null,
            $redemptionId,
        ]);

        logAudit('choose_fulfillment', 'reward_redemption', $redemptionId, $user['id'], [
            'type' => $fulfillmentType,
        ]);

        $pdo->commit();

        $response = [
            'success' => true,
            'message' => $fulfillmentType === 'delivery' 
                ? 'Reward will be delivered to your address' 
                : 'Show the verification code at any Rooveka shop',
            'fulfillmentType' => $fulfillmentType,
            'status' => 'pending_fulfillment',
        ];

        if ($shopVerificationCode) {
            $response['shopVerificationCode'] = $shopVerificationCode;
            $response['instructions'] = 'Visit any Rooveka shop and share this code with the shopkeeper for verification and gift collection.';
        }

        if ($fulfillmentType === 'delivery') {
            $response['shippingAddress'] = $shippingAddress;
            $response['shippingStatus'] = 'pending';
        }

        echo json_encode($response);

    } catch (PDOException $e) {
        $pdo->rollBack();
        fail(500, 'Failed to update fulfillment preference');
    }

} else {
    fail(405, 'Method not allowed');
}
