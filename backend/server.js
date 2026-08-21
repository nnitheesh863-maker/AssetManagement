require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const { SalesOrder, PurchaseOrder, ManufacturingOrder, AuditLog, Product, Bom, User } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
app.use('/api', userRoutes);
app.use('/api', salesRoutes);

// Initialize Database on Startup
async function initDb() {
  try {
    console.log("Checking and seeding database...");

    // --- Database Seeding ---
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.log("Seeding products...");
      const initialProducts = [
        { id: 'PROD-001', name: 'Deluxe Oak Dining Table', category: 'Custom Dining', sales_price: 1200, cost_price: 800 },
        { id: 'PROD-002', name: 'Ash Wood Chair Pack', category: 'Dining Room', sales_price: 380, cost_price: 250 },
        { id: 'PROD-003', name: 'Beech Wood Bedframe', category: 'Bedroom Series', sales_price: 1100, cost_price: 750 },
        { id: 'PROD-004', name: 'Cedar Garden Table', category: 'Patio Series', sales_price: 720, cost_price: 480 },
        { id: 'PROD-005', name: 'Cherry Wood Bookshelf', category: 'Living Room', sales_price: 950, cost_price: 620 },
        { id: 'PROD-006', name: 'Birch Coffee Table', category: 'Living Room', sales_price: 410, cost_price: 270 },
        { id: 'PROD-007', name: 'Walnut Sideboard', category: 'Custom Dining', sales_price: 1500, cost_price: 1000 },
        { id: 'PROD-008', name: 'Door Frames', category: 'Pre-Production', sales_price: 150, cost_price: 90 },
        { id: 'PROD-009', name: 'Lighting Frame', category: 'Assembly Line', sales_price: 200, cost_price: 120 }
      ];
      await Product.create(initialProducts);
    }

    const bomsCount = await Bom.countDocuments();
    if (bomsCount === 0) {
      console.log("Seeding BOM templates...");
      const initialBoms = [
        {
          id: 'BOM-000001', reference: 'DF-01', product: 'Door Frames', qty: 10.0, unit: 'Units',
          components: [
            { id: 1, name: 'Raw Lumber', qty: 15, unit: 'Units' },
            { id: 2, name: 'Wood Glue', qty: 2, unit: 'Units' }
          ],
          work_orders: [
            { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45 },
            { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60 }
          ]
        },
        {
          id: 'BOM-000002', reference: 'LF-02', product: 'Lighting Frame', qty: 5.0, unit: 'Units',
          components: [
            { id: 1, name: 'Pendant lights', qty: 5, unit: 'Units' },
            { id: 2, name: 'Drawer handles', qty: 10, unit: 'Units' }
          ],
          work_orders: [
            { id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30 },
            { id: 2, operation: 'Finishing', workCenter: 'Finishing Line', duration: 20 }
          ]
        }
      ];
      await Bom.create(initialBoms);
    }

    const salesCount = await SalesOrder.countDocuments();
    if (salesCount === 0) {
      console.log("Seeding sales orders...");
      const initialSales = [
        {
          id: 'SO-001', date: '2026-08-19', customer: 'Mahesh Gupta Furniture', status: 'Confirmed', salesperson: 'Amit Sharma', total: 1200, owner: '',
          items: [{ product: 'Deluxe Oak Dining Table', price: 1200, qty: 1, delivered: 0, address: 'Colaba, Mumbai, 400001' }]
        },
        {
          id: 'SO-002', date: '2026-08-20', customer: 'System Administrator Client', status: 'Draft', salesperson: 'Neha Verma', total: 760, owner: '',
          items: [{ product: 'Ash Wood Chair Pack', price: 380, qty: 2, delivered: 0, address: 'Colaba, Mumbai, 400001' }]
        }
      ];
      await SalesOrder.create(initialSales);
    }

    const purchaseCount = await PurchaseOrder.countDocuments();
    if (purchaseCount === 0) {
      console.log("Seeding purchase orders...");
      const initialPurchases = [
        { id: 'PO-001', date: '2026-08-18', vendor: 'National Timber Traders', address: 'Goregaon East, Mumbai, 400063', responsible: 'Ravi Patel', item: 'Raw Lumber', qty: 100, received: 100, status: 'Fully Received', owner: '' },
        { id: 'PO-002', date: '2026-08-20', vendor: 'Apex Hardware Supplier', address: 'Andheri West, Mumbai, 400053', responsible: 'Meera Singh', item: 'Drawer handles', qty: 250, received: 0, status: 'Confirmed', owner: '' }
      ];
      await PurchaseOrder.create(initialPurchases);
    }

    const mfgCount = await ManufacturingOrder.countDocuments();
    if (mfgCount === 0) {
      console.log("Seeding manufacturing orders...");
      const initialMfg = [
        {
          id: 'MO-000001', date: '2026-08-20', product: 'Door Frames', bom: 'BOM-000001', qty: 10, units: 'Units', assignee: 'Amit Sharma', status: 'Confirmed',
          components: [
            { id: 1, name: 'Raw Lumber', qty: 15, consumed: 0, unit: 'Units' },
            { id: 2, name: 'Wood Glue', qty: 2, consumed: 0, unit: 'Units' }
          ],
          operations: [
            { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45, realDuration: 0 },
            { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60, realDuration: 0 }
          ]
        },
        {
          id: 'MO-000002', date: '2026-08-19', product: 'Lighting Frame', bom: '', qty: 5, units: 'Units', assignee: 'Neha Verma', status: 'Draft',
          components: [{ id: 1, name: 'Pendant lights', qty: 5, consumed: 0, unit: 'Units' }],
          operations: [{ id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30, realDuration: 0 }]
        }
      ];
      await ManufacturingOrder.create(initialMfg);
    }

    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      console.log("Seeding audit logs...");
      const initialLogs = [
        { datetime: '26 May 2026, 11:42 AM', user: 'Amit Sharma', module: 'Sales', type: 'Product', record_id: 'PROD-0034', action: 'Updated', field: 'Sales Price', old_val: '₹120.00', new_val: '₹135.00' },
        { datetime: '26 May 2026, 11:15 AM', user: 'Neha Verma', module: 'Sales', type: 'Item', record_id: 'ITEM-0102', action: 'Updated', field: 'Cost Price', old_val: '₹80.00', new_val: '₹85.00' },
        { datetime: '26 May 2026, 10:55 AM', user: 'Ravi Patel', module: 'Purchase', type: 'Purchase Order', record_id: 'PO-2026-087', action: 'Created', field: '-', old_val: '-', new_val: '-' },
        { datetime: '26 May 2026, 10:20 AM', user: 'Amit Sharma', module: 'Purchase', type: 'Item', record_id: 'ITEM-0456', action: 'Updated', field: 'Cost Price', old_val: '₹45.00', new_val: '₹50.00' },
        { datetime: '26 May 2026, 09:48 AM', user: 'Meera Singh', module: 'BOM', type: 'BOM', record_id: 'BOM-2026-015', action: 'Created', field: '-', old_val: '-', new_val: '-' },
        { datetime: '26 May 2026, 09:30 AM', user: 'Ravi Patel', module: 'Sales', type: 'Item', record_id: 'ITEM-0102', action: 'Updated', field: 'Sales Price', old_val: '₹110.00', new_val: '₹120.00' },
        { datetime: '26 May 2026, 09:10 AM', user: 'Neha Verma', module: 'Purchase', type: 'Product', record_id: 'PROD-0021', action: 'Deleted', field: '-', old_val: '-', new_val: '-' },
        { datetime: '26 May 2026, 08:45 AM', user: 'Amit Sharma', module: 'Manufacturing', type: 'Manufacturing Order', record_id: 'MO-2026-022', action: 'Updated', field: 'Demand', old_val: '80', new_val: '100' },
        { datetime: '26 May 2026, 08:30 AM', user: 'Meera Singh', module: 'Manufacturing', type: 'Material Consumption', record_id: 'MC-2026-055', action: 'Updated', field: 'Consumed Qty', old_val: '45', new_val: '50' }
      ];
      await AuditLog.create(initialLogs);
    }

    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log("Seeding users...");
      const initialUsers = [
        { login_id: 'admin001', name: 'System Administrator', email: 'admin@shivfurniture.com', role: 'System Administrator', position: 'Admin', address: 'Mumbai', mobile: '+919999999999', password: 'admin123', photo: '' },
        { login_id: 'mahesh_g', name: 'Mahesh Gupta', email: 'mahesh@shivfurniture.com', role: 'User', position: 'Sales Manager', address: 'Colaba, Mumbai, 400001', mobile: '+918000000000', password: 'password123', photo: '' },
        { login_id: 'nisarg_v', name: 'Nisarg Verma', email: 'nisarg@gmail.com', role: 'User', position: 'Purchase Head', address: 'Andheri, Mumbai, 400053', mobile: '+919000000001', password: 'password123', photo: '' },
        { login_id: 'sweta_k', name: 'Sweta Kediva', email: 'sweta.kediva@kprcas.ac.in', role: 'User', position: 'Warehouse Staff', address: 'Bandra, Mumbai, 400050', mobile: '+919000000002', password: 'password123', photo: '' },
        { login_id: 'dinesh_p', name: 'Dinesh Patel', email: 'dinesh@gmail.com', role: 'User', position: 'Account Manager', address: 'Dadar, Mumbai, 400014', mobile: '+919000000003', password: 'password123', photo: '' },
        { login_id: 'trisha_k', name: 'Trisha K.', email: 'trisha@gmail.com', role: 'User', position: 'HR Executive', address: 'Borivali, Mumbai, 400092', mobile: '+919000000004', password: 'password123', photo: '' }
      ];
      await User.create(initialUsers);
    }
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

// ----------------- API ENDPOINTS -----------------

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// --- Purchase Orders Routes ---
app.get("/api/purchase-orders", async (req, res) => {
  try {
    const data = await PurchaseOrder.find().sort({ id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/purchase-orders", async (req, res) => {
  try {
    const { id, date, vendor, address, responsible, item, qty, received, status, owner } = req.body;
    await PurchaseOrder.create({ id, date, vendor, address, responsible, item, qty: qty || 0, received: received || 0, status, owner: owner || "" });
    res.status(201).json({ message: "Purchase order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.findOneAndUpdate({ id }, req.body);
    res.json({ message: "Purchase order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.findOneAndDelete({ id });
    res.json({ message: "Purchase order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Manufacturing Orders Routes ---
app.get("/api/manufacturing-orders", async (req, res) => {
  try {
    const data = await ManufacturingOrder.find().sort({ id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/manufacturing-orders", async (req, res) => {
  try {
    await ManufacturingOrder.create(req.body);
    res.status(201).json({ message: "Manufacturing order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/manufacturing-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturingOrder.findOneAndUpdate({ id }, req.body);
    res.json({ message: "Manufacturing order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/manufacturing-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturingOrder.findOneAndDelete({ id });
    res.json({ message: "Manufacturing order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audit Logs Routes ---
app.get("/api/audit-logs", async (req, res) => {
  try {
    const data = await AuditLog.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/audit-logs", async (req, res) => {
  try {
    await AuditLog.create(req.body);
    res.status(201).json({ message: "Audit log created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/audit-logs/:id", async (req, res) => {
  try {
    // Assuming id is passed but in MongoDB it's _id or we're not filtering by string ID
    await AuditLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit log deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Products Routes ---
app.get("/api/products", async (req, res) => {
  try {
    const data = await Product.find().sort({ id: -1 });
    // Transform to match old field names
    const formatted = data.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      salesPrice: r.sales_price,
      costPrice: r.cost_price
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { id, name, category, salesPrice, costPrice } = req.body;
    await Product.create({ id, name, category, sales_price: salesPrice, cost_price: costPrice });
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, salesPrice, costPrice } = req.body;
    await Product.findOneAndUpdate({ id }, { name, category, sales_price: salesPrice, cost_price: costPrice });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findOneAndDelete({ id });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOM Templates Routes ---
app.get("/api/boms", async (req, res) => {
  try {
    const data = await Bom.find().sort({ id: -1 });
    const formatted = data.map(r => ({
      id: r.id,
      reference: r.reference,
      product: r.product,
      qty: r.qty,
      unit: r.unit,
      components: r.components,
      workOrders: r.work_orders
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/boms", async (req, res) => {
  try {
    const { id, reference, product, qty, unit, components, workOrders } = req.body;
    await Bom.create({ id, reference, product, qty, unit, components, work_orders: workOrders });
    res.status(201).json({ message: "BOM template created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/boms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, product, qty, unit, components, workOrders } = req.body;
    await Bom.findOneAndUpdate({ id }, { reference, product, qty, unit, components, work_orders: workOrders });
    res.json({ message: "BOM template updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/boms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Bom.findOneAndDelete({ id });
    res.json({ message: "BOM template deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Dashboard Analytics Aggregation Route ---
app.get("/api/dashboard/analytics", async (req, res) => {
  try {
    const totalOrders = await SalesOrder.countDocuments();
    const salesAggregation = await SalesOrder.aggregate([{ $group: { _id: null, total_revenue: { $sum: "$total" } } }]);
    const totalRevenue = salesAggregation[0] ? salesAggregation[0].total_revenue : 0;
    const completedOrders = await SalesOrder.countDocuments({ status: "Delivered" });

    const totalPos = await PurchaseOrder.countDocuments();
    const purchaseAggregation = await PurchaseOrder.aggregate([
      { $group: { _id: null, items_ordered: { $sum: "$qty" }, items_received: { $sum: "$received" } } }
    ]);
    const itemsOrdered = purchaseAggregation[0] ? purchaseAggregation[0].items_ordered : 0;
    const itemsReceived = purchaseAggregation[0] ? purchaseAggregation[0].items_received : 0;

    const activeMfg = await ManufacturingOrder.countDocuments();
    const completedMfg = await ManufacturingOrder.countDocuments({ status: "Completed" });

    const totalProducts = await Product.countDocuments();
    const recentAudits = await AuditLog.find().sort({ _id: -1 }).limit(10);

    res.json({
      sales: { total_orders: totalOrders, total_revenue: totalRevenue, completed_orders: completedOrders },
      purchases: { total_pos: totalPos, items_ordered: itemsOrdered, items_received: itemsReceived },
      manufacturing: { active_mfg: activeMfg, completed_mfg: completedMfg },
      inventory: { total_products: totalProducts },
      recentActivity: recentAudits,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Init DB
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  await initDb();
});
