<?php
require_once __DIR__ . '/../config/db.php';

function generateCode(int $length = 12): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

function hashCode(string $code): string {
    return hash('sha256', $code);
}

function generateUid(): string {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        random_int(0, 0xffff), random_int(0, 0xffff),
        random_int(0, 0xffff),
        random_int(0, 0x0fff) | 0x4000,
        random_int(0, 0x3fff) | 0x8000,
        random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
    );
}

function fail(int $code, string $msg, array $extra = []): void {
    http_response_code($code);
    echo json_encode(array_merge(['error' => $msg], $extra));
    exit();
}

function getInput(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function authenticateUser(): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
        return null;
    }
    $token = $m[1];
    global $pdo;
    $stmt = $pdo->prepare("SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = 1");
    $stmt->execute([(int)$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function requireAuth(): array {
    $user = authenticateUser();
    if (!$user) {
        fail(401, 'Authentication required');
    }
    return $user;
}

function requireRole(string $role): array {
    $user = requireAuth();
    if ($user['role'] !== $role) {
        fail(403, 'Insufficient permissions');
    }
    return $user;
}

function checkRateLimit(string $identifier, string $action, int $maxAttempts = 10, int $windowSeconds = 60): bool {
    global $pdo;
    $stmt = $pdo->prepare("SELECT attempts, first_attempt_at FROM rate_limits WHERE identifier = ? AND action_type = ?");
    $stmt->execute([$identifier, $action]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $firstAttempt = strtotime($row['first_attempt_at']);
        if (time() - $firstAttempt < $windowSeconds) {
            if ($row['attempts'] >= $maxAttempts) {
                return false;
            }
            $pdo->prepare("UPDATE rate_limits SET attempts = attempts + 1 WHERE identifier = ? AND action_type = ?")->execute([$identifier, $action]);
        } else {
            $pdo->prepare("UPDATE rate_limits SET attempts = 1, first_attempt_at = NOW() WHERE identifier = ? AND action_type = ?")->execute([$identifier, $action]);
        }
    } else {
        $pdo->prepare("INSERT INTO rate_limits (identifier, action_type, attempts) VALUES (?, ?, 1)")->execute([$identifier, $action]);
    }
    return true;
}

function logAudit(string $action, string $entityType, ?int $entityId, ?int $userId, ?array $details = null, ?string $ip = null): void {
    global $pdo;
    $pdo->prepare("
        INSERT INTO reward_audit_log (action, entity_type, entity_id, user_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
    ")->execute([
        $action,
        $entityType,
        $entityId,
        $userId,
        $details ? json_encode($details) : null,
        $ip ?? ($_SERVER['REMOTE_ADDR'] ?? null)
    ]);
}
