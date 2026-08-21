const express = require('express');
const router = express.Router();
const { SalesOrder, PurchaseOrder, ManufacturingOrder, Product, User, AuditLog } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// --- Dashboard Analytics Aggregation Route ---
router.get("/dashboard/analytics", authenticateToken, async (req, res) => {
  try {
    const role = req.user.role || 'PENDING';
    
    // Fetch datasets in parallel
    const [
      products,
      salesOrders,
      purchaseOrders,
      mfgOrders,
      users,
      recentAudits
    ] = await Promise.all([
      Product.find(),
      SalesOrder.find(),
      PurchaseOrder.find(),
      ManufacturingOrder.find(),
      User.find(),
      AuditLog.find().sort({ _id: -1 }).limit(10)
    ]);

    // Calculations
    const lowStockItems = products.filter(p => (p.on_hand_qty || 0) < (p.minimum_stock || 0));
    
    const totalRevenue = salesOrders
      .filter(so => so.status === 'Confirmed' || so.status === 'Delivered' || so.status === 'Fully Delivered')
      .reduce((sum, so) => sum + (so.total || 0), 0);

    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.on_hand_qty || 0) * (p.cost_price || 0)), 0);

    // Sales charts: last 7 days daily total
    const datesMap = {};
    salesOrders.forEach(so => {
      if (!so.date) return;
      datesMap[so.date] = (datesMap[so.date] || 0) + (so.total || 0);
    });
    
    const sortedDates = Object.keys(datesMap).sort();
    const latestSalesTrend = sortedDates.slice(-7).map(d => ({
      label: d.slice(5).replace('-', '/'),
      fullDate: d,
      total: datesMap[d] || 0
    }));

    // Status counts for sales orders (donut chart)
    const orderStatusCounts = {
      Delivered: salesOrders.filter(so => so.status === 'Delivered' || so.status === 'Fully Delivered').length,
      Confirmed: salesOrders.filter(so => so.status === 'Confirmed').length,
      Late: salesOrders.filter(so => so.status === 'Late').length,
      Pending: salesOrders.filter(so => so.status === 'Pending' || so.status === 'Draft').length
    };

    const payload = {
      role,
      user: {
        name: req.user.name,
        email: req.user.email,
        loginId: req.user.login_id
      },
      timestamp: new Date()
    };

    // Role-specific payload generation
    // Unified general operational metrics
    payload.kpis = {
      totalSales: totalRevenue,
      salesOrdersCount: salesOrders.length,
      purchaseOrdersCount: purchaseOrders.length,
      manufacturingOrdersCount: mfgOrders.length,
      lowStockCount: lowStockItems.length,
      inventoryValue: totalInventoryValue,
      activeUsersCount: users.filter(u => u.status === 'ACTIVE').length,
      pendingUsersCount: users.filter(u => u.status === 'PENDING').length
    };
    payload.charts = {
      salesTrend: latestSalesTrend,
      orderStatus: orderStatusCounts
    };
    payload.recentActivity = recentAudits.map(log => ({
      id: log._id,
      text: `${log.user} ${log.action.toLowerCase()} ${log.module} ${log.record_id}`,
      time: log.datetime
    }));
    payload.lowStockAlerts = lowStockItems.map(p => ({
      id: p.id,
      name: p.name,
      available: p.on_hand_qty,
      minimum: p.minimum_stock,
      shortage: (p.minimum_stock || 0) - (p.on_hand_qty || 0)
    }));
    payload.procurementReqs = lowStockItems.map(p => ({
      name: p.name,
      shortage: (p.minimum_stock || 0) - (p.on_hand_qty || 0),
      type: p.procurement_type || 'Purchase'
    }));

    // Add role-specific details
    if (role === 'SALES_USER') {
      const myOrders = salesOrders.filter(so => so.salesperson === req.user.name || so.owner === req.user.name);
      payload.kpis.mySalesOrdersCount = myOrders.length;
      payload.kpis.pendingOrdersCount = myOrders.filter(so => so.status === 'Draft' || so.status === 'Pending').length;
      payload.kpis.confirmedOrdersCount = myOrders.filter(so => so.status === 'Confirmed').length;
      payload.kpis.deliveredOrdersCount = myOrders.filter(so => so.status === 'Delivered' || so.status === 'Fully Delivered').length;
      payload.kpis.availableProductsCount = products.filter(p => (p.on_hand_qty - p.reserved_qty) > 0).length;
      
      payload.recentOrders = myOrders.slice(0, 5).map(o => ({
        id: o.id,
        customer: o.customer,
        status: o.status,
        total: o.total,
        date: o.date
      }));
      payload.stockAvailability = products.slice(0, 8).map(p => ({
        id: p.id,
        name: p.name,
        available: (p.on_hand_qty || 0) - (p.reserved_qty || 0)
      }));
    } else if (role === 'PURCHASE_USER') {
      const pendingPurchases = purchaseOrders.filter(po => po.status !== 'Fully Received' && po.status !== 'Received' && po.status !== 'Done');
      payload.kpis.pendingPurchasesCount = pendingPurchases.length;
      payload.kpis.receivedCount = purchaseOrders.filter(po => po.status === 'Fully Received' || po.status === 'Received' || po.status === 'Done').length;
      payload.kpis.suppliersCount = [...new Set(purchaseOrders.map(po => po.vendor))].length;
      
      payload.recentPurchases = purchaseOrders.slice(0, 5).map(po => ({
        id: po.id,
        vendor: po.vendor,
        item: po.item,
        qty: po.qty,
        status: po.status
      }));
    } else if (role === 'MANUFACTURING_USER') {
      payload.kpis.mfgOrdersCount = mfgOrders.length;
      payload.kpis.inProgressCount = mfgOrders.filter(mo => mo.status === 'In Progress').length;
      payload.kpis.pendingWorkCount = mfgOrders.filter(mo => mo.status === 'Confirmed' || mo.status === 'Draft').length;
      payload.kpis.completedCount = mfgOrders.filter(mo => mo.status === 'Completed' || mo.status === 'Done').length;
      
      payload.pipeline = mfgOrders.slice(0, 5).map(mo => ({
        id: mo.id,
        product: mo.product,
        qty: mo.qty,
        status: mo.status,
        assignee: mo.assignee
      }));
      payload.materialShortages = lowStockItems
        .filter(p => p.procurement_type === 'Manufacturing')
        .map(p => ({
          name: p.name,
          shortage: (p.minimum_stock || 0) - (p.on_hand_qty || 0)
        }));
    } else if (role === 'INVENTORY_MANAGER') {
      payload.kpis.totalProducts = products.length;
      payload.kpis.totalOnHand = products.reduce((sum, p) => sum + (p.on_hand_qty || 0), 0);
      payload.kpis.totalReserved = products.reduce((sum, p) => sum + (p.reserved_qty || 0), 0);
      payload.kpis.freeToUse = products.reduce((sum, p) => sum + ((p.on_hand_qty || 0) - (p.reserved_qty || 0)), 0);
      
      payload.inventoryList = products.slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        onHand: p.on_hand_qty,
        reserved: p.reserved_qty,
        freeToUse: (p.on_hand_qty || 0) - (p.reserved_qty || 0),
        minimum: p.minimum_stock
      }));
    }

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
