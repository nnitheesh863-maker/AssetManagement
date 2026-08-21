const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Manufacturing Orders Routes ---
router.get("/manufacturing-orders", async (req, res) => {
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

router.post("/manufacturing-orders", async (req, res) => {
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

router.put("/manufacturing-orders/:id", async (req, res) => {
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

router.delete("/manufacturing-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM manufacturing_orders WHERE id = $1", [id]);
    res.json({ message: "Manufacturing order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
