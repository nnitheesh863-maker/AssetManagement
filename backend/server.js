require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

// ----------------- API ENDPOINTS -----------------

// Liveness Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// --- Sales Orders Routes ---
app.get("/api/sales-orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sales_orders ORDER BY id DESC");
    const formatted = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items || "[]"),
      total: parseFloat(r.total || 0)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sales-orders", async (req, res) => {
  try {
    const { id, date, customer, status, salesperson, items, total, owner } = req.body;
    await pool.query(
      `INSERT INTO sales_orders (id, date, customer, status, salesperson, items, total, owner) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, date, customer, status, salesperson, JSON.stringify(items || []), total || 0, owner || ""]
    );
    res.status(201).json({ message: "Sales order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/sales-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, customer, status, salesperson, items, total, owner } = req.body;
    await pool.query(
      `UPDATE sales_orders 
       SET date = $1, customer = $2, status = $3, salesperson = $4, items = $5, total = $6, owner = $7 
       WHERE id = $8`,
      [date, customer, status, salesperson, JSON.stringify(items || []), total || 0, owner || "", id]
    );
    res.json({ message: "Sales order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Start Server & Init DB
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDb();
});
