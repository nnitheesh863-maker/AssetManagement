const express = require('express');
const router = express.Router();
const { PurchaseOrder, Product, StockLedger } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// --- Purchase Orders Routes ---
router.get("/purchase-orders", authenticateToken, requirePermission("purchase.view"), async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/purchase-orders", authenticateToken, requirePermission("purchase.create"), async (req, res) => {
  try {
    const { id, date, vendor, address, responsible, item, qty, received, status, owner } = req.body;
    
    const newPo = await PurchaseOrder.create({
      id,
      date,
      vendor,
      address,
      responsible,
      item,
      qty: qty || 0,
      received: received || 0,
      status: status || 'Draft',
      owner: owner || req.user.name || ""
    });

    res.status(201).json({ success: true, message: "Purchase order created successfully", data: newPo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/purchase-orders/:id", authenticateToken, requirePermission("purchase.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, vendor, address, responsible, item, qty, received, status, owner } = req.body;

    const existingPo = await PurchaseOrder.findOne({ id });
    if (!existingPo) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    const prevReceived = existingPo.received || 0;
    const newReceived = received !== undefined ? received : prevReceived;
    const newlyReceivedQty = newReceived - prevReceived;

    existingPo.date = date !== undefined ? date : existingPo.date;
    existingPo.vendor = vendor !== undefined ? vendor : existingPo.vendor;
    existingPo.address = address !== undefined ? address : existingPo.address;
    existingPo.responsible = responsible !== undefined ? responsible : existingPo.responsible;
    existingPo.item = item !== undefined ? item : existingPo.item;
    existingPo.qty = qty !== undefined ? qty : existingPo.qty;
    existingPo.received = newReceived;
    existingPo.status = status !== undefined ? status : existingPo.status;
    existingPo.owner = owner !== undefined ? owner : existingPo.owner;

    await existingPo.save();

    if (newlyReceivedQty > 0) {
      let product = await Product.findOne({ name: existingPo.item });
      if (!product) {
        product = await Product.findOne({ id: existingPo.item });
      }

      if (product) {
        const qtyBefore = product.on_hand_qty || 0;
        product.on_hand_qty = qtyBefore + newlyReceivedQty;
        await product.save();

        await StockLedger.create({
          product_id: product.id,
          movement_type: 'PURCHASE_RECEIPT',
          qty_before: qtyBefore,
          qty_after: product.on_hand_qty,
          qty: newlyReceivedQty,
          ref_type: 'PurchaseOrder',
          ref_id: id,
          user: req.user.name || responsible || 'System'
        });
      }
    }

    res.json({ success: true, message: "Purchase order updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/purchase-orders/:id", authenticateToken, requirePermission("purchase.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.findOneAndDelete({ id });
    res.json({ success: true, message: "Purchase order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
