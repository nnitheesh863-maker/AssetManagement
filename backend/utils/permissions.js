const ROLE_PERMISSIONS = {
  ADMIN: [
    "dashboard.view", "users.view", "users.create", "users.edit", "users.assign_role",
    "sales.view", "sales.create", "sales.edit", "sales.delete",
    "purchase.view", "purchase.create", "purchase.edit", "purchase.delete",
    "manufacturing.view", "manufacturing.create", "manufacturing.edit", "manufacturing.delete",
    "inventory.view", "inventory.edit", "products.view", "products.create", "products.edit",
    "bom.view", "bom.create", "bom.edit", "audit.view", "settings.view"
  ],
  SALES_USER: [
    "dashboard.view", "sales.view", "sales.create", "sales.edit", "products.view", "inventory.view"
  ],
  PURCHASE_USER: [
    "dashboard.view", "purchase.view", "purchase.create", "purchase.edit", "products.view", "inventory.view", "procurement.view"
  ],
  MANUFACTURING_USER: [
    "dashboard.view", "manufacturing.view", "manufacturing.create", "manufacturing.edit", "bom.view", "inventory.view"
  ],
  INVENTORY_MANAGER: [
    "dashboard.view", "inventory.view", "inventory.edit", "inventory.adjust", "inventory.reserve", "inventory.transfer", "products.view", "products.edit", "stock_ledger.view", "procurement.view"
  ],
  BUSINESS_OWNER: [
    "dashboard.view", "products.view", "products.create", "products.edit", "sales.view", "purchase.view", "manufacturing.view", "inventory.view", "procurement.view", "analytics.view"
  ],
  PENDING: []
};

module.exports = { ROLE_PERMISSIONS };
