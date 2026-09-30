<?php
require_once __DIR__ . '/../../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// ── Helper: return a JSON error and stop ──────────────────────────────────────
function fail(int $code, string $msg, array $extra = []): void {
    http_response_code($code);
    echo json_encode(array_merge(['error' => $msg], $extra));
    exit();
}

// ── 1. Collect & trim text fields ────────────────────────────────────────────
$name          = trim($_POST['name']          ?? '');
$slug          = trim($_POST['slug']          ?? '');
$description   = trim($_POST['description']   ?? '');
$price         = $_POST['price']              ?? '';
$discountPrice = $_POST['discount_price']     ?? null;
$categoryId    = $_POST['category_id']        ?? '';
$stockQty      = $_POST['stock_quantity']     ?? '';
$sku           = trim($_POST['sku']           ?? '');
$status        = $_POST['status']             ?? 'Active';
$tags          = trim($_POST['tags']          ?? '');
$sizesJson     = $_POST['sizes']              ?? '[]';   // JSON string "[{label,price,isPopular}]"

// ── 2. Server-side validation ─────────────────────────────────────────────────
$errors = [];

if (strlen($name) < 3)        $errors['name']        = 'Product name must be at least 3 characters.';
if ($slug === '')              $errors['slug']        = 'Slug is required.';
if ($description === '')       $errors['description'] = 'Description is required.';
if (!is_numeric($price) || (float)$price <= 0)
                               $errors['price']       = 'Price must be a positive number.';
if ($discountPrice !== null && $discountPrice !== '' && ((float)$discountPrice >= (float)$price))
                               $errors['discount_price'] = 'Discount price must be less than price.';
if ($categoryId === '')        $errors['category_id'] = 'Category is required.';
if (!is_numeric($stockQty) || (int)$stockQty < 0)
                               $errors['stock_quantity'] = 'Stock quantity must be 0 or more.';
if (!in_array($status, ['Active', 'Inactive']))
                               $errors['status']      = 'Invalid status value.';

// Slug uniqueness
if (!isset($errors['slug'])) {
    $chk = $pdo->prepare("SELECT COUNT(*) FROM products WHERE slug = :slug");
    $chk->execute([':slug' => $slug]);
    if ($chk->fetchColumn() > 0) $errors['slug'] = 'This slug is already in use.';
}

// SKU uniqueness (only if provided)
if ($sku !== '') {
    $chk2 = $pdo->prepare("SELECT COUNT(*) FROM products WHERE sku = :sku");
    $chk2->execute([':sku' => $sku]);
    if ($chk2->fetchColumn() > 0) $errors['sku'] = 'This SKU is already in use.';
}

if (!empty($errors)) fail(422, 'Validation failed.', ['fields' => $errors]);

// ── 3. File upload validation ─────────────────────────────────────────────────
$allowedMime  = ['image/jpeg', 'image/png', 'image/webp'];
$maxBytes     = 2 * 1024 * 1024; // 2 MB
$uploadedFiles = $_FILES['images'] ?? null;

$imageFiles = [];
if ($uploadedFiles && isset($uploadedFiles['tmp_name'])) {
    // Normalize single vs multiple file input into array
    $tmpNames  = (array) $uploadedFiles['tmp_name'];
    $names     = (array) $uploadedFiles['name'];
    $sizes     = (array) $uploadedFiles['size'];
    $types     = (array) $uploadedFiles['type'];
    $errors_f  = (array) $uploadedFiles['error'];

    // Filter out empty file slots
    foreach ($tmpNames as $i => $tmp) {
        if ($errors_f[$i] === UPLOAD_ERR_NO_FILE) continue;
        if ($errors_f[$i] !== UPLOAD_ERR_OK)      fail(400, "Upload error on file: {$names[$i]}");
        if ($sizes[$i] > $maxBytes)                fail(400, "File {$names[$i]} exceeds 2 MB limit.");
        $detectedMime = mime_content_type($tmp);
        if (!in_array($detectedMime, $allowedMime)) fail(400, "File {$names[$i]} must be JPG, PNG, or WebP.");
        $imageFiles[] = ['tmp' => $tmp, 'ext' => pathinfo($names[$i], PATHINFO_EXTENSION)];
    }

    if (count($imageFiles) > 5) fail(400, 'Maximum 5 images allowed.');
}

// ── 4. Parse sizes JSON ───────────────────────────────────────────────────────
$sizes = json_decode($sizesJson, true);
if (!is_array($sizes) || empty($sizes)) {
    fail(422, 'At least one size/price variant is required.');
}

// ── 5. Generate a unique product ID from slug ─────────────────────────────────
$productId = $slug . '-' . substr(uniqid(), -6);

// ── 6. Move uploaded images to uploads directory ──────────────────────────────
$uploadDir  = __DIR__ . '/../../../uploads/products/';
$savedPaths = [];
foreach ($imageFiles as $idx => $file) {
    $filename     = uniqid('prod_', true) . '.' . strtolower($file['ext']);
    $destination  = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp'], $destination)) {
        fail(500, "Failed to save uploaded image. Check server write permissions.");
    }
    $savedPaths[] = 'uploads/products/' . $filename;
}

// ── 7. Insert into DB (transaction) ───────────────────────────────────────────
try {
    $pdo->beginTransaction();

    // Insert product
    $stmtProd = $pdo->prepare("
        INSERT INTO products
          (id, name, slug, short_description, full_description, category, cocoa_percentage,
           bg_theme, image_tag, discount_price, stock_quantity, sku, status, tags, category_id)
        VALUES
          (:id, :name, :slug, :short_desc, :full_desc, :category, NULL,
           'cream-beige', 'custom', :discount, :stock, :sku, :status, :tags, :cat_id)
    ");
    // Fetch category name for the legacy `category` text column
    $catRow = $pdo->prepare("SELECT name FROM categories WHERE id = :id");
    $catRow->execute([':id' => $categoryId]);
    $categoryName = $catRow->fetchColumn() ?: 'Other';

    $stmtProd->execute([
        ':id'        => $productId,
        ':name'      => $name,
        ':slug'      => $slug,
        ':short_desc'=> mb_substr($description, 0, 200),
        ':full_desc' => $description,
        ':category'  => $categoryName,
        ':discount'  => ($discountPrice !== '' && $discountPrice !== null) ? (float)$discountPrice : null,
        ':stock'     => (int)$stockQty,
        ':sku'       => $sku !== '' ? $sku : null,
        ':status'    => $status,
        ':tags'      => $tags !== '' ? $tags : null,
        ':cat_id'    => (int)$categoryId,
    ]);

    // Insert size variants
    $stmtSize = $pdo->prepare("
        INSERT INTO product_sizes (product_id, size_label, price, is_popular)
        VALUES (:pid, :label, :price, :popular)
    ");
    foreach ($sizes as $i => $s) {
        $sPrice  = isset($s['price']) ? (float)$s['price'] : 0;
        $sLabel  = trim($s['label'] ?? '');
        $popular = !empty($s['isPopular']) ? 1 : 0;
        if ($sLabel === '' || $sPrice <= 0) continue;
        $stmtSize->execute([
            ':pid'     => $productId,
            ':label'   => $sLabel,
            ':price'   => $sPrice,
            ':popular' => $popular,
        ]);
    }

    // Insert image records
    $stmtImg = $pdo->prepare("
        INSERT INTO product_images (product_id, image_path, is_primary)
        VALUES (:pid, :path, :primary)
    ");
    foreach ($savedPaths as $idx => $path) {
        $stmtImg->execute([
            ':pid'     => $productId,
            ':path'    => $path,
            ':primary' => $idx === 0 ? 1 : 0,
        ]);
    }

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        'success'   => true,
        'productId' => $productId,
        'message'   => "Product \"$name\" created successfully!",
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    // Clean up saved images on DB error
    foreach ($savedPaths as $path) {
        $fullPath = __DIR__ . '/../../../' . $path;
        if (file_exists($fullPath)) unlink($fullPath);
    }
    fail(500, 'Database error while saving product.', ['details' => $e->getMessage()]);
}
?>
