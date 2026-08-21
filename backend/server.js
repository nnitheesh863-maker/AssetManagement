require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const { SalesOrder, PurchaseOrder, ManufacturingOrder, AuditLog, Product, Bom, User } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import Routes
const userRoutes = require('./routes/userRoutes');
const salesRoutes = require('./routes/salesRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const productRoutes = require('./routes/productRoutes');
const bomRoutes = require('./routes/bomRoutes');
app.use('/api', userRoutes);
app.use('/api', salesRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', manufacturingRoutes);
app.use('/api', productRoutes);
app.use('/api', bomRoutes);

const auditRoutes = require('./routes/auditRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api', auditRoutes);
app.use('/api', dashboardRoutes);

// Initialize Database on Startup
async function initDb() {
  try {
    console.log("Checking and seeding database...");

    // --- Database Seeding ---
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.log("Seeding products...");
      const initialProducts = [
        { id: 'PROD-001', name: 'Deluxe Oak Dining Table', category: 'Custom Dining', sales_price: 1200, cost_price: 800, on_hand_qty: 15, reserved_qty: 0, minimum_stock: 5, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: '' },
        { id: 'PROD-002', name: 'Ash Wood Chair Pack', category: 'Dining Room', sales_price: 380, cost_price: 250, on_hand_qty: 25, reserved_qty: 0, minimum_stock: 10, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'National Timber Traders' },
        { id: 'PROD-003', name: 'Beech Wood Bedframe', category: 'Bedroom Series', sales_price: 1100, cost_price: 750, on_hand_qty: 12, reserved_qty: 0, minimum_stock: 4, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: '' },
        { id: 'PROD-004', name: 'Cedar Garden Table', category: 'Patio Series', sales_price: 720, cost_price: 480, on_hand_qty: 6, reserved_qty: 0, minimum_stock: 3, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: '' },
        { id: 'PROD-005', name: 'Cherry Wood Bookshelf', category: 'Living Room', sales_price: 950, cost_price: 620, on_hand_qty: 8, reserved_qty: 0, minimum_stock: 5, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'Apex Hardware Supplier' },
        { id: 'PROD-006', name: 'Birch Coffee Table', category: 'Living Room', sales_price: 410, cost_price: 270, on_hand_qty: 14, reserved_qty: 0, minimum_stock: 6, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'Apex Hardware Supplier' },
        { id: 'PROD-007', name: 'Walnut Sideboard', category: 'Custom Dining', sales_price: 1500, cost_price: 1000, on_hand_qty: 5, reserved_qty: 0, minimum_stock: 2, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: '' },
        { id: 'PROD-008', name: 'Door Frames', category: 'Pre-Production', sales_price: 150, cost_price: 90, on_hand_qty: 8, reserved_qty: 0, minimum_stock: 20, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: 'BOM-000001' },
        { id: 'PROD-009', name: 'Lighting Frame', category: 'Assembly Line', sales_price: 200, cost_price: 120, on_hand_qty: 4, reserved_qty: 0, minimum_stock: 10, procurement_strategy: 'MTS', procurement_type: 'Manufacturing', bom_ref: 'BOM-000002' },
        { id: 'RAW-001', name: 'Raw Lumber', category: 'Raw Materials', sales_price: 0, cost_price: 20, on_hand_qty: 100, reserved_qty: 0, minimum_stock: 50, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'National Timber Traders' },
        { id: 'RAW-002', name: 'Wood Glue', category: 'Raw Materials', sales_price: 0, cost_price: 5, on_hand_qty: 20, reserved_qty: 0, minimum_stock: 10, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'Apex Hardware Supplier' },
        { id: 'RAW-003', name: 'Pendant lights', category: 'Raw Materials', sales_price: 0, cost_price: 15, on_hand_qty: 12, reserved_qty: 0, minimum_stock: 10, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'Apex Hardware Supplier' },
        { id: 'RAW-004', name: 'Drawer handles', category: 'Raw Materials', sales_price: 0, cost_price: 2, on_hand_qty: 80, reserved_qty: 0, minimum_stock: 100, procurement_strategy: 'MTS', procurement_type: 'Purchase', vendor: 'Apex Hardware Supplier' }
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
        { login_id: 'admin001', name: 'System Administrator', email: 'admin@shivfurniture.com', role: 'ADMIN', position: 'Admin', address: 'Mumbai', mobile: '+919999999999', password: bcrypt.hashSync('admin123', 10), photo: '', status: 'ACTIVE' },
        { login_id: 'mahesh_g', name: 'Mahesh Gupta', email: 'mahesh@shivfurniture.com', role: 'SALES_USER', position: 'Sales Manager', address: 'Colaba, Mumbai, 400001', mobile: '+918000000000', password: bcrypt.hashSync('password123', 10), photo: '', status: 'ACTIVE' },
        { login_id: 'nisarg_v', name: 'Nisarg Verma', email: 'nisarg@gmail.com', role: 'PURCHASE_USER', position: 'Purchase Head', address: 'Andheri, Mumbai, 400053', mobile: '+919000000001', password: bcrypt.hashSync('password123', 10), photo: '', status: 'ACTIVE' },
        { login_id: 'sweta_k', name: 'Sweta Kediva', email: 'sweta.kediva@kprcas.ac.in', role: 'INVENTORY_MANAGER', position: 'Warehouse Staff', address: 'Bandra, Mumbai, 400050', mobile: '+919000000002', password: bcrypt.hashSync('password123', 10), photo: '', status: 'ACTIVE' },
        { login_id: 'dinesh_p', name: 'Dinesh Patel', email: 'dinesh@gmail.com', role: 'BUSINESS_OWNER', position: 'Account Manager', address: 'Dadar, Mumbai, 400014', mobile: '+919000000003', password: bcrypt.hashSync('password123', 10), photo: '', status: 'ACTIVE' },
        { login_id: 'trisha_k', name: 'Trisha K.', email: 'trisha@gmail.com', role: 'MANUFACTURING_USER', position: 'HR Executive', address: 'Borivali, Mumbai, 400092', mobile: '+919000000004', password: bcrypt.hashSync('password123', 10), photo: '', status: 'ACTIVE' }
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

// Routes have been moved to the routes/ directory and imported above.

// Start Server & Init DB
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  await initDb();
});
