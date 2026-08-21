const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Product, StockLedger } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// --- Manufacturing Orders Routes ---
router.get("/manufacturing-orders", authenticateToken, requirePermission("manufacturing.view"), async (req, res) => {
  try {
    const orders = await ManufacturingOrder.find().sort({ id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/manufacturing-orders", authenticateToken, requirePermission("manufacturing.create"), async (req, res) => {
  try {
    const { id, date, product, bom, qty, units, assignee, status, components, operations } = req.body;
    
    const newMo = await ManufacturingOrder.create({
      id,
      date,
      product,
      bom,
      qty: qty || 0,
      units: units || 'Units',
      assignee,
      status: status || 'Draft',
      components: components || [],
      operations: operations || []
    });

    res.status(201).json({ success: true, message: "Manufacturing order created successfully", data: newMo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/manufacturing-orders/:id", authenticateToken, requirePermission("manufacturing.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, product, bom, qty, units, assignee, status, components, operations } = req.body;

    const existingMo = await ManufacturingOrder.findOne({ id });
    if (!existingMo) {
      return res.status(404).json({ success: false, message: "Manufacturing order not found" });
    }

    const prevStatus = existingMo.status;
    const newStatus = status !== undefined ? status : prevStatus;

    existingMo.date = date !== undefined ? date : existingMo.date;
    existingMo.product = product !== undefined ? product : existingMo.product;
    existingMo.bom = bom !== undefined ? bom : existingMo.bom;
    existingMo.qty = qty !== undefined ? qty : existingMo.qty;
    existingMo.units = units !== undefined ? units : existingMo.units;
    existingMo.assignee = assignee !== undefined ? assignee : existingMo.assignee;
    existingMo.status = newStatus;
    existingMo.components = components !== undefined ? components : existingMo.components;
    existingMo.operations = operations !== undefined ? operations : existingMo.operations;

    await existingMo.save();

    const isCompletedTransition = (newStatus === 'Completed' || newStatus === 'Done') && (prevStatus !== 'Completed' && prevStatus !== 'Done');

    if (isCompletedTransition) {
      const componentItems = existingMo.components || [];
      for (const comp of componentItems) {
        let compProd = await Product.findOne({ name: comp.name });
        if (!compProd) {
          compProd = await Product.findOne({ id: comp.name });
        }

        if (compProd) {
          const qtyToConsume = parseFloat(comp.qty || 0);
          const qtyBefore = compProd.on_hand_qty || 0;
          compProd.on_hand_qty = Math.max(0, qtyBefore - qtyToConsume);
          await compProd.save();

          await StockLedger.create({
            product_id: compProd.id,
            movement_type: 'MANUFACTURING_CONSUMPTION',
            qty_before: qtyBefore,
            qty_after: compProd.on_hand_qty,
            qty: -qtyToConsume,
            ref_type: 'ManufacturingOrder',
            ref_id: id,
            user: req.user.name || assignee || 'System'
          });
        }
      }

      let finishedProd = await Product.findOne({ name: existingMo.product });
      if (!finishedProd) {
        finishedProd = await Product.findOne({ id: existingMo.product });
      }

      if (finishedProd) {
        const qtyProduced = parseFloat(existingMo.qty || 0);
        const qtyBefore = finishedProd.on_hand_qty || 0;
        finishedProd.on_hand_qty = qtyBefore + qtyProduced;
        await finishedProd.save();

        await StockLedger.create({
          product_id: finishedProd.id,
          movement_type: 'MANUFACTURING_PRODUCTION',
          qty_before: qtyBefore,
          qty_after: finishedProd.on_hand_qty,
          qty: qtyProduced,
          ref_type: 'ManufacturingOrder',
          ref_id: id,
          user: req.user.name || assignee || 'System'
        });
      }
    }

    res.json({ success: true, message: "Manufacturing order updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/manufacturing-orders/:id", authenticateToken, requirePermission("manufacturing.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturingOrder.findOneAndDelete({ id });
    res.json({ success: true, message: "Manufacturing order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
