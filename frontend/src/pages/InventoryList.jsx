import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

function InventoryList({ onNavigate, currentUser }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const fetchItems = async () => {
    setItems([
      { _id: '1', id: 'INV-001', name: 'Raw Teak Lumber Logs', warehouseId: { name: 'Main Warehouse' }, quantity: 150, status: 'Active' },
      { _id: '2', id: 'INV-002', name: 'Walnut Planks Premium', warehouseId: { name: 'Main Warehouse' }, quantity: 80, status: 'Active' },
      { _id: '3', id: 'INV-003', name: 'Deluxe Oak Dining Table', warehouseId: { name: 'Showroom' }, quantity: 12, status: 'Active' },
      { _id: '4', id: 'INV-004', name: 'Premium Tufted Couch', warehouseId: { name: 'Showroom' }, quantity: 5, status: 'Active' },
      { _id: '5', id: 'INV-005', name: 'Industrial Polyurethane', warehouseId: { name: 'Chemicals Storage' }, quantity: 45, status: 'Active' },
    ]);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.sku?.toLowerCase().includes(search.toLowerCase()) ||
    (i.warehouse?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = currentUser?.role && (currentUser.role === 'System Administrator' || currentUser.role === 'ADMIN' || currentUser.role === 'INVENTORY_MANAGER');

  return (
    <div className="page-content animated fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Inventory</h2>
        <input
          type="text"
          placeholder="Search inventory..."
          className="filter-control-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '260px' }}
        />
      </div>
      <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
        <table className="erp-dashboard-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Warehouse</th>
              <th>Qty</th>
              <th>Status</th>
              {canEdit && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(item => (
                <tr key={item._id}>
                  <td>{item.productId?.sku || item.productId?.id || item.id}</td>
                  <td>{item.productId?.name || item.name}</td>
                  <td>{item.warehouseId?.name || 'N/A'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.status || 'Active'}</td>
                  {canEdit && (
                    <td>
                      <button
                        className="btn btn-outline btn-small-table"
                        onClick={() => onNavigate('inventory')}
                      >
                        Details
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canEdit ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryList;
