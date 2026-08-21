const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Sales Orders Routes ---
router.get("/sales-orders", async (req, res) => {
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

router.post("/sales-orders", async (req, res) => {
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

router.put("/sales-orders/:id", async (req, res) => {
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

router.delete("/sales-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM sales_orders WHERE id = $1", [id]);
    res.json({ message: "Sales order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
