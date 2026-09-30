<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getInput();
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        fail(400, 'Email and password are required');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail(400, 'Invalid email format');
    }

    $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, is_active, shop_name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        fail(401, 'Invalid email or password');
    }

    if (!$user['is_active']) {
        fail(403, 'Account is disabled');
    }

    $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);

    logAudit('login', 'user', $user['id'], $user['id']);

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'shopName' => $user['shop_name'],
        ],
        'token' => (string)$user['id'],
    ]);
} else {
    fail(405, 'Method not allowed');
}
