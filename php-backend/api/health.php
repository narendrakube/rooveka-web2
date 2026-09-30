<?php
require_once __DIR__ . '/../config/db.php';

echo json_encode([
    "status" => "ok",
    "message" => "ROOVEKA PHP MySQL API Server is running smoothly!",
    "timestamp" => date("Y-m-d H:i:s")
]);
?>
