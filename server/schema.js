import { pool } from './db.js';

export async function initializeSchema() {
  try {
    const connection = await pool.getConnection();

    // 1. Create Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subtitle VARCHAR(150),
        short_description TEXT,
        full_description TEXT,
        category VARCHAR(50),
        cocoa_percentage VARCHAR(10),
        bg_theme VARCHAR(50),
        image_tag VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist on products table (if created manually earlier)
    const [prodCols] = await connection.query('SHOW COLUMNS FROM products');
    const prodColNames = prodCols.map((c) => c.Field);

    if (!prodColNames.includes('full_description')) {
      await connection.query('ALTER TABLE products ADD COLUMN full_description TEXT');
    }
    if (!prodColNames.includes('bg_theme')) {
      await connection.query('ALTER TABLE products ADD COLUMN bg_theme VARCHAR(50)');
    }
    if (!prodColNames.includes('subtitle')) {
      await connection.query('ALTER TABLE products ADD COLUMN subtitle VARCHAR(150)');
    }

    // 2. Create Product Sizes & Prices Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50),
        size_label VARCHAR(20) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        is_popular TINYINT(1) DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_prod_size (product_id, size_label)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist on product_sizes table
    const [sizeCols] = await connection.query('SHOW COLUMNS FROM product_sizes');
    const sizeColNames = sizeCols.map((c) => c.Field);
    if (!sizeColNames.includes('is_popular')) {
      await connection.query('ALTER TABLE product_sizes ADD COLUMN is_popular TINYINT(1) DEFAULT 0');
    }

    // 3. Create Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(30) PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(50) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        state VARCHAR(50) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        shipping_cost DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(30),
        product_id VARCHAR(50),
        product_name VARCHAR(100),
        size_label VARCHAR(20),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_tag VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Settings / Pricing Config Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default settings if not exists
    await connection.query(`
      INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
      ('free_shipping_threshold', '999'),
      ('flat_shipping_fee', '99'),
      ('currency_symbol', '₹');
    `);

    // Seed initial products if empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('🌱 Seeding initial ROOVEKA products and prices into MySQL...');
      
      // Insert Products
      await connection.query(`
        INSERT INTO products (id, name, subtitle, short_description, full_description, category, cocoa_percentage, bg_theme, image_tag) VALUES
        ('rooveka-70-dark', '70% Dark Chocolate', 'Deep & Bold Andhra Origin', 'Deep, bold and naturally intense, crafted for those who love real cocoa character.', 'Crafted from hand-selected cocoa beans harvested in the lush tropical climate of Andhra Pradesh.', 'Tablets', '70%', 'dark-espresso', '70-dark-bar'),
        ('rooveka-50-dark', '50% Dark Chocolate', 'Smooth & Approachable', 'Smooth, balanced and approachable with a gentle cocoa finish.', 'Designed for everyday indulgence. A smoother, more harmonious chocolate with balanced cocoa intensity.', 'Tablets', '50%', 'cream-beige', '50-dark-bar'),
        ('rooveka-hot-chocolate', 'Hot Chocolate', 'Rich Drinking Chocolate', 'Rich drinking chocolate made for slow, comforting cups.', 'Coarsely ground pure dark chocolate flakes made exclusively from single-origin Andhra cocoa beans.', 'Hot Chocolate', NULL, 'cocoa-warm', 'hot-chocolate-canister');
      `);

      // Insert Product Sizes
      await connection.query(`
        INSERT INTO product_sizes (product_id, size_label, price, is_popular) VALUES
        ('rooveka-70-dark', '50g', 345.00, 0),
        ('rooveka-70-dark', '100g', 595.00, 1),
        ('rooveka-50-dark', '50g', 325.00, 0),
        ('rooveka-50-dark', '100g', 565.00, 1),
        ('rooveka-hot-chocolate', '150g', 395.00, 0),
        ('rooveka-hot-chocolate', '300g', 695.00, 1);
      `);

      // Seed Initial Sample Orders
      await connection.query(`
        INSERT IGNORE INTO orders (order_id, customer_name, email, phone, address, city, pincode, state, payment_method, subtotal, shipping_cost, total_amount, status, created_at) VALUES
        ('ROOV-849201', 'Ananya Sharma', 'ananya.s@gmail.com', '+91 98490 12345', 'Flat 402, Jubilee Hills Road No. 36', 'Hyderabad', '500033', 'Telangana', 'upi', 1885.00, 0.00, 1885.00, 'Dispatched', '08 Sep 2026, 02:45 PM'),
        ('ROOV-731940', 'Ravi Kumar', 'ravikumar.ap@yahoo.com', '+91 94401 88234', 'Door 12-4-8, MG Road, Labbipet', 'Vijayawada', '520010', 'Andhra Pradesh', 'card', 565.00, 99.00, 664.00, 'Pending', '08 Sep 2026, 11:15 AM');
      `);

      await connection.query(`
        INSERT IGNORE INTO order_items (order_id, product_id, product_name, size_label, quantity, price, image_tag) VALUES
        ('ROOV-849201', 'rooveka-70-dark', '70% Dark Chocolate', '100g', 2, 595.00, '70-dark-bar'),
        ('ROOV-849201', 'rooveka-hot-chocolate', 'Hot Chocolate', '300g', 1, 695.00, 'hot-chocolate-canister'),
        ('ROOV-731940', 'rooveka-50-dark', '50% Dark Chocolate', '100g', 1, 565.00, '50-dark-bar');
      `);

      console.log('✅ Initial database seed completed!');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Schema initialization error:', error.message);
  }
}
