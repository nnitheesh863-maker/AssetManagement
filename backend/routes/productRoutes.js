const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// --- Products Routes ---
router.get("/products", authenticateToken, requirePermission("products.view"), async (req, res) => {
  try {
    const products = await Product.find().sort({ id: -1 });
    const formatted = products.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      salesPrice: parseFloat(r.sales_price || 0),
      costPrice: parseFloat(r.cost_price || 0),
      onHandQty: r.on_hand_qty || 0,
      reservedQty: r.reserved_qty || 0,
      freeToUseQty: (r.on_hand_qty || 0) - (r.reserved_qty || 0),
      minimumStock: r.minimum_stock || 0,
      procurementStrategy: r.procurement_strategy || 'MTS',
      procurementType: r.procurement_type || 'Purchase',
      vendor: r.vendor || '',
      bomRef: r.bom_ref || ''
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products", authenticateToken, requirePermission("products.create"), async (req, res) => {
  try {
    const { 
      id, name, category, salesPrice, costPrice, 
      onHandQty, reservedQty, minimumStock, 
      procurementStrategy, procurementType, vendor, bomRef 
    } = req.body;
    
    await Product.create({
      id, 
      name, 
      category, 
      sales_price: salesPrice || 0, 
      cost_price: costPrice || 0,
      on_hand_qty: onHandQty || 0,
      reserved_qty: reservedQty || 0,
      minimum_stock: minimumStock || 0,
      procurement_strategy: procurementStrategy || 'MTS',
      procurement_type: procurementType || 'Purchase',
      vendor: vendor || '',
      bom_ref: bomRef || ''
    });
    res.status(201).json({ success: true, message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/products/:id", authenticateToken, requirePermission("products.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, category, salesPrice, costPrice, 
      onHandQty, reservedQty, minimumStock, 
      procurementStrategy, procurementType, vendor, bomRef 
    } = req.body;
    
    const updateData = {
      name, 
      category, 
      sales_price: salesPrice, 
      cost_price: costPrice,
      on_hand_qty: onHandQty,
      reserved_qty: reservedQty,
      minimum_stock: minimumStock,
      procurement_strategy: procurementStrategy,
      procurement_type: procurementType,
      vendor,
      bom_ref: bomRef
    };
    
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    await Product.findOneAndUpdate({ id }, updateData);
    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/products/:id", authenticateToken, requirePermission("products.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findOneAndDelete({ id });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
