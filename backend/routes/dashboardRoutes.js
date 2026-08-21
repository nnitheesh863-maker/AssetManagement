const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Dashboard Analytics Aggregation Route ---
router.get("/dashboard/analytics", async (req, res) => {
  try {
    // Run multiple queries in parallel for fast dashboard loading
    const [salesResult, purchaseResult, mfgResult, productsResult, recentAudits] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue, COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as completed_orders FROM sales_orders
      `),
      pool.query(`
        SELECT COUNT(*) as total_pos, COALESCE(SUM(qty), 0) as items_ordered, COALESCE(SUM(received), 0) as items_received FROM purchase_orders
      `),
      pool.query(`
        SELECT COUNT(*) as active_mfg, COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_mfg FROM manufacturing_orders
      `),
      pool.query(`SELECT COUNT(*) as total_products FROM products`),
      pool.query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10`)
    ]);

    res.json({
      sales: salesResult.rows[0],
      purchases: purchaseResult.rows[0],
      manufacturing: mfgResult.rows[0],
      inventory: productsResult.rows[0],
      recentActivity: recentAudits.rows,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
