<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------
// GET /api/settings.php — Fetch all store settings
// -------------------------------------------------------
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM settings");
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        http_response_code(200);
        echo json_encode($settings);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch settings', 'details' => $e->getMessage()]);
    }

// -------------------------------------------------------
// PUT /api/settings.php — Update free shipping threshold
// Body: { "threshold": 1299 }
// -------------------------------------------------------
} elseif ($method === 'PUT') {
    try {
        $body      = json_decode(file_get_contents('php://input'), true);
        $threshold = $body['threshold'] ?? null;

        if ($threshold === null) {
            http_response_code(400);
            echo json_encode(['error' => 'threshold value is required']);
            exit();
        }

        $stmt = $pdo->prepare("
            INSERT INTO settings (setting_key, setting_value) VALUES ('free_shipping_threshold', :val)
            ON DUPLICATE KEY UPDATE setting_value = :val
        ");
        $stmt->execute([':val' => (string) $threshold]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => "Updated free shipping threshold to ₹$threshold"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update threshold', 'details' => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
