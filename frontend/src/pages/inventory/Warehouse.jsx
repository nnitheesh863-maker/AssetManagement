import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MapPin, Box, User, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Warehouse({ currentUser }) {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', manager: '', capacity: '' });
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/warehouses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setWarehouses(data);
      } else {
        toast.error('Failed to load warehouses');
      }
    } catch (err) {
      console.warn('Error fetching warehouses', err);
      toast.error('Error loading warehouses');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Warehouse created successfully');
        setIsModalOpen(false);
        setFormData({ name: '', location: '', manager: '', capacity: '' });
        fetchWarehouses();
      } else {
        toast.error('Failed to create warehouse');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating warehouse');
    }
  };

  const filtered = warehouses.filter(w => 
    (w.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (w.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      className="page-content animated fadeIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Warehouses</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage storage locations and capacities</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search warehouses..."
              className="filter-control-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '260px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Warehouse
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filtered.map(warehouse => (
          <motion.div 
            key={warehouse._id}
            whileHover={{ y: -5 }}
            className="card glass" 
            style={{ padding: '24px', borderTop: '4px solid #3b82f6' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{warehouse.name}</h3>
              <span className={`badge ${warehouse.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {warehouse.status || 'ACTIVE'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} />
                <span style={{ fontSize: '14px' }}>{warehouse.location || 'No location set'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <User size={16} />
                <span style={{ fontSize: '14px' }}>{warehouse.manager || 'No manager assigned'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Box size={16} />
                <span style={{ fontSize: '14px' }}>Capacity: {warehouse.capacity ? warehouse.capacity.toLocaleString() : 'N/A'} units</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-outline btn-small-table">Edit</button>
              <button className="btn btn-primary btn-small-table">View Stock</button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No warehouses found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ width: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Create Warehouse</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Warehouse Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Manager Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.manager}
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (Units)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Warehouse;
