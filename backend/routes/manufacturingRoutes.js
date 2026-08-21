const express = require('express');
const router = express.Router();
const { ManufacturingOrder, Product, StockLedger, AuditLog, Bom } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const generateId = (prefix, count) => `${prefix}-${String(count + 1).padStart(3, '0')}`;

const logAudit = async (user, action, type, recordId, field = '-', oldVal = '-', newVal = '-') => {
  try {
    const datetime = new Date().toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    await AuditLog.create({ datetime, user, module: 'Manufacturing', type, record_id: recordId, action, field, old_val: oldVal, new_val: newVal });
  } catch (e) { /* non-critical */ }
};

// ====================================================
// MANUFACTURING DASHBOARD ANALYTICS
// ====================================================
router.get('/manufacturing/dashboard', authenticateToken, requirePermission('manufacturing.view'), async (req, res) => {
  try {
    const [orders, products] = await Promise.all([
      ManufacturingOrder.find(),
      Product.find()
    ]);

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM

    // KPI Calculations
    const activeOrders = orders.filter(o => ['Confirmed', 'In Progress', 'Material Checking', 'Ready For Production', 'Quality Check'].includes(o.status));
    const completedThisMonth = orders.filter(o => (o.status === 'Completed' || o.status === 'Done') && (o.date || '').startsWith(thisMonth));
    const completedUnits = completedThisMonth.reduce((s, o) => s + (o.qty || 0), 0);
    const pendingWorkOrders = orders.reduce((s, o) => {
      return s + (o.operations || []).filter(op => op.status === 'Pending' || !op.status).length;
    }, 0);
    const delayedOrders = orders.filter(o =>
      !['Completed', 'Done', 'Cancelled'].includes(o.status) &&
      o.expected_completion && new Date(o.expected_completion) < now
    );
    const totalConsumed = orders.reduce((s, o) => {
      return s + (o.components || []).reduce((cs, c) => cs + (c.consumed || 0), 0);
    }, 0);

    // Production efficiency
    const totalPlanned = orders.filter(o => o.status !== 'Draft').reduce((s, o) => s + (o.qty || 0), 0);
    const totalActual = orders.filter(o => o.status === 'Completed' || o.status === 'Done').reduce((s, o) => s + (o.qty || 0), 0);
    const efficiency = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

    // Status Counts
    const statusCounts = {
      Draft: orders.filter(o => o.status === 'Draft').length,
      Confirmed: orders.filter(o => o.status === 'Confirmed').length,
      'In Progress': orders.filter(o => o.status === 'In Progress').length,
      'Quality Check': orders.filter(o => o.status === 'Quality Check').length,
      Completed: orders.filter(o => o.status === 'Completed' || o.status === 'Done').length,
      Cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };

    // Production trend — last 30 days
    const daysMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
    }
    orders.filter(o => o.status === 'Completed' || o.status === 'Done').forEach(o => {
      if (o.date && daysMap.hasOwnProperty(o.date)) daysMap[o.date] += (o.qty || 0);
    });
    const productionTrend30 = Object.entries(daysMap).map(([date, qty]) => ({
      date, label: date.slice(5).replace('-', '/'), qty
    }));

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 8)
      .map(o => ({
        id: o.id, product: o.product, qty: o.qty, assignee: o.assignee,
        status: o.status, date: o.date, bom: o.bom
      }));

    // Material availability for low-stock products used in active manufacturing
    const materialAlerts = [];
    for (const order of activeOrders) {
      for (const comp of (order.components || [])) {
        const product = products.find(p => p.name === comp.name);
        if (product) {
          const free = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
          if (free < (comp.qty || 0)) {
            materialAlerts.push({
              moId: order.id, material: comp.name,
              required: comp.qty, available: free,
              shortage: (comp.qty || 0) - free
            });
          }
        }
      }
    }

    // Top products by production volume
    const productionMap = {};
    orders.filter(o => o.status === 'Completed' || o.status === 'Done').forEach(o => {
      if (!o.product) return;
      productionMap[o.product] = (productionMap[o.product] || 0) + (o.qty || 0);
    });
    const topProducts = Object.entries(productionMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    res.json({
      kpis: {
        activeOrders: activeOrders.length,
        completedUnits,
        pendingWorkOrders,
        efficiency,
        totalConsumed,
        delayedOrders: delayedOrders.length,
        totalOrders: orders.length
      },
      statusCounts,
      productionTrend7: productionTrend30.slice(-7),
      productionTrend30,
      recentOrders,
      materialAlerts: materialAlerts.slice(0, 8),
      topProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MANUFACTURING ORDERS
// ====================================================
router.get('/manufacturing-orders', authenticateToken, requirePermission('manufacturing.view'), async (req, res) => {
  try {
    const orders = await ManufacturingOrder.find().sort({ _id: -1 });
    // Map work_orders → operations for frontend compat
    const formatted = orders.map(o => ({
      ...o.toObject(),
      operations: o.operations?.length ? o.operations : (o.work_orders || [])
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manufacturing-orders/:id', authenticateToken, requirePermission('manufacturing.view'), async (req, res) => {
  try {
    const order = await ManufacturingOrder.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/manufacturing-orders', authenticateToken, requirePermission('manufacturing.create'), async (req, res) => {
  try {
    const { id, date, product, bom, qty, units, assignee, status, components, operations, expected_completion, notes } = req.body;
    const count = await ManufacturingOrder.countDocuments();
    const moId = id || generateId('MO', count);
    const userName = req.user.name || req.user.login_id;

    const newMo = await ManufacturingOrder.create({
      id: moId, date, product, bom: bom || '',
      qty: qty || 0, units: units || 'Units',
      assignee: assignee || userName,
      status: status || 'Draft',
      components: components || [],
      operations: operations || [],
      expected_completion: expected_completion || '',
      notes: notes || '',
      owner: userName
    });

    await logAudit(userName, 'Created Manufacturing Order', 'Manufacturing Order', moId);
    res.status(201).json({ success: true, message: 'Manufacturing order created', data: newMo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/manufacturing-orders/:id', authenticateToken, requirePermission('manufacturing.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, product, bom, qty, units, assignee, status, components, operations, expected_completion, notes, qualityStatus, qualityNotes } = req.body;

    const existingMo = await ManufacturingOrder.findOne({ id });
    if (!existingMo) return res.status(404).json({ success: false, message: 'Manufacturing order not found' });

    const prevStatus = existingMo.status;
    const newStatus = status !== undefined ? status : prevStatus;
    const userName = req.user.name || req.user.login_id;

    if (date !== undefined) existingMo.date = date;
    if (product !== undefined) existingMo.product = product;
    if (bom !== undefined) existingMo.bom = bom;
    if (qty !== undefined) existingMo.qty = qty;
    if (units !== undefined) existingMo.units = units;
    if (assignee !== undefined) existingMo.assignee = assignee;
    existingMo.status = newStatus;
    if (components !== undefined) existingMo.components = components;
    if (operations !== undefined) existingMo.operations = operations;
    if (expected_completion !== undefined) existingMo.expected_completion = expected_completion;
    if (notes !== undefined) existingMo.notes = notes;
    if (qualityStatus !== undefined) existingMo.quality_status = qualityStatus;
    if (qualityNotes !== undefined) existingMo.quality_notes = qualityNotes;
    await existingMo.save();

    if (newStatus !== prevStatus) {
      await logAudit(userName, `Status: ${prevStatus} → ${newStatus}`, 'Manufacturing Order', id, 'status', prevStatus, newStatus);
    }

    // ON "In Progress": Reserve raw materials
    if (newStatus === 'In Progress' && prevStatus !== 'In Progress') {
      for (const comp of (existingMo.components || [])) {
        const product = await Product.findOne({ name: comp.name });
        if (!product) continue;
        const qty = parseFloat(comp.qty || 0);
        const free = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
        const toReserve = Math.min(qty, free);
        if (toReserve > 0) {
          product.reserved_qty = (product.reserved_qty || 0) + toReserve;
          await product.save();
          await StockLedger.create({
            product_id: product.id, movement_type: 'RESERVATION',
            qty_before: product.on_hand_qty, qty_after: product.on_hand_qty,
            qty: toReserve, ref_type: 'ManufacturingOrder', ref_id: id, user: userName
          });
        }
      }
      await logAudit(userName, 'Production Started — Materials Reserved', 'Manufacturing Order', id);
    }

    // ON "Completed": Consume materials + produce finished goods
    const isCompletedTransition = (newStatus === 'Completed' || newStatus === 'Done') &&
      !['Completed', 'Done'].includes(prevStatus);

    if (isCompletedTransition) {
      // Consume raw materials
      for (const comp of (existingMo.components || [])) {
        const compProd = await Product.findOne({ name: comp.name });
        if (!compProd) continue;
        const qtyToConsume = parseFloat(comp.qty || 0);
        const qtyBefore = compProd.on_hand_qty || 0;
        compProd.on_hand_qty = Math.max(0, qtyBefore - qtyToConsume);
        compProd.reserved_qty = Math.max(0, (compProd.reserved_qty || 0) - qtyToConsume);
        await compProd.save();
        await StockLedger.create({
          product_id: compProd.id, movement_type: 'MANUFACTURING_CONSUMPTION',
          qty_before: qtyBefore, qty_after: compProd.on_hand_qty,
          qty: -qtyToConsume, ref_type: 'ManufacturingOrder', ref_id: id, user: userName
        });
      }
      // Add finished product to inventory
      let finishedProd = await Product.findOne({ name: existingMo.product });
      if (!finishedProd) finishedProd = await Product.findOne({ id: existingMo.product });
      if (finishedProd) {
        const qtyProduced = parseFloat(existingMo.qty || 0);
        const qtyBefore = finishedProd.on_hand_qty || 0;
        finishedProd.on_hand_qty = qtyBefore + qtyProduced;
        await finishedProd.save();
        await StockLedger.create({
          product_id: finishedProd.id, movement_type: 'MANUFACTURING_PRODUCTION',
          qty_before: qtyBefore, qty_after: finishedProd.on_hand_qty,
          qty: qtyProduced, ref_type: 'ManufacturingOrder', ref_id: id, user: userName
        });
      }
      await logAudit(userName, `Production Completed — ${existingMo.qty} units of ${existingMo.product}`, 'Manufacturing Order', id);
    }

    // ON "Cancelled": Release reservations
    if (newStatus === 'Cancelled' && ['Confirmed', 'In Progress', 'Quality Check'].includes(prevStatus)) {
      for (const comp of (existingMo.components || [])) {
        const product = await Product.findOne({ name: comp.name });
        if (!product) continue;
        const qty = parseFloat(comp.qty || 0);
        product.reserved_qty = Math.max(0, (product.reserved_qty || 0) - qty);
        await product.save();
      }
      await logAudit(userName, 'Manufacturing Cancelled — Reservations Released', 'Manufacturing Order', id);
    }

    res.json({ success: true, message: 'Manufacturing order updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/manufacturing-orders/:id', authenticateToken, requirePermission('manufacturing.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturingOrder.findOneAndDelete({ id });
    await logAudit(req.user.name || req.user.login_id, 'Deleted', 'Manufacturing Order', id);
    res.json({ success: true, message: 'Manufacturing order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// MATERIAL AVAILABILITY CHECK
// ====================================================
router.post('/manufacturing/check-materials', authenticateToken, requirePermission('manufacturing.view'), async (req, res) => {
  try {
    const { components } = req.body;
    if (!components?.length) return res.json({ available: true, shortages: [] });

    const shortages = [];
    for (const comp of components) {
      const product = await Product.findOne({ name: comp.name });
      if (!product) {
        shortages.push({ name: comp.name, required: comp.qty, available: 0, shortage: comp.qty, noProduct: true });
        continue;
      }
      const free = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
      if (free < (comp.qty || 0)) {
        shortages.push({ name: comp.name, required: comp.qty, available: free, shortage: (comp.qty || 0) - free });
      }
    }
    res.json({ available: shortages.length === 0, shortages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
