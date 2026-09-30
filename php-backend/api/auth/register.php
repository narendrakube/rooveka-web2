<?php
require_once __DIR__ . '/../../helpers/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = getInput();
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $phone = trim($input['phone'] ?? '');

    if (!$name || strlen($name) < 2) fail(400, 'Name must be at least 2 characters');
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail(400, 'Valid email is required');
    if (!$password || strlen($password) < 6) fail(400, 'Password must be at least 6 characters');

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        fail(409, 'Email already registered');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, 'customer')")->execute([$name, $email, $hash, $phone ?: null]);

    $userId = (int)$pdo->lastInsertId();
    logAudit('register', 'user', $userId, $userId);

    echo json_encode([
        'success' => true,
        'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer'],
        'token' => (string)$userId,
    ]);
} else {
    fail(405, 'Method not allowed');
}
