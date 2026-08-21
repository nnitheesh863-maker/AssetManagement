const express = require('express');
const router = express.Router();
const { SalesOrder, Product, PurchaseOrder, ManufacturingOrder, StockLedger, Bom, AuditLog, Customer } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const generateId = (prefix, count) => {
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
};

const logAudit = async (user, action, module, type, recordId, field = '-', oldVal = '-', newVal = '-') => {
  try {
    const datetime = new Date().toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    await AuditLog.create({ datetime, user, module, type, record_id: recordId, action, field, old_val: oldVal, new_val: newVal });
  } catch (e) { /* non-critical */ }
};

// ======================================================
// SALES DASHBOARD ANALYTICS
// ======================================================
router.get("/sales/dashboard", authenticateToken, requirePermission("sales.view"), async (req, res) => {
  try {
    const [salesOrders, products, customers] = await Promise.all([
      SalesOrder.find(),
      Product.find(),
      Customer.find()
    ]);

    const role = req.user.role;
    const userName = req.user.name || req.user.login_id;

    // My orders (if sales user — filter to their name)
    const myOrders = (role === 'SALES_USER')
      ? salesOrders.filter(o => o.salesperson === userName || o.owner === userName || o.owner === req.user.login_id)
      : salesOrders;

    // Revenue from confirmed/delivered
    const totalRevenue = myOrders
      .filter(o => ['Confirmed', 'Delivered', 'Fully Delivered', 'Partially Delivered'].includes(o.status))
      .reduce((s, o) => s + (o.total || 0), 0);

    // Status counts
    const statusCounts = {
      Draft: myOrders.filter(o => o.status === 'Draft').length,
      Confirmed: myOrders.filter(o => o.status === 'Confirmed').length,
      Delivered: myOrders.filter(o => o.status === 'Delivered' || o.status === 'Fully Delivered').length,
      PartiallyDelivered: myOrders.filter(o => o.status === 'Partially Delivered').length,
      Cancelled: myOrders.filter(o => o.status === 'Cancelled').length,
    };

    // Sales trend — last 30 days grouped by date
    const now = new Date();
    const daysMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
    }
    myOrders.forEach(o => {
      if (o.date && daysMap.hasOwnProperty(o.date)) {
        daysMap[o.date] += (o.total || 0);
      }
    });
    const salesTrend30 = Object.entries(daysMap).map(([date, total]) => ({
      date,
      label: date.slice(5).replace('-', '/'),
      total
    }));
    const salesTrend7 = salesTrend30.slice(-7);

    // Top products by quantity sold (from items arrays)
    const productSales = {};
    myOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Draft').forEach(o => {
      (o.items || []).forEach(item => {
        if (!item.product) return;
        if (!productSales[item.product]) productSales[item.product] = { qty: 0, revenue: 0 };
        productSales[item.product].qty += (item.qty || 0);
        productSales[item.product].revenue += ((item.qty || 0) * (item.price || 0));
      });
    });
    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Recent orders
    const recentOrders = [...myOrders]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 8)
      .map(o => ({
        id: o.id,
        customer: o.customer,
        product: (o.items && o.items[0]) ? o.items[0].product : '',
        total: o.total || 0,
        status: o.status,
        date: o.date,
        salesperson: o.salesperson
      }));

    // Stock availability for product selection
    const stockMap = {};
    products.forEach(p => {
      stockMap[p.name] = {
        id: p.id,
        name: p.name,
        salesPrice: p.sales_price || 0,
        onHand: p.on_hand_qty || 0,
        reserved: p.reserved_qty || 0,
        freeToUse: (p.on_hand_qty || 0) - (p.reserved_qty || 0),
        category: p.category
      };
    });

    res.json({
      kpis: {
        totalRevenue,
        totalOrders: myOrders.length,
        pendingDeliveries: statusCounts.Confirmed + statusCounts.PartiallyDelivered,
        completedOrders: statusCounts.Delivered,
        cancelledOrders: statusCounts.Cancelled,
        draftOrders: statusCounts.Draft,
        totalCustomers: customers.length
      },
      statusCounts,
      salesTrend7,
      salesTrend30,
      topProducts,
      recentOrders,
      stockMap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// CUSTOMERS ROUTES
// ======================================================
router.get("/customers", authenticateToken, requirePermission("sales.view"), async (req, res) => {
  try {
    // Build customers from sales orders + any stored customers
    const [salesOrders, storedCustomers] = await Promise.all([
      SalesOrder.find(),
      Customer.find()
    ]);

    // Aggregate from orders
    const customerMap = {};
    salesOrders.forEach(o => {
      if (!o.customer) return;
      const key = o.customer.toLowerCase().trim();
      if (!customerMap[key]) {
        customerMap[key] = {
          name: o.customer,
          totalOrders: 0,
          totalRevenue: 0,
          lastOrder: o.date || ''
        };
      }
      customerMap[key].totalOrders += 1;
      customerMap[key].totalRevenue += (o.total || 0);
      if ((o.date || '') > customerMap[key].lastOrder) customerMap[key].lastOrder = o.date;
    });

    // Merge stored customer data (phone, email, address)
    const storedMap = {};
    storedCustomers.forEach(c => { storedMap[c.name.toLowerCase().trim()] = c; });

    const merged = Object.values(customerMap).map((c, i) => {
      const stored = storedMap[c.name.toLowerCase().trim()];
      return {
        customer_id: stored ? stored.customer_id : `CUST-${String(i + 1).padStart(3, '0')}`,
        name: c.name,
        phone: stored ? stored.phone : '',
        email: stored ? stored.email : '',
        address: stored ? stored.address : '',
        totalOrders: c.totalOrders,
        totalRevenue: c.totalRevenue,
        lastOrder: c.lastOrder
      };
    });

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/customers", authenticateToken, requirePermission("sales.create"), async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Customer name required' });

    const count = await Customer.countDocuments();
    const customer_id = `CUST-${String(count + 1).padStart(3, '0')}`;

    const existing = await Customer.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      existing.phone = phone || existing.phone;
      existing.email = email || existing.email;
      existing.address = address || existing.address;
      await existing.save();
      return res.json({ success: true, message: 'Customer updated', data: existing });
    }

    const newCustomer = await Customer.create({ customer_id, name, phone, email, address });
    await logAudit(req.user.name || req.user.login_id, 'Created', 'Sales', 'Customer', customer_id);
    res.status(201).json({ success: true, message: 'Customer created', data: newCustomer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// SALES ORDERS ROUTES
// ======================================================
router.get("/sales-orders", authenticateToken, requirePermission("sales.view"), async (req, res) => {
  try {
    const role = req.user.role;
    const userName = req.user.name || req.user.login_id;

    let query = {};
    // Sales users only see their own orders (unless admin/owner)
    if (role === 'SALES_USER') {
      query = { $or: [{ salesperson: userName }, { owner: userName }, { owner: req.user.login_id }] };
    }

    const data = await SalesOrder.find(query).sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sales-orders/:id", authenticateToken, requirePermission("sales.view"), async (req, res) => {
  try {
    const order = await SalesOrder.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/sales-orders", authenticateToken, requirePermission("sales.create"), async (req, res) => {
  try {
    const { id, date, customer, status, salesperson, items, total, owner } = req.body;

    // Stock availability check
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findOne({ name: item.product });
        if (product) {
          const free = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
          if (free < (item.qty || 0) && product.procurement_strategy === 'MTS') {
            // Allow creation, but warn — procurement will trigger on Confirm
          }
        }
      }
    }

    const count = await SalesOrder.countDocuments();
    const orderId = id || generateId('SO', count);

    const newSo = await SalesOrder.create({
      id: orderId, date, customer, status: status || 'Draft', salesperson,
      items: items || [], total: total || 0, owner: owner || req.user.login_id
    });

    await logAudit(req.user.name || req.user.login_id, 'Created', 'Sales', 'Sales Order', orderId);
    res.status(201).json({ success: true, message: "Sales order created", data: newSo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/sales-orders/:id", authenticateToken, requirePermission("sales.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, customer, status, salesperson, items, total, owner } = req.body;

    const existingSo = await SalesOrder.findOne({ id });
    if (!existingSo) return res.status(404).json({ success: false, message: "Sales order not found" });

    const prevStatus = existingSo.status;
    const newStatus = status !== undefined ? status : prevStatus;

    if (date !== undefined) existingSo.date = date;
    if (customer !== undefined) existingSo.customer = customer;
    existingSo.status = newStatus;
    if (salesperson !== undefined) existingSo.salesperson = salesperson;
    if (items !== undefined) existingSo.items = items;
    if (total !== undefined) existingSo.total = total;
    if (owner !== undefined) existingSo.owner = owner;

    await existingSo.save();

    const userName = req.user.name || req.user.login_id;

    // Audit status change
    if (newStatus !== prevStatus) {
      await logAudit(userName, `Status Changed`, 'Sales', 'Sales Order', id, 'status', prevStatus, newStatus);
    }

    // ON CONFIRM: reserve inventory
    if (newStatus === 'Confirmed' && prevStatus === 'Draft') {
      for (const orderItem of (existingSo.items || [])) {
        let product = await Product.findOne({ name: orderItem.product });
        if (!product) continue;
        const qty = parseFloat(orderItem.qty || 1);
        const freeToUse = (product.on_hand_qty || 0) - (product.reserved_qty || 0);

        if (product.procurement_strategy === 'MTO') {
          await triggerProcurement(product, qty, id, userName);
        } else {
          if (freeToUse >= qty) {
            product.reserved_qty = (product.reserved_qty || 0) + qty;
            await product.save();
            await StockLedger.create({
              product_id: product.id, movement_type: 'RESERVATION',
              qty_before: product.on_hand_qty, qty_after: product.on_hand_qty,
              qty, ref_type: 'SalesOrder', ref_id: id, user: userName
            });
          } else {
            const shortage = qty - freeToUse;
            if (freeToUse > 0) {
              product.reserved_qty = (product.reserved_qty || 0) + freeToUse;
              await product.save();
              await StockLedger.create({
                product_id: product.id, movement_type: 'RESERVATION',
                qty_before: product.on_hand_qty, qty_after: product.on_hand_qty,
                qty: freeToUse, ref_type: 'SalesOrder', ref_id: id, user: userName
              });
            }
            await triggerProcurement(product, shortage, id, userName);
          }
        }
      }
      // Update customer totals
      await updateCustomerTotals(existingSo.customer, total || existingSo.total);
    }

    // ON DELIVER: deduct stock
    const deliveredStatuses = ['Delivered', 'Fully Delivered'];
    if (deliveredStatuses.includes(newStatus) && !deliveredStatuses.includes(prevStatus)) {
      for (const orderItem of (existingSo.items || [])) {
        let product = await Product.findOne({ name: orderItem.product });
        if (!product) continue;
        const qty = parseFloat(orderItem.qty || 1);
        const qtyBefore = product.on_hand_qty || 0;
        product.on_hand_qty = Math.max(0, qtyBefore - qty);
        product.reserved_qty = Math.max(0, (product.reserved_qty || 0) - qty);
        await product.save();
        await StockLedger.create({
          product_id: product.id, movement_type: 'SALES_DELIVERY',
          qty_before: qtyBefore, qty_after: product.on_hand_qty,
          qty: -qty, ref_type: 'SalesOrder', ref_id: id, user: userName
        });
      }
    }

    // ON CANCEL: release reservations
    if (newStatus === 'Cancelled' && (prevStatus === 'Confirmed' || prevStatus === 'Partially Delivered')) {
      for (const orderItem of (existingSo.items || [])) {
        let product = await Product.findOne({ name: orderItem.product });
        if (!product) continue;
        const qty = parseFloat(orderItem.qty || 1);
        product.reserved_qty = Math.max(0, (product.reserved_qty || 0) - qty);
        await product.save();
        await StockLedger.create({
          product_id: product.id, movement_type: 'RELEASE',
          qty_before: product.on_hand_qty, qty_after: product.on_hand_qty,
          qty: -qty, ref_type: 'SalesOrder', ref_id: id, user: userName
        });
      }
    }

    res.json({ success: true, message: "Sales order updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/sales-orders/:id", authenticateToken, requirePermission("sales.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    await SalesOrder.findOneAndDelete({ id });
    await logAudit(req.user.name || req.user.login_id, 'Deleted', 'Sales', 'Sales Order', id);
    res.json({ success: true, message: "Sales order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// HELPERS
// ======================================================
async function triggerProcurement(product, qty, salesOrderId, user) {
  const dateStr = new Date().toISOString().split('T')[0];

  if (product.procurement_type === 'Manufacturing') {
    const mfgCount = await ManufacturingOrder.countDocuments();
    const mfgId = generateId('MO', mfgCount);
    let bomComponents = [], bomOperations = [];
    const bom = await Bom.findOne({ $or: [{ id: product.bom_ref }, { product: product.name }] });
    if (bom) {
      bomComponents = bom.components.map(c => ({ name: c.name, qty: c.qty * qty, consumed: 0, unit: c.unit }));
      bomOperations = bom.work_orders.map(w => ({ operation: w.operation, workCenter: w.workCenter, duration: w.duration, realDuration: 0 }));
    }
    await ManufacturingOrder.create({
      id: mfgId, date: dateStr, product: product.name, bom: product.bom_ref || '',
      qty, units: 'Units', assignee: user || 'Automated System',
      status: 'Confirmed', components: bomComponents, operations: bomOperations
    });
  } else {
    const poCount = await PurchaseOrder.countDocuments();
    const poId = generateId('PO', poCount);
    await PurchaseOrder.create({
      id: poId, date: dateStr, vendor: product.vendor || 'Preferred Vendor',
      address: 'Mumbai Warehouse', responsible: user || 'Automated System',
      item: product.name, qty, received: 0, status: 'Confirmed', owner: user || 'System'
    });
  }
}

async function updateCustomerTotals(customerName, orderTotal) {
  try {
    await Customer.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${customerName}$`, 'i') } },
      { $inc: { total_orders: 1, total_revenue: orderTotal || 0 } },
      { upsert: false }
    );
  } catch (e) { /* non-critical */ }
}

module.exports = router;
