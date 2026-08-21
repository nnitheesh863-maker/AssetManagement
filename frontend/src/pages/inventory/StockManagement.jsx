import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

function StockManagement({ currentUser }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems(data);
      } else {
        toast.error('Failed to load inventory');
      }
    } catch (err) {
      console.warn('Error fetching inventory', err);
      toast.error('Error loading inventory');
    }
  };

  const filtered = items.filter(i => {
    const term = search.toLowerCase();
    const prodName = (i.productId?.name || i.productName || '').toLowerCase();
    const prodSku = (i.productId?.sku || i.productId?.id || i.productId || '').toLowerCase();
    return prodName.includes(term) || prodSku.includes(term);
  });

  const getStatusBadge = (item) => {
    const minStock = item.minimumStock || item.productId?.minimum_stock || 0;
    if (item.quantity === 0) return <span className="badge bg-red-100 text-red-800">Out of Stock</span>;
    if (item.quantity <= minStock) return <span className="badge bg-yellow-100 text-yellow-800">Low Stock</span>;
    return <span className="badge bg-green-100 text-green-800">Available</span>;
  };

  return (
    <motion.div 
      className="page-content animated fadeIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Stock Management</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage product inventory and stock levels</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search products..."
              className="filter-control-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '260px' }}
            />
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
        <table className="erp-dashboard-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Total Qty</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(item => {
                const prodId = item.productId?.id || item.productId?._id || item.productId || 'N/A';
                const prodName = item.productId?.name || item.productName || 'Unknown';
                const cat = item.productId?.category || item.category || 'N/A';
                const available = item.quantity - (item.reservedQuantity || 0);

                return (
                  <tr key={item._id}>
                    <td>{prodId}</td>
                    <td style={{ fontWeight: '500' }}>{prodName}</td>
                    <td>{cat}</td>
                    <td>{item.quantity}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.reservedQuantity || 0}</td>
                    <td style={{ fontWeight: 'bold' }}>{available}</td>
                    <td>{getStatusBadge(item)}</td>
                    <td>
                      <button className="btn btn-outline btn-small-table" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit size={14} /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                  No stock items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default StockManagement;
