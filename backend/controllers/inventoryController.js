const { Inventory, Warehouse, InventoryAuditLog, StockLedger, Product } = require('../models');

const { sendLowStockAlert } = require('../utils/lowStockAlert');

/**
 * Adjust inventory quantity (positive for receipt, negative for deduction)
 */
async function adjustInventory(req, res) {
  try {
    const { productId, adjustment, reason } = req.body;
    if (!productId || typeof adjustment !== 'number') {
      return res.status(400).json({ success: false, message: 'productId and numeric adjustment required' });
    }
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    const previousQty = inventory.quantity;
    const newQty = previousQty + adjustment;
    if (newQty < 0) {
      return res.status(400).json({ success: false, message: 'Resulting quantity cannot be negative' });
    }
    inventory.quantity = newQty;
    await inventory.save();

    // Create Stock Ledger entry
    await StockLedger.create({
      product_id: productId,
      movement_type: 'STOCK_ADJUSTMENT',
      qty_before: previousQty,
      qty_after: newQty,
      qty: adjustment,
      ref_type: 'adjustment',
      ref_id: req.body.referenceId || null,
      user: req.user.login_id,
    });

    // Audit log entry
    await InventoryAuditLog.create({
      action: 'adjust',
      oldValue: { quantity: previousQty },
      newValue: { quantity: newQty },
      userId: req.user.login_id,
      reason,
    });

    // Low stock alert
    if (inventory.minimumStock !== undefined && inventory.quantity - inventory.reservedQuantity <= inventory.minimumStock) {
      await sendLowStockAlert(inventory);
    }

    return res.json({ success: true, inventory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/** Reserve stock for internal processes (sales, manufacturing) */
async function reserveStock(req, res) {
  try {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid productId and quantity required' });
    }
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    const available = inventory.quantity - inventory.reservedQuantity;
    if (available < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient available stock' });
    }
    inventory.reservedQuantity += quantity;
    await inventory.save();

    // Ledger entry
    await StockLedger.create({
      product_id: productId,
      movement_type: 'RESERVATION',
      qty_before: inventory.quantity,
      qty_after: inventory.quantity,
      qty: quantity,
      ref_type: 'reservation',
      ref_id: req.body.referenceId || null,
      user: req.user.login_id,
    });

    return res.json({ success: true, inventory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/** Transfer stock between warehouses */
async function transferStock(req, res) {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;
    if (!productId || !fromWarehouseId || !toWarehouseId || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'All fields required with positive quantity' });
    }
    const fromInv = await Inventory.findOne({ productId, warehouseId: fromWarehouseId });
    const toInv = await Inventory.findOne({ productId, warehouseId: toWarehouseId });
    if (!fromInv || !toInv) {
      return res.status(404).json({ success: false, message: 'Source or destination inventory not found' });
    }
    if (fromInv.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock in source warehouse' });
    }
    // Update quantities
    fromInv.quantity -= quantity;
    toInv.quantity += quantity;
    await fromInv.save();
    await toInv.save();

    // Ledger entry for transfer (treated as two movements)
    await StockLedger.create({
      product_id: productId,
      movement_type: 'RELEASE',
      qty_before: fromInv.quantity + quantity,
      qty_after: fromInv.quantity,
      qty: quantity,
      ref_type: 'transfer',
      ref_id: `${fromWarehouseId}->${toWarehouseId}`,
      user: req.user.login_id,
    });
    await StockLedger.create({
      product_id: productId,
      movement_type: 'STOCK_ADJUSTMENT',
      qty_before: toInv.quantity - quantity,
      qty_after: toInv.quantity,
      qty: quantity,
      ref_type: 'transfer',
      ref_id: `${fromWarehouseId}->${toWarehouseId}`,
      user: req.user.login_id,
    });

    return res.json({ success: true, fromInventory: fromInv, toInventory: toInv });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


/** Dashboard Analytics */
async function getInventoryDashboard(req, res) {
  try {
    const items = await Inventory.find().populate('productId');
    let totalProducts = items.length;
    let totalStockValue = 0;
    let availableStock = 0;
    let reservedStock = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    const categories = {};

    items.forEach(item => {
      const prod = item.productId || {};
      const cost = item.costPrice || prod.cost_price || 0;
      totalStockValue += (item.quantity * cost);
      availableStock += (item.quantity - (item.reservedQuantity || 0));
      reservedStock += (item.reservedQuantity || 0);

      const minStock = item.minimumStock || prod.minimum_stock || 0;
      if (item.quantity === 0) {
        outOfStockItems++;
      } else if (item.quantity <= minStock) {
        lowStockItems++;
      }

      const cat = item.category || prod.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = { name: cat, value: 0 };
      categories[cat].value += (item.quantity * cost);
    });

    const recentMovements = await StockLedger.find().sort({ date: -1 }).limit(10).populate('product_id', 'name category');

    return res.json({
      success: true,
      data: {
        totalProducts,
        totalStockValue,
        availableStock,
        reservedStock,
        lowStockItems,
        outOfStockItems,
        categories: Object.values(categories),
        recentMovements
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/** Get Stock Ledger */
async function getStockLedger(req, res) {
  try {
    const filter = {};
    if (req.query.movementType) filter.movement_type = req.query.movementType;
    const ledger = await StockLedger.find(filter).sort({ date: -1 }).populate('product_id', 'name category');
    return res.json({ success: true, data: ledger });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getStockLedgerByProduct(req, res) {
  try {
    const ledger = await StockLedger.find({ product_id: req.params.productId }).sort({ date: -1 });
    return res.json({ success: true, data: ledger });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/** Warehouse Management */
async function getWarehouses(req, res) {
  try {
    const warehouses = await Warehouse.find();
    return res.json({ success: true, data: warehouses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createWarehouse(req, res) {
  try {
    const warehouse = await Warehouse.create(req.body);
    return res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateWarehouse(req, res) {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    return res.json({ success: true, data: warehouse });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function deleteWarehouse(req, res) {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    return res.json({ success: true, message: 'Warehouse deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
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
};
