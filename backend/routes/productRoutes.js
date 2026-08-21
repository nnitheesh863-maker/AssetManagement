const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Products Routes ---
router.get("/products", async (req, res) => {
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

router.post("/products", async (req, res) => {
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

router.put("/products/:id", async (req, res) => {
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

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
