const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- BOM Templates Routes ---
router.get("/boms", async (req, res) => {
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

router.post("/boms", async (req, res) => {
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

router.put("/boms/:id", async (req, res) => {
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

router.delete("/boms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM boms WHERE id = $1", [id]);
    res.json({ message: "BOM template deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
