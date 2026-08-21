const express = require('express');
const router = express.Router();
const { Bom } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// --- BOM Templates Routes ---
router.get("/boms", authenticateToken, requirePermission("bom.view"), async (req, res) => {
  try {
    const boms = await Bom.find().sort({ id: -1 });
    const formatted = boms.map(r => ({
      id: r.id,
      reference: r.reference,
      product: r.product,
      qty: parseFloat(r.qty || 0),
      unit: r.unit || "Units",
      components: r.components || [],
      workOrders: r.work_orders || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/boms", authenticateToken, requirePermission("bom.create"), async (req, res) => {
  try {
    const { id, reference, product, qty, unit, components, workOrders } = req.body;
    await Bom.create({
      id,
      reference,
      product,
      qty: qty || 0,
      unit: unit || "Units",
      components: components || [],
      work_orders: workOrders || []
    });
    res.status(201).json({ success: true, message: "BOM template created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/boms/:id", authenticateToken, requirePermission("bom.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, product, qty, unit, components, workOrders } = req.body;
    
    const updateData = {
      reference,
      product,
      qty: qty || 0,
      unit: unit || "Units",
      components: components || [],
      work_orders: workOrders || []
    };
    
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    await Bom.findOneAndUpdate({ id }, updateData);
    res.json({ success: true, message: "BOM template updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/boms/:id", authenticateToken, requirePermission("bom.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    await Bom.findOneAndDelete({ id });
    res.json({ success: true, message: "BOM template deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
