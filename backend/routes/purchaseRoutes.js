const express = require('express');
const router = express.Router();
const { PurchaseOrder, Product, StockLedger, AuditLog, Vendor, GoodsReceipt } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const generateId = (prefix, count) => `${prefix}-${String(count + 1).padStart(3, '0')}`;

const logAudit = async (user, action, type, recordId, field = '-', oldVal = '-', newVal = '-') => {
  try {
    const datetime = new Date().toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    await AuditLog.create({ datetime, user, module: 'Purchase', type, record_id: recordId, action, field, old_val: oldVal, new_val: newVal });
  } catch (e) { /* non-critical */ }
};

// ====================================================
// PURCHASE DASHBOARD ANALYTICS
// ====================================================
router.get('/purchase/dashboard', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const [orders, products, vendors, receipts] = await Promise.all([
      PurchaseOrder.find(),
      Product.find(),
      Vendor.find(),
      GoodsReceipt.find()
    ]);

    const role = req.user.role;
    const userName = req.user.name || req.user.login_id;

    // For purchase users, show all orders (they handle purchasing globally)
    const myOrders = orders;

    const totalPurchaseValue = myOrders
      .filter(o => !['Draft', 'Cancelled'].includes(o.status))
      .reduce((s, o) => s + (o.total || (o.qty || 0) * 0 || 0), 0);

    const statusCounts = {
      Draft: myOrders.filter(o => o.status === 'Draft').length,
      Confirmed: myOrders.filter(o => o.status === 'Confirmed').length,
      'Partially Received': myOrders.filter(o => o.status === 'Partially Received').length,
      'Fully Received': myOrders.filter(o => o.status === 'Fully Received' || o.status === 'Received').length,
      Cancelled: myOrders.filter(o => o.status === 'Cancelled').length,
    };

    // Low stock items needing purchase
    const lowStockItems = products.filter(p =>
      (p.on_hand_qty || 0) < (p.minimum_stock || 0) && p.procurement_type === 'Purchase'
    );

    // Vendor performance
    const vendorMap = {};
    myOrders.forEach(o => {
      if (!o.vendor) return;
      if (!vendorMap[o.vendor]) vendorMap[o.vendor] = { name: o.vendor, orders: 0, completed: 0, value: 0 };
      vendorMap[o.vendor].orders += 1;
      if (o.status === 'Fully Received' || o.status === 'Received') vendorMap[o.vendor].completed += 1;
      vendorMap[o.vendor].value += (o.total || 0);
    });
    const vendorPerformance = Object.values(vendorMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Purchase trend (last 30 days)
    const now = new Date();
    const daysMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
    }
    myOrders.forEach(o => {
      if (o.date && daysMap.hasOwnProperty(o.date)) daysMap[o.date] += (o.total || 0);
    });
    const purchaseTrend30 = Object.entries(daysMap).map(([date, total]) => ({
      date, label: date.slice(5).replace('-', '/'), total
    }));

    // Recent orders
    const recentOrders = [...myOrders]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 8)
      .map(o => ({
        id: o.id, vendor: o.vendor, item: o.item || (o.items?.[0]?.materialName || ''),
        qty: o.qty || (o.items?.[0]?.quantity || 0), total: o.total || 0,
        status: o.status, date: o.date, responsible: o.responsible
      }));

    res.json({
      kpis: {
        totalPurchaseValue,
        totalOrders: myOrders.length,
        pendingDeliveries: statusCounts.Confirmed + statusCounts['Partially Received'],
        activeVendors: vendors.filter(v => v.status === 'Active').length,
        lowStockAlerts: lowStockItems.length,
        completedOrders: statusCounts['Fully Received'],
        draftOrders: statusCounts.Draft
      },
      statusCounts,
      purchaseTrend7: purchaseTrend30.slice(-7),
      purchaseTrend30,
      vendorPerformance,
      recentOrders,
      lowStockItems: lowStockItems.map(p => ({
        id: p.id, name: p.name, onHand: p.on_hand_qty, minimum: p.minimum_stock,
        shortage: (p.minimum_stock || 0) - (p.on_hand_qty || 0), vendor: p.vendor
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// VENDOR ROUTES
// ====================================================
router.get('/vendors', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ created_at: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vendors', authenticateToken, requirePermission('purchase.create'), async (req, res) => {
  try {
    const { company_name, contact_person, phone, email, address, gst_number, payment_terms } = req.body;
    if (!company_name) return res.status(400).json({ success: false, message: 'Company name required' });

    const count = await Vendor.countDocuments();
    const vendor_code = `VND-${String(count + 1).padStart(3, '0')}`;

    // Check duplicate
    const existing = await Vendor.findOne({ company_name: { $regex: new RegExp(`^${company_name.trim()}$`, 'i') } });
    if (existing) return res.status(400).json({ success: false, message: 'Vendor already exists' });

    const vendor = await Vendor.create({ vendor_code, company_name, contact_person, phone, email, address, gst_number, payment_terms });
    const userName = req.user.name || req.user.login_id;
    await logAudit(userName, 'Created', 'Vendor', vendor_code);
    res.status(201).json({ success: true, message: 'Vendor created', data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/vendors/:vendorCode', authenticateToken, requirePermission('purchase.edit'), async (req, res) => {
  try {
    const { vendorCode } = req.params;
    const { company_name, contact_person, phone, email, address, gst_number, payment_terms, status } = req.body;
    const vendor = await Vendor.findOne({ vendor_code: vendorCode });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (company_name) vendor.company_name = company_name;
    if (contact_person !== undefined) vendor.contact_person = contact_person;
    if (phone !== undefined) vendor.phone = phone;
    if (email !== undefined) vendor.email = email;
    if (address !== undefined) vendor.address = address;
    if (gst_number !== undefined) vendor.gst_number = gst_number;
    if (payment_terms !== undefined) vendor.payment_terms = payment_terms;
    if (status !== undefined) vendor.status = status;
    await vendor.save();

    res.json({ success: true, message: 'Vendor updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/vendors/:vendorCode', authenticateToken, requirePermission('purchase.delete'), async (req, res) => {
  try {
    await Vendor.findOneAndDelete({ vendor_code: req.params.vendorCode });
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// PURCHASE ORDER ROUTES
// ====================================================
router.get('/purchase-orders', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/purchase-orders/:id', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/purchase-orders', authenticateToken, requirePermission('purchase.create'), async (req, res) => {
  try {
    const { id, date, vendor, vendor_id, address, responsible, item, qty, received,
      items, total, expected_date, payment_terms, notes, status, owner } = req.body;

    const count = await PurchaseOrder.countDocuments();
    const poId = id || generateId('PO', count);
    const userName = req.user.name || req.user.login_id;

    // Calculate total from items if provided
    const calcTotal = items?.length
      ? items.reduce((s, it) => s + ((it.quantity || 0) * (it.unitPrice || 0)), 0)
      : (total || 0);

    const newPo = await PurchaseOrder.create({
      id: poId, date, vendor, vendor_id: vendor_id || '',
      address, responsible: responsible || userName,
      item: item || (items?.[0]?.materialName || ''),
      qty: qty || (items?.[0]?.quantity || 0),
      received: received || 0,
      items: items || [],
      total: calcTotal,
      expected_date: expected_date || '',
      payment_terms: payment_terms || 'Net 30',
      notes: notes || '',
      status: status || 'Draft',
      owner: owner || userName
    });

    await logAudit(userName, 'Created', 'Purchase Order', poId);

    // Update vendor stats
    if (vendor) {
      await Vendor.findOneAndUpdate(
        { company_name: { $regex: new RegExp(`^${vendor.trim()}$`, 'i') } },
        { $inc: { total_orders: 1 } }, { upsert: false }
      );
    }

    res.status(201).json({ success: true, message: 'Purchase order created', data: newPo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/purchase-orders/:id', authenticateToken, requirePermission('purchase.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, vendor, address, responsible, item, qty, received,
      items, total, expected_date, payment_terms, notes, status, owner } = req.body;

    const existingPo = await PurchaseOrder.findOne({ id });
    if (!existingPo) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    const prevStatus = existingPo.status;
    const prevReceived = existingPo.received || 0;
    const newReceived = received !== undefined ? received : prevReceived;
    const newlyReceivedQty = Math.max(0, newReceived - prevReceived);
    const newStatus = status !== undefined ? status : prevStatus;
    const userName = req.user.name || req.user.login_id;

    if (date !== undefined) existingPo.date = date;
    if (vendor !== undefined) existingPo.vendor = vendor;
    if (address !== undefined) existingPo.address = address;
    if (responsible !== undefined) existingPo.responsible = responsible;
    if (item !== undefined) existingPo.item = item;
    if (qty !== undefined) existingPo.qty = qty;
    existingPo.received = newReceived;
    if (items !== undefined) existingPo.items = items;
    if (total !== undefined) existingPo.total = total;
    if (expected_date !== undefined) existingPo.expected_date = expected_date;
    if (payment_terms !== undefined) existingPo.payment_terms = payment_terms;
    if (notes !== undefined) existingPo.notes = notes;
    existingPo.status = newStatus;
    if (owner !== undefined) existingPo.owner = owner;
    await existingPo.save();

    if (newStatus !== prevStatus) {
      await logAudit(userName, `Status Changed`, 'Purchase Order', id, 'status', prevStatus, newStatus);
    }

    // ON RECEIVE: update inventory stock
    if (newlyReceivedQty > 0 || (newStatus === 'Fully Received' || newStatus === 'Partially Received')) {
      // Update from legacy single item
      if (existingPo.item && newlyReceivedQty > 0) {
        await updateInventory(existingPo.item, newlyReceivedQty, id, userName);
      }
      // Update from items array (if provided)
      if (items?.length) {
        for (const it of items) {
          const thisNewlyReceived = (it.receivedQty || 0) - (it.prevReceivedQty || 0);
          if (thisNewlyReceived > 0) {
            await updateInventory(it.materialName, thisNewlyReceived, id, userName);
          }
        }
      }
      // Update vendor value
      await Vendor.findOneAndUpdate(
        { company_name: { $regex: new RegExp(`^${existingPo.vendor?.trim()}$`, 'i') } },
        { $inc: { total_purchase_value: existingPo.total || 0, completed: newStatus === 'Fully Received' ? 1 : 0 } },
        { upsert: false }
      );
      await logAudit(userName, 'Goods Received', 'Purchase Order', id);
    }

    res.json({ success: true, message: 'Purchase order updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/purchase-orders/:id', authenticateToken, requirePermission('purchase.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.findOneAndDelete({ id });
    await logAudit(req.user.name || req.user.login_id, 'Deleted', 'Purchase Order', id);
    res.json({ success: true, message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// GOODS RECEIPT
// ====================================================
router.post('/purchase-orders/:id/receive', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const { id } = req.params;
    const { receiptItems, notes, qualityStatus } = req.body;
    const userName = req.user.name || req.user.login_id;

    const po = await PurchaseOrder.findOne({ id });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    if (po.status === 'Fully Received' || po.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot receive goods for ${po.status} order` });
    }

    const count = await GoodsReceipt.countDocuments();
    const receiptNumber = generateId('GR', count);

    // Process each item received
    let totalReceived = 0;
    let totalOrdered = 0;
    for (const item of receiptItems) {
      const goodQty = (item.receivedQty || 0) - (item.damagedQty || 0);
      if (goodQty > 0) {
        await updateInventory(item.materialName, goodQty, id, userName);
      }
      totalReceived += (item.receivedQty || 0);
      totalOrdered += (item.orderedQty || 0);
    }

    const receipt = await GoodsReceipt.create({
      receipt_number: receiptNumber,
      purchase_order_id: id,
      vendor: po.vendor,
      items: receiptItems,
      received_by: userName,
      received_date: new Date().toISOString().split('T')[0],
      quality_status: qualityStatus || 'Accepted',
      notes: notes || ''
    });

    // Update PO status
    const newPoStatus = totalReceived >= totalOrdered ? 'Fully Received' : 'Partially Received';
    po.received = (po.received || 0) + totalReceived;
    po.status = newPoStatus;
    await po.save();

    // Update vendor
    if (newPoStatus === 'Fully Received') {
      await Vendor.findOneAndUpdate(
        { company_name: { $regex: new RegExp(`^${po.vendor?.trim()}$`, 'i') } },
        { $inc: { total_purchase_value: po.total || 0 } }, { upsert: false }
      );
    }

    await logAudit(userName, 'Goods Received', 'Purchase Order', id, 'receipt', '-', receiptNumber);

    res.status(201).json({ success: true, message: `Goods received. Receipt: ${receiptNumber}`, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/goods-receipts', authenticateToken, requirePermission('purchase.view'), async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find().sort({ created_at: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// HELPER: Update Inventory on Receipt
// ====================================================
async function updateInventory(productName, qty, poId, userName) {
  if (!productName || qty <= 0) return;
  let product = await Product.findOne({ name: productName });
  if (!product) product = await Product.findOne({ id: productName });
  if (!product) return;

  const qtyBefore = product.on_hand_qty || 0;
  product.on_hand_qty = qtyBefore + qty;
  await product.save();

  await StockLedger.create({
    product_id: product.id,
    movement_type: 'PURCHASE_RECEIPT',
    qty_before: qtyBefore,
    qty_after: product.on_hand_qty,
    qty,
    ref_type: 'PurchaseOrder',
    ref_id: poId,
    user: userName
  });
}

module.exports = router;
