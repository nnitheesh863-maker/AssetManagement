import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, AlertCircle, TrendingDown, Box, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function InventoryDashboard({ currentUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'http://127.0.0.1:5000/api';
  
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/inventory/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center" style={{color: 'var(--text-secondary)'}}>Loading dashboard...</div>;
  }

  const {
    totalProducts,
    totalStockValue,
    availableStock,
    reservedStock,
    lowStockItems,
    outOfStockItems,
    categories,
    recentMovements
  } = dashboardData || {};

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      className="page-content"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Inventory Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Overview of stock, movements, and alerts</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
            <Package size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Total Products</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{totalProducts || 0}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Total Stock Value</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>₹{(totalStockValue || 0).toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <Box size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Available / Reserved</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{availableStock} / {reservedStock}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Low / Out of Stock</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: outOfStockItems > 0 ? '#ef4444' : 'inherit' }}>
              {lowStockItems} / {outOfStockItems}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} /> Stock Value by Category
          </h3>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categories || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {(categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card glass" style={{ padding: '24px', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={20} /> Recent Stock Movements
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements && recentMovements.length > 0 ? (
                  recentMovements.slice(0,5).map(m => (
                    <tr key={m._id}>
                      <td>{new Date(m.date).toLocaleDateString()}</td>
                      <td>{m.product_id?.name || 'Unknown'}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          background: m.movement_type.includes('RECEIPT') || m.movement_type.includes('PRODUCTION') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: m.movement_type.includes('RECEIPT') || m.movement_type.includes('PRODUCTION') ? '#10b981' : '#ef4444'
                        }}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No recent movements.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default InventoryDashboard;
