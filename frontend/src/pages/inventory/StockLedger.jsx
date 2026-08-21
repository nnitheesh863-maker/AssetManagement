import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

function StockLedger({ currentUser }) {
  const [ledger, setLedger] = useState([]);
  const [search, setSearch] = useState('');
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/stock-ledger`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setLedger(data);
      } else {
        toast.error('Failed to load stock ledger');
      }
    } catch (err) {
      console.warn('Error fetching ledger', err);
      toast.error('Error loading stock ledger');
    }
  };

  const filtered = ledger.filter(entry => {
    const term = search.toLowerCase();
    const prodName = (entry.product_id?.name || '').toLowerCase();
    const ref = (entry.ref_id || '').toLowerCase();
    const type = (entry.movement_type || '').toLowerCase();
    return prodName.includes(term) || ref.includes(term) || type.includes(term);
  });

  return (
    <motion.div 
      className="page-content animated fadeIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Stock Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Detailed history of all stock movements</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search history..."
              className="filter-control-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '260px' }}
            />
          </div>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
        <table className="erp-dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Movement Type</th>
              <th>Quantity</th>
              <th>Before</th>
              <th>After</th>
              <th>Reference</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(entry => {
                const isPositive = entry.qty > 0;
                return (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                    <td style={{ fontWeight: '500' }}>{entry.product_id?.name || 'Unknown'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        background: entry.movement_type.includes('RECEIPT') || entry.movement_type.includes('PRODUCTION') || (entry.movement_type === 'STOCK_ADJUSTMENT' && isPositive) ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: entry.movement_type.includes('RECEIPT') || entry.movement_type.includes('PRODUCTION') || (entry.movement_type === 'STOCK_ADJUSTMENT' && isPositive) ? '#10b981' : '#ef4444'
                      }}>
                        {entry.movement_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold', color: isPositive ? '#10b981' : '#ef4444' }}>
                      {isPositive ? `+${entry.qty}` : entry.qty}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{entry.qty_before}</td>
                    <td>{entry.qty_after}</td>
                    <td>{entry.ref_id || '-'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{entry.user}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                  No ledger entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default StockLedger;
