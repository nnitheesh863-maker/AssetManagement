// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { requirePermission, authenticateToken } = require('../middleware/auth');
const { 
  adjustInventory, 
  reserveStock, 
  transferStock,
  getInventoryDashboard,
  getStockLedger,
  getStockLedgerByProduct,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} = require('../controllers/inventoryController');
const { Inventory } = require('../models');

// Dashboard
router.get('/inventory/dashboard', authenticateToken, requirePermission('inventory.view'), getInventoryDashboard);

// List all inventory items (supports optional query params)
router.get('/inventory', authenticateToken, requirePermission('inventory.view'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.warehouseId) filter.warehouseId = req.query.warehouseId;
    if (req.query.status) filter.status = req.query.status;
    const items = await Inventory.find(filter).populate('productId', 'name sku').populate('warehouseId', 'name location');
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a single inventory record by id
router.get('/inventory/:id', authenticateToken, requirePermission('inventory.view'), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('productId', 'name sku').populate('warehouseId', 'name location');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update basic fields (name, cost, price, etc.)
router.put('/inventory/:id', authenticateToken, requirePermission('inventory.edit'), async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Adjust inventory (positive/negative adjustment)
router.post('/inventory/adjust', authenticateToken, requirePermission('inventory.adjust'), adjustInventory);

// Reserve stock for internal processes
router.post('/inventory/reserve', authenticateToken, requirePermission('inventory.reserve'), reserveStock);

// Transfer stock between warehouses
router.post('/inventory/transfer', authenticateToken, requirePermission('inventory.transfer'), transferStock);

// Stock Ledger
router.get('/stock-ledger', authenticateToken, requirePermission('inventory.view'), getStockLedger);
router.get('/stock-ledger/:productId', authenticateToken, requirePermission('inventory.view'), getStockLedgerByProduct);

// Warehouses
router.get('/warehouses', authenticateToken, requirePermission('inventory.view'), getWarehouses);
router.post('/warehouses', authenticateToken, requirePermission('inventory.create'), createWarehouse);
router.put('/warehouses/:id', authenticateToken, requirePermission('inventory.edit'), updateWarehouse);
router.delete('/warehouses/:id', authenticateToken, requirePermission('inventory.edit'), deleteWarehouse);

module.exports = router;
