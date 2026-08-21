import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

function StockAdjustment({ currentUser }) {
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('');
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentQty || !reason) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct,
          adjustment: parseInt(adjustmentQty, 10),
          reason
        })
      });

      if (res.ok) {
        toast.success('Stock adjusted successfully');
        setSelectedProduct('');
        setAdjustmentQty('');
        setReason('');
        fetchItems();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to adjust stock');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error adjusting stock');
    }
  };

  const selectedItemData = items.find(i => i.productId === selectedProduct || i.productId?._id === selectedProduct || i.productId?.id === selectedProduct);
  const currentQty = selectedItemData ? selectedItemData.quantity : 0;
  const newQty = currentQty + (parseInt(adjustmentQty, 10) || 0);

  return (
    <motion.div 
      className="page-content animated fadeIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Stock Adjustment</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manually correct physical stock quantities</p>
      </div>

      <div className="card glass" style={{ maxWidth: '600px', padding: '32px' }}>
        <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group">
            <label className="form-label">Select Product</label>
            <select 
              className="form-control"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">-- Choose Product --</option>
              {items.map(item => {
                const id = item.productId?.id || item.productId?._id || item.productId;
                const name = item.productId?.name || item.productName || 'Unknown';
                return <option key={item._id} value={id}>{name} (Current: {item.quantity})</option>
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Current Quantity</p>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{currentQty}</h3>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Adjustment</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: adjustmentQty > 0 ? '#10b981' : (adjustmentQty < 0 ? '#ef4444' : 'inherit') }}>
                {adjustmentQty > 0 ? `+${adjustmentQty}` : (adjustmentQty || 0)}
              </h3>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>New Quantity</p>
              <h3 style={{ margin: 0, fontSize: '24px' }}>{newQty}</h3>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adjustment Quantity (+/-)</label>
            <input 
              type="number" 
              className="form-control" 
              placeholder="e.g. -5 for missing, +10 for found"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="e.g. Damaged items, Audit mismatch"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setSelectedProduct(''); setAdjustmentQty(''); setReason(''); }}>
              <X size={16} style={{ marginRight: '8px' }} /> Clear
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} style={{ marginRight: '8px' }} /> Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default StockAdjustment;
