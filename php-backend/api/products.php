<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Fetch all active products with sizes & images ─────────────────────
if ($method === 'GET') {
    try {
        // Admin mode: include inactive products too (pass ?admin=1)
        $adminMode = isset($_GET['admin']) && $_GET['admin'] === '1';

        $sql = $adminMode
            ? "SELECT * FROM products ORDER BY name ASC"
            : "SELECT * FROM products WHERE status = 'Active' OR status IS NULL ORDER BY name ASC";

        $stmtProducts = $pdo->query($sql);
        $products = $stmtProducts->fetchAll();

        $stmtSizes = $pdo->query("SELECT * FROM product_sizes");
        $sizes = $stmtSizes->fetchAll();

        $stmtImages = $pdo->query("SELECT * FROM product_images ORDER BY is_primary DESC");
        $allImages = $stmtImages->fetchAll();

        $formatted = array_map(function ($prod) use ($sizes, $allImages) {
            $id = $prod['id'];

            // Sizes for this product
            $prodSizes = array_values(array_filter($sizes, fn($s) => $s['product_id'] === $id));
            $sizesMapped = array_map(fn($s) => [
                'label'     => $s['size_label'],
                'price'     => (float) $s['price'],
                'isPopular' => (bool) $s['is_popular'],
            ], $prodSizes);

            // Uploaded images for this product
            $prodImages = array_values(array_filter($allImages, fn($img) => $img['product_id'] === $id));
            $imageUrls  = array_map(fn($img) => 'http://localhost:8000/' . $img['image_path'], $prodImages);

            // Static ingredient / tasting note data for original 3 products
            $ingredients = match ($id) {
                'rooveka-70-dark'       => ['Andhra Cocoa Beans', 'Cocoa Butter', 'Unrefined Sugar'],
                'rooveka-50-dark'       => ['Andhra Cocoa Beans', 'Cocoa Butter', 'Cane Sugar'],
                'rooveka-hot-chocolate' => ['Pure Andhra Cocoa Flakes', 'Cocoa Powder', 'Unrefined Cane Sugar'],
                default                 => [],
            };
            $tastingNotes = match ($id) {
                'rooveka-70-dark'       => ['Deep Cocoa', 'Dried Plum', 'Toasted Wood', 'Velvet Finish'],
                'rooveka-50-dark'       => ['Soft Caramel', 'Warm Vanilla', 'Creamy Cocoa', 'Gentle Finish'],
                'rooveka-hot-chocolate' => ['Molten Chocolate', 'Creamy Density', 'Warm Cinnamon Note'],
                default                 => [],
            };

            // Tags: parse comma-separated string
            $tags = [];
            if (!empty($prod['tags'])) {
                $tags = array_map('trim', explode(',', $prod['tags']));
            }

            return [
                'id'               => $id,
                'name'             => $prod['name'],
                'slug'             => $prod['slug'] ?? $id,
                'subtitle'         => $prod['subtitle'],
                'shortDescription' => $prod['short_description'],
                'fullDescription'  => $prod['full_description'],
                'cocoaPercentage'  => $prod['cocoa_percentage'],
                'category'         => $prod['category'],
                'bgTheme'          => $prod['bg_theme'],
                'imageTag'         => $prod['image_tag'],
                'sizes'            => $sizesMapped,
                'ingredients'      => $ingredients,
                'tastingNotes'     => $tastingNotes,
                'images'           => $imageUrls,
                'discountPrice'    => $prod['discount_price'] ? (float)$prod['discount_price'] : null,
                'stockQuantity'    => (int)($prod['stock_quantity'] ?? 0),
                'sku'              => $prod['sku'],
                'status'           => $prod['status'] ?? 'Active',
                'tags'             => $tags,
            ];
        }, $products);

        http_response_code(200);
        echo json_encode($formatted);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch products', 'details' => $e->getMessage()]);
    }

// ── PUT: Update a product size price ───────────────────────────────────────
} elseif ($method === 'PUT') {
    try {
        $body      = json_decode(file_get_contents('php://input'), true);
        $id        = $body['id']        ?? null;
        $sizeLabel = $body['sizeLabel'] ?? null;
        $price     = $body['price']     ?? null;

        if (!$id || !$sizeLabel || $price === null) {
            http_response_code(400);
            echo json_encode(['error' => 'id, sizeLabel and price are required']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE product_sizes SET price = :price WHERE product_id = :id AND size_label = :size_label");
        $stmt->execute([':price' => $price, ':id' => $id, ':size_label' => $sizeLabel]);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => "Updated price for $id ($sizeLabel) to ₹$price"]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update price', 'details' => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
