import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from './db.js';
import { initializeSchema } from './schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend assets from dist directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Initialize DB Connection & Tables
await testConnection();
await initializeSchema();

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ROOVEKA Express MySQL API Server is running smoothly!' });
});

// ============================================================================
// 1. PRODUCTS & PRICING ENDPOINTS
// ============================================================================

// GET /api/products - Fetch all products with size options and prices
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    const [sizes] = await pool.query('SELECT * FROM product_sizes');

    const formatted = products.map((prod) => {
      const prodSizes = sizes
        .filter((s) => s.product_id === prod.id)
        .map((s) => ({
          label: s.size_label,
          price: parseFloat(s.price),
          isPopular: !!s.is_popular,
        }));

      return {
        id: prod.id,
        name: prod.name,
        subtitle: prod.subtitle,
        shortDescription: prod.short_description,
        fullDescription: prod.full_description,
        cocoaPercentage: prod.cocoa_percentage,
        category: prod.category,
        sizes: prodSizes,
        ingredients: prod.id === 'rooveka-70-dark' ? ['Andhra Cocoa Beans', 'Cocoa Butter', 'Unrefined Sugar'] :
                     prod.id === 'rooveka-50-dark' ? ['Andhra Cocoa Beans', 'Cocoa Butter', 'Cane Sugar'] :
                     ['Pure Andhra Cocoa Flakes', 'Cocoa Powder', 'Unrefined Cane Sugar'],
        tastingNotes: prod.id === 'rooveka-70-dark' ? ['Deep Cocoa', 'Dried Plum', 'Toasted Wood', 'Velvet Finish'] :
                      prod.id === 'rooveka-50-dark' ? ['Soft Caramel', 'Warm Vanilla', 'Creamy Cocoa', 'Gentle Finish'] :
                      ['Molten Chocolate', 'Creamy Density', 'Warm Cinnamon Note'],
        bgTheme: prod.bg_theme,
        imageTag: prod.image_tag,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});

// PUT /api/products/:id/price - Update price for a product size variant
app.put('/api/products/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { sizeLabel, price } = req.body;

    if (!sizeLabel || price === undefined) {
      return res.status(400).json({ error: 'sizeLabel and price are required' });
    }

    await pool.query(
      'UPDATE product_sizes SET price = ? WHERE product_id = ? AND size_label = ?',
      [price, id, sizeLabel]
    );

    res.json({ success: true, message: `Updated price for ${id} (${sizeLabel}) to ₹${price}` });
  } catch (err) {
    console.error('Error updating price:', err);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// ============================================================================
// 2. ORDERS ENDPOINTS
// ============================================================================

// GET /api/orders - Fetch all orders with item details for Admin Dashboard
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const [items] = await pool.query('SELECT * FROM order_items');

    const formattedOrders = orders.map((ord) => {
      const orderItems = items
        .filter((it) => it.order_id === ord.order_id)
        .map((it) => ({
          id: `${it.product_id}-${it.size_label}`,
          productId: it.product_id,
          name: it.product_name,
          selectedSize: it.size_label,
          price: parseFloat(it.price),
          quantity: it.quantity,
          imageTag: it.image_tag,
        }));

      return {
        orderId: ord.order_id,
        createdAt: ord.created_at,
        customerName: ord.customer_name,
        email: ord.email,
        phone: ord.phone,
        address: ord.address,
        city: ord.city,
        pincode: ord.pincode,
        state: ord.state,
        paymentMethod: ord.payment_method,
        subtotal: parseFloat(ord.subtotal),
        shippingCost: parseFloat(ord.shipping_cost),
        totalAmount: parseFloat(ord.total_amount),
        status: ord.status,
        items: orderItems,
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a new customer order upon checkout
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      orderId,
      createdAt,
      customerName,
      email,
      phone,
      address,
      city,
      pincode,
      state,
      paymentMethod,
      subtotal,
      shippingCost,
      totalAmount,
      status,
      items,
    } = req.body;

    // Insert Order Record
    await connection.query(
      `INSERT INTO orders 
      (order_id, customer_name, email, phone, address, city, pincode, state, payment_method, subtotal, shipping_cost, total_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName,
        email,
        phone,
        address,
        city,
        pincode,
        state,
        paymentMethod,
        subtotal,
        shippingCost,
        totalAmount,
        status || 'Pending',
        createdAt,
      ]
    );

    // Insert Order Items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items 
        (order_id, product_id, product_name, size_label, quantity, price, image_tag)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.selectedSize,
          item.quantity,
          item.price,
          item.imageTag,
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Order created successfully', orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// PATCH /api/orders/:id/status - Update order status (Pending, Dispatched, Delivered, Cancelled)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id]);
    res.json({ success: true, message: `Updated order ${id} status to ${status}` });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ============================================================================
// 3. SETTINGS & PRICING CONFIG ENDPOINTS
// ============================================================================

// GET /api/settings - Fetch store settings
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/shipping-threshold - Update free shipping threshold
app.put('/api/settings/shipping-threshold', async (req, res) => {
  try {
    const { threshold } = req.body;
    await pool.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES ("free_shipping_threshold", ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [String(threshold), String(threshold)]
    );
    res.json({ success: true, message: `Updated free shipping threshold to ₹${threshold}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update threshold' });
  }
});

// Wildcard Route Handler to serve index.html for all frontend pages
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 ROOVEKA Express MySQL Server running on http://localhost:${PORT}`);
});
