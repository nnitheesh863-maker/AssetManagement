const express = require('express');
const router = express.Router();
const { SalesOrder, Product, PurchaseOrder, ManufacturingOrder, StockLedger, Bom } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const generateId = (prefix, count) => {
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
};

// --- Sales Orders Routes ---
router.get("/sales-orders", authenticateToken, requirePermission("sales.view"), async (req, res) => {
  try {
    const data = await SalesOrder.find().sort({ id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sales-orders", authenticateToken, requirePermission("sales.create"), async (req, res) => {
  try {
    const { id, date, customer, status, salesperson, items, total, owner } = req.body;
    const newSo = await SalesOrder.create({
      id, date, customer, status: status || 'Draft', salesperson, 
      items: items || [], 
      total: total || 0, 
      owner: owner || ""
    });
    res.status(201).json({ success: true, message: "Sales order created successfully", data: newSo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/sales-orders/:id", authenticateToken, requirePermission("sales.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, customer, status, salesperson, items, total, owner } = req.body;

    const existingSo = await SalesOrder.findOne({ id });
    if (!existingSo) {
      return res.status(404).json({ success: false, message: "Sales order not found" });
    }

    const prevStatus = existingSo.status;
    const newStatus = status !== undefined ? status : prevStatus;

    existingSo.date = date !== undefined ? date : existingSo.date;
    existingSo.customer = customer !== undefined ? customer : existingSo.customer;
    existingSo.status = newStatus;
    existingSo.salesperson = salesperson !== undefined ? salesperson : existingSo.salesperson;
    existingSo.items = items !== undefined ? items : existingSo.items;
    existingSo.total = total !== undefined ? total : existingSo.total;
    existingSo.owner = owner !== undefined ? owner : existingSo.owner;

    await existingSo.save();

    if (newStatus === 'Confirmed' && prevStatus === 'Draft') {
      const orderItem = existingSo.items[0] || {};
      if (orderItem.product) {
        let product = await Product.findOne({ name: orderItem.product });
        if (!product) {
          product = await Product.findOne({ id: orderItem.product });
        }

        if (product) {
          const qty = parseFloat(orderItem.qty || 1);
          const freeToUse = (product.on_hand_qty || 0) - (product.reserved_qty || 0);

          if (product.procurement_strategy === 'MTO') {
            await triggerProcurement(product, qty, id, req.user.name || salesperson);
          } else {
            if (freeToUse >= qty) {
              product.reserved_qty = (product.reserved_qty || 0) + qty;
              await product.save();

              await StockLedger.create({
                product_id: product.id,
                movement_type: 'RESERVATION',
                qty_before: product.on_hand_qty,
                qty_after: product.on_hand_qty,
                qty: qty,
                ref_type: 'SalesOrder',
                ref_id: id,
                user: req.user.name || salesperson || 'System'
              });
            } else {
              const shortage = qty - freeToUse;
              if (freeToUse > 0) {
                product.reserved_qty = (product.reserved_qty || 0) + freeToUse;
                await product.save();

                await StockLedger.create({
                  product_id: product.id,
                  movement_type: 'RESERVATION',
                  qty_before: product.on_hand_qty,
                  qty_after: product.on_hand_qty,
                  qty: freeToUse,
                  ref_type: 'SalesOrder',
                  ref_id: id,
                  user: req.user.name || salesperson || 'System'
                });
              }

              await triggerProcurement(product, shortage, id, req.user.name || salesperson);
            }
          }
        }
      }
    }

    const isDelivery = (newStatus === 'Delivered' || newStatus === 'Fully Delivered') && (prevStatus !== 'Delivered' && prevStatus !== 'Fully Delivered');
    if (isDelivery) {
      const orderItem = existingSo.items[0] || {};
      if (orderItem.product) {
        let product = await Product.findOne({ name: orderItem.product });
        if (!product) {
          product = await Product.findOne({ id: orderItem.product });
        }

        if (product) {
          const qty = parseFloat(orderItem.qty || 1);
          const qtyBefore = product.on_hand_qty || 0;
          
          product.on_hand_qty = Math.max(0, qtyBefore - qty);
          product.reserved_qty = Math.max(0, (product.reserved_qty || 0) - qty);
          await product.save();

          await StockLedger.create({
            product_id: product.id,
            movement_type: 'SALES_DELIVERY',
            qty_before: qtyBefore,
            qty_after: product.on_hand_qty,
            qty: -qty,
            ref_type: 'SalesOrder',
            ref_id: id,
            user: req.user.name || salesperson || 'System'
          });
        }
      }
    }

    res.json({ success: true, message: "Sales order updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function triggerProcurement(product, qty, salesOrderId, user) {
  const dateStr = new Date().toISOString().split('T')[0];

  if (product.procurement_type === 'Manufacturing') {
    const mfgCount = await ManufacturingOrder.countDocuments();
    const mfgId = generateId('MO', mfgCount);

    let bomComponents = [];
    let bomOperations = [];
    if (product.bom_ref) {
      const bom = await Bom.findOne({ id: product.bom_ref });
      if (bom) {
        bomComponents = bom.components.map(c => ({ name: c.name, qty: c.qty * qty, consumed: 0, unit: c.unit }));
        bomOperations = bom.work_orders.map(w => ({ operation: w.operation, workCenter: w.workCenter, duration: w.duration, realDuration: 0 }));
      }
    } else {
      const bom = await Bom.findOne({ product: product.name });
      if (bom) {
        bomComponents = bom.components.map(c => ({ name: c.name, qty: c.qty * qty, consumed: 0, unit: c.unit }));
        bomOperations = bom.work_orders.map(w => ({ operation: w.operation, workCenter: w.workCenter, duration: w.duration, realDuration: 0 }));
      }
    }

    await ManufacturingOrder.create({
      id: mfgId,
      date: dateStr,
      product: product.name,
      bom: product.bom_ref || '',
      qty,
      units: 'Units',
      assignee: user || 'Automated System',
      status: 'Confirmed',
      components: bomComponents,
      operations: bomOperations
    });

  } else {
    const poCount = await PurchaseOrder.countDocuments();
    const poId = generateId('PO', poCount);

    await PurchaseOrder.create({
      id: poId,
      date: dateStr,
      vendor: product.vendor || 'Preferred Vendor',
      address: 'Mumbai Warehouse',
      responsible: user || 'Automated System',
      item: product.name,
      qty,
      received: 0,
      status: 'Confirmed',
      owner: user || 'Automated System'
    });
  }
}

router.delete("/sales-orders/:id", authenticateToken, requirePermission("sales.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    await SalesOrder.findOneAndDelete({ id });
    res.json({ success: true, message: "Sales order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
