const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  login_id: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  role: { 
    type: String, 
    enum: [ "PENDING", "ADMIN", "SALES_USER", "PURCHASE_USER", "MANUFACTURING_USER", "INVENTORY_MANAGER", "BUSINESS_OWNER" ], 
    default: "PENDING" 
  },
  position: { type: String },
  address: { type: String },
  mobile: { type: String },
  password: { type: String },
  photo: { type: String },
  status: { 
    type: String, 
    enum: [ "PENDING", "ACTIVE", "INACTIVE", "SUSPENDED" ], 
    default: "PENDING" 
  },
  permissions: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now }
});

// Sales Order Schema
const salesOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // E.g. SO-001
  date: { type: String },
  customer: { type: String },
  status: { type: String },
  salesperson: { type: String },
  items: { type: Array, default: [] }, // Array of objects instead of TEXT
  total: { type: Number, default: 0 },
  owner: { type: String }
});

// Purchase Order Schema (enhanced)
const purchaseOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String },
  vendor: { type: String },
  vendor_id: { type: String, default: '' },
  address: { type: String },
  responsible: { type: String },
  // Legacy single-item fields (kept for backward compat)
  item: { type: String, default: '' },
  qty: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  // Enhanced multi-item support
  items: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  expected_date: { type: String, default: '' },
  payment_terms: { type: String, default: 'Net 30' },
  notes: { type: String, default: '' },
  status: { type: String, default: 'Draft' },
  owner: { type: String }
});

// Manufacturing Order Schema
const manufacturingOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String },
  product: { type: String },
  bom: { type: String },
  qty: { type: Number },
  units: { type: String },
  assignee: { type: String },
  status: { type: String },
  components: { type: Array, default: [] },
  operations: { type: Array, default: [] }
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  datetime: { type: String },
  user: { type: String },
  module: { type: String },
  type: { type: String },
  record_id: { type: String },
  action: { type: String },
  field: { type: String },
  old_val: { type: String },
  new_val: { type: String }
});

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  category: { type: String },
  sales_price: { type: Number },
  cost_price: { type: Number },
  on_hand_qty: { type: Number, default: 0 },
  reserved_qty: { type: Number, default: 0 },
  minimum_stock: { type: Number, default: 0 },
  procurement_strategy: { type: String, enum: ['MTS', 'MTO'], default: 'MTS' },
  procurement_type: { type: String, enum: ['Purchase', 'Manufacturing'], default: 'Purchase' },
  vendor: { type: String, default: '' },
  bom_ref: { type: String, default: '' }
});

// BOM Schema
const bomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  reference: { type: String },
  product: { type: String },
  qty: { type: Number },
  unit: { type: String },
  components: { type: Array, default: [] },
  work_orders: { type: Array, default: [] }
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  customer_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  total_orders: { type: Number, default: 0 },
  total_revenue: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

// Vendor Schema
const vendorSchema = new mongoose.Schema({
  vendor_code: { type: String, required: true, unique: true },
  company_name: { type: String, required: true },
  contact_person: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  gst_number: { type: String, default: '' },
  payment_terms: { type: String, default: 'Net 30' },
  status: { type: String, enum: ['Active', 'Inactive', 'Blacklisted'], default: 'Active' },
  total_orders: { type: Number, default: 0 },
  total_purchase_value: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

// Goods Receipt Schema
const goodsReceiptSchema = new mongoose.Schema({
  receipt_number: { type: String, required: true, unique: true },
  purchase_order_id: { type: String, required: true },
  vendor: { type: String },
  items: { type: Array, default: [] }, // [{materialName, orderedQty, receivedQty, damagedQty, qualityStatus}]
  received_by: { type: String },
  received_date: { type: String },
  quality_status: { type: String, enum: ['Accepted', 'Partially Accepted', 'Rejected'], default: 'Accepted' },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// Stock Ledger Schema
const stockLedgerSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  movement_type: { 
    type: String, 
    enum: [
      'PURCHASE_RECEIPT', 'SALES_DELIVERY', 
      'MANUFACTURING_CONSUMPTION', 'MANUFACTURING_PRODUCTION', 
      'STOCK_ADJUSTMENT', 'RESERVATION', 'RELEASE'
    ], 
    required: true 
  },
  qty_before: { type: Number, required: true },
  qty_after: { type: Number, required: true },
  qty: { type: Number, required: true },
  ref_type: { type: String, required: true },
  ref_id: { type: String, required: true },
  user: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
const ManufacturingOrder = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const Product = mongoose.model('Product', productSchema);
const Bom = mongoose.model('Bom', bomSchema);
const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const GoodsReceipt = mongoose.model('GoodsReceipt', goodsReceiptSchema);

module.exports = {
  User,
  SalesOrder,
  PurchaseOrder,
  ManufacturingOrder,
  AuditLog,
  Product,
  Bom,
  StockLedger,
  Customer,
  Vendor,
  GoodsReceipt
};
