const express = require('express');
const router = express.Router();
const { SalesOrder } = require('../models');

// --- Sales Orders Routes ---
router.get("/sales-orders", async (req, res) => {
  try {
    const data = await SalesOrder.find().sort({ id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sales-orders", async (req, res) => {
  try {
    const { id, date, customer, status, salesperson, items, total, owner } = req.body;
    await SalesOrder.create({
      id, date, customer, status, salesperson, 
      items: items || [], 
      total: total || 0, 
      owner: owner || ""
    });
    res.status(201).json({ message: "Sales order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/sales-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, customer, status, salesperson, items, total, owner } = req.body;
    await SalesOrder.findOneAndUpdate(
      { id }, 
      { date, customer, status, salesperson, items: items || [], total: total || 0, owner: owner || "" }
    );
    res.json({ message: "Sales order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/sales-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await SalesOrder.findOneAndDelete({ id });
    res.json({ message: "Sales order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
