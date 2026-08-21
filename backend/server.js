require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
app.use('/api', userRoutes);
app.use('/api', salesRoutes);

// Initialize Database Tables on Startup
async function initDb() {
  try {
    // 1. Sales Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50),
        customer VARCHAR(255),
        status VARCHAR(50),
        salesperson VARCHAR(255),
        items TEXT,
        total NUMERIC,
        owner VARCHAR(100)
      );
    `);

    // 2. Purchase Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50),
        vendor VARCHAR(255),
        address TEXT,
        responsible VARCHAR(255),
        item VARCHAR(255),
        qty INTEGER,
        received INTEGER,
        status VARCHAR(50),
        owner VARCHAR(100)
      );
    `);

    // 3. Manufacturing Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manufacturing_orders (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(50),
        product VARCHAR(255),
        bom VARCHAR(255),
        qty INTEGER,
        units VARCHAR(50),
        assignee VARCHAR(255),
        status VARCHAR(50),
        components TEXT,
        operations TEXT
      );
    `);

    // 4. Audit Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        datetime VARCHAR(100),
        "user" VARCHAR(255),
        module VARCHAR(50),
        type VARCHAR(100),
        record_id VARCHAR(50),
        action VARCHAR(50),
        field VARCHAR(100),
        old_val TEXT,
        new_val TEXT
      );
    `);
    // 5. Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(100),
        sales_price NUMERIC,
        cost_price NUMERIC
      );
    `);

    // 6. BOM Templates Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boms (
        id VARCHAR(50) PRIMARY KEY,
        reference VARCHAR(50),
        product VARCHAR(255),
        qty NUMERIC,
        unit VARCHAR(50),
        components TEXT,
        work_orders TEXT
      );
    `);

    console.log("Database tables initialized successfully.");

    // --- Database Seeding ---
    const productsCount = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(productsCount.rows[0].count) === 0) {
      console.log("Seeding products...");
      const initialProducts = [
        ['PROD-001', 'Deluxe Oak Dining Table', 'Custom Dining', 1200, 800],
        ['PROD-002', 'Ash Wood Chair Pack', 'Dining Room', 380, 250],
        ['PROD-003', 'Beech Wood Bedframe', 'Bedroom Series', 1100, 750],
        ['PROD-004', 'Cedar Garden Table', 'Patio Series', 720, 480],
        ['PROD-005', 'Cherry Wood Bookshelf', 'Living Room', 950, 620],
        ['PROD-006', 'Birch Coffee Table', 'Living Room', 410, 270],
        ['PROD-007', 'Walnut Sideboard', 'Custom Dining', 1500, 1000],
        ['PROD-008', 'Door Frames', 'Pre-Production', 150, 90],
        ['PROD-009', 'Lighting Frame', 'Assembly Line', 200, 120]
      ];
      for (const p of initialProducts) {
        await pool.query(
          "INSERT INTO products (id, name, category, sales_price, cost_price) VALUES ($1, $2, $3, $4, $5)",
          p
        );
      }
    }

    const bomsCount = await pool.query("SELECT COUNT(*) FROM boms");
    if (parseInt(bomsCount.rows[0].count) === 0) {
      console.log("Seeding BOM templates...");
      const initialBoms = [
        [
          'BOM-000001',
          'DF-01',
          'Door Frames',
          10.0,
          'Units',
          JSON.stringify([
            { id: 1, name: 'Raw Lumber', qty: 15, unit: 'Units' },
            { id: 2, name: 'Wood Glue', qty: 2, unit: 'Units' }
          ]),
          JSON.stringify([
            { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45 },
            { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60 }
          ])
        ],
        [
          'BOM-000002',
          'LF-02',
          'Lighting Frame',
          5.0,
          'Units',
          JSON.stringify([
            { id: 1, name: 'Pendant lights', qty: 5, unit: 'Units' },
            { id: 2, name: 'Drawer handles', qty: 10, unit: 'Units' }
          ]),
          JSON.stringify([
            { id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30 },
            { id: 2, operation: 'Finishing', workCenter: 'Finishing Line', duration: 20 }
          ])
        ]
      ];
      for (const b of initialBoms) {
        await pool.query(
          "INSERT INTO boms (id, reference, product, qty, unit, components, work_orders) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          b
        );
      }
    }

    const salesCount = await pool.query("SELECT COUNT(*) FROM sales_orders");
    if (parseInt(salesCount.rows[0].count) === 0) {
      console.log("Seeding sales orders...");
      const initialSales = [
        [
          'SO-001',
          '2026-08-19',
          'Mahesh Gupta Furniture',
          'Confirmed',
          'Amit Sharma',
          JSON.stringify([{
            product: 'Deluxe Oak Dining Table',
            price: 1200,
            qty: 1,
            delivered: 0,
            address: 'Colaba, Mumbai, 400001'
          }]),
          1200,
          ''
        ],
        [
          'SO-002',
          '2026-08-20',
          'System Administrator Client',
          'Draft',
          'Neha Verma',
          JSON.stringify([{
            product: 'Ash Wood Chair Pack',
            price: 380,
            qty: 2,
            delivered: 0,
            address: 'Colaba, Mumbai, 400001'
          }]),
          760,
          ''
        ]
      ];
      for (const s of initialSales) {
        await pool.query(
          "INSERT INTO sales_orders (id, date, customer, status, salesperson, items, total, owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          s
        );
      }
    }

    const purchaseCount = await pool.query("SELECT COUNT(*) FROM purchase_orders");
    if (parseInt(purchaseCount.rows[0].count) === 0) {
      console.log("Seeding purchase orders...");
      const initialPurchases = [
        [
          'PO-001',
          '2026-08-18',
          'National Timber Traders',
          'Goregaon East, Mumbai, 400063',
          'Ravi Patel',
          'Raw Lumber',
          100,
          100,
          'Fully Received',
          ''
        ],
        [
          'PO-002',
          '2026-08-20',
          'Apex Hardware Supplier',
          'Andheri West, Mumbai, 400053',
          'Meera Singh',
          'Drawer handles',
          250,
          0,
          'Confirmed',
          ''
        ]
      ];
      for (const p of initialPurchases) {
        await pool.query(
          "INSERT INTO purchase_orders (id, date, vendor, address, responsible, item, qty, received, status, owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          p
        );
      }
    }

    const mfgCount = await pool.query("SELECT COUNT(*) FROM manufacturing_orders");
    if (parseInt(mfgCount.rows[0].count) === 0) {
      console.log("Seeding manufacturing orders...");
      const initialMfg = [
        [
          'MO-000001',
          '2026-08-20',
          'Door Frames',
          'BOM-000001',
          10,
          'Units',
          'Amit Sharma',
          'Confirmed',
          JSON.stringify([
            { id: 1, name: 'Raw Lumber', qty: 15, consumed: 0, unit: 'Units' },
            { id: 2, name: 'Wood Glue', qty: 2, consumed: 0, unit: 'Units' }
          ]),
          JSON.stringify([
            { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45, realDuration: 0 },
            { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60, realDuration: 0 }
          ])
        ],
        [
          'MO-000002',
          '2026-08-19',
          'Lighting Frame',
          '',
          5,
          'Units',
          'Neha Verma',
          'Draft',
          JSON.stringify([
            { id: 1, name: 'Pendant lights', qty: 5, consumed: 0, unit: 'Units' }
          ]),
          JSON.stringify([
            { id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30, realDuration: 0 }
          ])
        ]
      ];
      for (const m of initialMfg) {
        await pool.query(
          "INSERT INTO manufacturing_orders (id, date, product, bom, qty, units, assignee, status, components, operations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          m
        );
      }
    }

    const auditCount = await pool.query("SELECT COUNT(*) FROM audit_logs");
    if (parseInt(auditCount.rows[0].count) === 0) {
      console.log("Seeding audit logs...");
      const initialLogs = [
        ['26 May 2026, 11:42 AM', 'Amit Sharma', 'Sales', 'Product', 'PROD-0034', 'Updated', 'Sales Price', '₹120.00', '₹135.00'],
        ['26 May 2026, 11:15 AM', 'Neha Verma', 'Sales', 'Item', 'ITEM-0102', 'Updated', 'Cost Price', '₹80.00', '₹85.00'],
        ['26 May 2026, 10:55 AM', 'Ravi Patel', 'Purchase', 'Purchase Order', 'PO-2026-087', 'Created', '-', '-', '-'],
        ['26 May 2026, 10:20 AM', 'Amit Sharma', 'Purchase', 'Item', 'ITEM-0456', 'Updated', 'Cost Price', '₹45.00', '₹50.00'],
        ['26 May 2026, 09:48 AM', 'Meera Singh', 'BOM', 'BOM', 'BOM-2026-015', 'Created', '-', '-', '-'],
        ['26 May 2026, 09:30 AM', 'Ravi Patel', 'Sales', 'Item', 'ITEM-0102', 'Updated', 'Sales Price', '₹110.00', '₹120.00'],
        ['26 May 2026, 09:10 AM', 'Neha Verma', 'Purchase', 'Product', 'PROD-0021', 'Deleted', '-', '-', '-'],
        ['26 May 2026, 08:45 AM', 'Amit Sharma', 'Manufacturing', 'Manufacturing Order', 'MO-2026-022', 'Updated', 'Demand', '80', '100'],
        ['26 May 2026, 08:30 AM', 'Meera Singh', 'Manufacturing', 'Material Consumption', 'MC-2026-055', 'Updated', 'Consumed Qty', '45', '50']
      ];
      for (const l of initialLogs) {
        await pool.query(
          `INSERT INTO audit_logs (datetime, "user", module, type, record_id, action, field, old_val, new_val) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          l
        );
      }
    }

    // 7. Users Table (Authentication & Management)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        login_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        role VARCHAR(50),
        position VARCHAR(100),
        address TEXT,
        mobile VARCHAR(50),
        password VARCHAR(255),
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log("Seeding users...");
      const initialUsers = [
        ['admin001', 'System Administrator', 'admin@shivfurniture.com', 'System Administrator', 'Admin', 'Mumbai', '+919999999999', 'admin123'],
        ['mahesh_g', 'Mahesh Gupta', 'mahesh@shivfurniture.com', 'User', 'Sales Manager', 'Colaba, Mumbai, 400001', '+918000000000', 'password123'],
        ['nisarg_v', 'Nisarg Verma', 'nisarg@gmail.com', 'User', 'Purchase Head', 'Andheri, Mumbai, 400053', '+919000000001', 'password123'],
        ['sweta_k', 'Sweta Kediva', 'sweta.kediva@kprcas.ac.in', 'User', 'Warehouse Staff', 'Bandra, Mumbai, 400050', '+919000000002', 'password123'],
        ['dinesh_p', 'Dinesh Patel', 'dinesh@gmail.com', 'User', 'Account Manager', 'Dadar, Mumbai, 400014', '+919000000003', 'password123'],
        ['trisha_k', 'Trisha K.', 'trisha@gmail.com', 'User', 'HR Executive', 'Borivali, Mumbai, 400092', '+919000000004', 'password123']
      ];
      for (const u of initialUsers) {
        await pool.query(
          "INSERT INTO users (login_id, name, email, role, position, address, mobile, password, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '')",
          u
        );
      }
    }
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

// ----------------- API ENDPOINTS -----------------

// Liveness Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Sales Orders Routes have been moved to routes/salesRoutes.js

// --- Purchase Orders Routes ---
app.get("/api/purchase-orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM purchase_orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/purchase-orders", async (req, res) => {
  try {
    const { id, date, vendor, address, responsible, item, qty, received, status, owner } = req.body;
    await pool.query(
      `INSERT INTO purchase_orders (id, date, vendor, address, responsible, item, qty, received, status, owner) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, date, vendor, address, responsible, item, qty || 0, received || 0, status, owner || ""]
    );
    res.status(201).json({ message: "Purchase order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, vendor, address, responsible, item, qty, received, status, owner } = req.body;
    await pool.query(
      `UPDATE purchase_orders 
       SET date = $1, vendor = $2, address = $3, responsible = $4, item = $5, qty = $6, received = $7, status = $8, owner = $9 
       WHERE id = $10`,
      [date, vendor, address, responsible, item, qty || 0, received || 0, status, owner || "", id]
    );
    res.json({ message: "Purchase order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM purchase_orders WHERE id = $1", [id]);
    res.json({ message: "Purchase order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Manufacturing Orders Routes ---
app.get("/api/manufacturing-orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM manufacturing_orders ORDER BY id DESC");
    const formatted = rows.map(r => ({
      ...r,
      components: JSON.parse(r.components || "[]"),
      operations: JSON.parse(r.operations || "[]")
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/manufacturing-orders", async (req, res) => {
  try {
    const { id, date, product, bom, qty, units, assignee, status, components, operations } = req.body;
    await pool.query(
      `INSERT INTO manufacturing_orders (id, date, product, bom, qty, units, assignee, status, components, operations) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, date, product, bom, qty || 0, units || "Units", assignee, status, JSON.stringify(components || []), JSON.stringify(operations || [])]
    );
    res.status(201).json({ message: "Manufacturing order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/manufacturing-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, product, bom, qty, units, assignee, status, components, operations } = req.body;
    await pool.query(
      `UPDATE manufacturing_orders 
       SET date = $1, product = $2, bom = $3, qty = $4, units = $5, assignee = $6, status = $7, components = $8, operations = $9 
       WHERE id = $10`,
      [date, product, bom, qty || 0, units || "Units", assignee, status, JSON.stringify(components || []), JSON.stringify(operations || []), id]
    );
    res.json({ message: "Manufacturing order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/manufacturing-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM manufacturing_orders WHERE id = $1", [id]);
    res.json({ message: "Manufacturing order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audit Logs Routes ---
app.get("/api/audit-logs", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM audit_logs ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/audit-logs", async (req, res) => {
  try {
    const { datetime, user, module, type, record_id, action, field, old_val, new_val } = req.body;
    await pool.query(
      `INSERT INTO audit_logs (datetime, "user", module, type, record_id, action, field, old_val, new_val) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [datetime, user, module, type, record_id, action, field || "", old_val || "", new_val || ""]
    );
    res.status(201).json({ message: "Audit log created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/audit-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM audit_logs WHERE id = $1", [id]);
    res.json({ message: "Audit log deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Products Routes ---
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id DESC");
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      salesPrice: parseFloat(r.sales_price || 0),
      costPrice: parseFloat(r.cost_price || 0)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { id, name, category, salesPrice, costPrice } = req.body;
    await pool.query(
      `INSERT INTO products (id, name, category, sales_price, cost_price) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, category, salesPrice || 0, costPrice || 0]
    );
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, salesPrice, costPrice } = req.body;
    await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, sales_price = $3, cost_price = $4 
       WHERE id = $5`,
      [name, category, salesPrice || 0, costPrice || 0, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOM Templates Routes ---
app.get("/api/boms", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM boms ORDER BY id DESC");
    const formatted = rows.map(r => ({
      id: r.id,
      reference: r.reference,
      product: r.product,
      qty: parseFloat(r.qty || 0),
      unit: r.unit || "Units",
      components: JSON.parse(r.components || "[]"),
      workOrders: JSON.parse(r.work_orders || "[]")
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boms", async (req, res) => {
  try {
    const { id, reference, product, qty, unit, components, workOrders } = req.body;
    await pool.query(
      `INSERT INTO boms (id, reference, product, qty, unit, components, work_orders) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, reference, product, qty || 0, unit || "Units", JSON.stringify(components || []), JSON.stringify(workOrders || [])]
    );
    res.status(201).json({ message: "BOM template created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/boms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, product, qty, unit, components, workOrders } = req.body;
    await pool.query(
      `UPDATE boms 
       SET reference = $1, product = $2, qty = $3, unit = $4, components = $5, work_orders = $6 
       WHERE id = $7`,
      [reference, product, qty || 0, unit || "Units", JSON.stringify(components || []), JSON.stringify(workOrders || []), id]
    );
    res.json({ message: "BOM template updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/boms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM boms WHERE id = $1", [id]);
    res.json({ message: "BOM template deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users Management & Authentication Routes have been moved to routes/userRoutes.js

// --- Dashboard Analytics Aggregation Route ---
app.get("/api/dashboard/analytics", async (req, res) => {
  try {
    // Run multiple queries in parallel for fast dashboard loading
    const [salesResult, purchaseResult, mfgResult, productsResult, recentAudits] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue, COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as completed_orders FROM sales_orders
      `),
      pool.query(`
        SELECT COUNT(*) as total_pos, COALESCE(SUM(qty), 0) as items_ordered, COALESCE(SUM(received), 0) as items_received FROM purchase_orders
      `),
      pool.query(`
        SELECT COUNT(*) as active_mfg, COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_mfg FROM manufacturing_orders
      `),
      pool.query(`SELECT COUNT(*) as total_products FROM products`),
      pool.query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10`)
    ]);

    res.json({
      sales: salesResult.rows[0],
      purchases: purchaseResult.rows[0],
      manufacturing: mfgResult.rows[0],
      inventory: productsResult.rows[0],
      recentActivity: recentAudits.rows,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Init DB
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDb();
});
