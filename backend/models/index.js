const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  login_id: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  role: { type: String },
  position: { type: String },
  address: { type: String },
  mobile: { type: String },
  password: { type: String },
  photo: { type: String },
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

// Purchase Order Schema
const purchaseOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String },
  vendor: { type: String },
  address: { type: String },
  responsible: { type: String },
  item: { type: String },
  qty: { type: Number },
  received: { type: Number },
  status: { type: String },
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
  cost_price: { type: Number }
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

const User = mongoose.model('User', userSchema);
const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
const ManufacturingOrder = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const Product = mongoose.model('Product', productSchema);
const Bom = mongoose.model('Bom', bomSchema);

module.exports = {
  User,
  SalesOrder,
  PurchaseOrder,
  ManufacturingOrder,
  AuditLog,
  Product,
  Bom
};
