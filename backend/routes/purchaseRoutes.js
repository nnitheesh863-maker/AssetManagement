const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Purchase Orders Routes ---
router.get("/purchase-orders", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM purchase_orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/purchase-orders", async (req, res) => {
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

router.put("/purchase-orders/:id", async (req, res) => {
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

router.delete("/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM purchase_orders WHERE id = $1", [id]);
    res.json({ message: "Purchase order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
