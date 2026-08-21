import React, { useState, useMemo } from 'react';
import './Dashboard.css';
import { mockDashboardData } from '../data/mockData';

function Dashboard({ currentUser, onNavigate }) {
  // Use existing mock data
  const [salesOrders] = useState(mockDashboardData.salesOrders || []);
  const [purchaseOrders] = useState(mockDashboardData.purchaseOrders || []);
  const [manufacturingOrders] = useState(mockDashboardData.manufacturingOrders || []);
  const [activities] = useState(mockDashboardData.recentActivities || []);

  // Derived calculations
  const totalSalesValue = useMemo(() => {
    return salesOrders.reduce((sum, order) => {
       const amountStr = (order.amount || order.total || "0").toString().replace(/[^0-9.-]+/g,"");
       return sum + (parseFloat(amountStr) || 0);
    }, 0);
  }, [salesOrders]);

  const pendingSales = salesOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Done').length;
  const pendingPurchases = purchaseOrders.filter(o => o.status !== 'Received' && o.status !== 'Done').length;
  const inProgressMfg = manufacturingOrders.filter(o => o.status === 'In Progress').length;
  
  // Mock Inventory (Since it's missing in basic mockData)
  const lowStockItems = [
    { product: 'Teak Wood Logs', onHand: 12, min: 20, status: 'Critical' },
    { product: 'Brass Handles', onHand: 45, min: 50, status: 'Warning' },
    { product: 'Varnish 5L', onHand: 4, min: 10, status: 'Critical' }
  ];

  return (
    <div className="sf-container">
      {/* SVG Definitions */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.5)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* --- DASHBOARD GRID --- */}
      <div className="sf-main">
        {/* Dashboard Grid Content */}
        <div className="sf-dashboard-content">
          
          {/* ROW 1: KPI CARDS */}
          <div className="sf-kpi-grid">
             <div className="sf-kpi-card">
               <div className="sf-kpi-header">
                 <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Total Sales
               </div>
               <div className="sf-kpi-value">₹{(totalSalesValue / 100000).toFixed(1)}L</div>
               <div className="sf-kpi-footer">
                  <span className="sf-kpi-trend positive">+12.5%</span>
                  <span className="sf-kpi-subtext">vs last month</span>
               </div>
             </div>
             
             <div className="sf-kpi-card">
               <div className="sf-kpi-header">
                 <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 Sales Orders
               </div>
               <div className="sf-kpi-value">{salesOrders.length}</div>
               <div className="sf-kpi-footer">
                  <span className="sf-kpi-trend warning">{pendingSales} Pending</span>
               </div>
             </div>

             <div className="sf-kpi-card">
               <div className="sf-kpi-header">
                 <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 Purchase Orders
               </div>
               <div className="sf-kpi-value">{purchaseOrders.length}</div>
               <div className="sf-kpi-footer">
                  <span className="sf-kpi-trend warning">{pendingPurchases} Pending</span>
               </div>
             </div>

             <div className="sf-kpi-card">
               <div className="sf-kpi-header">
                 <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                 Manufacturing
               </div>
               <div className="sf-kpi-value">{manufacturingOrders.length}</div>
               <div className="sf-kpi-footer">
                  <span className="sf-kpi-trend info">{inProgressMfg} In Progress</span>
               </div>
             </div>

             <div className="sf-kpi-card">
               <div className="sf-kpi-header">
                 <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 Low Stock
               </div>
               <div className="sf-kpi-value">{lowStockItems.length}</div>
               <div className="sf-kpi-footer">
                  <span className="sf-kpi-trend danger">Needs Attention</span>
               </div>
             </div>
          </div>

          {/* ROW 2: MAIN ANALYTICS */}
          <div className="sf-analytics-row">
             <div className="sf-panel">
                <div className="sf-panel-header">
                   <h2 className="sf-panel-title">Sales & Order Performance</h2>
                   <select style={{ background: 'var(--sf-bg)', color: 'var(--sf-text-muted)', border: '1px solid var(--sf-panel-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      <option>7 Days</option>
                      <option>30 Days</option>
                      <option>3 Months</option>
                      <option>Year</option>
                   </select>
                </div>
                
                <div style={{ position: 'relative', height: '220px', marginTop: '10px' }}>
                   {/* Horizontal grid lines */}
                   <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '30px' }}>
                      {[4,3,2,1,0].map(i => <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', width: '100%' }}></div>)}
                   </div>
                   
                   <svg className="sf-chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <path d="M 0 150 Q 50 160 100 120 T 200 130 T 250 80 T 300 100 T 400 60 T 500 90 L 500 200 L 0 200 Z" fill="url(#goldGrad)" />
                      <path className="sf-line" d="M 0 150 Q 50 160 100 120 T 200 130 T 250 80 T 300 100 T 400 60 T 500 90" />
                      <circle cx="400" cy="60" r="5" fill="var(--sf-gold)" />
                   </svg>
                   
                   {/* Tooltip */}
                   <div style={{ position: 'absolute', top: '20px', left: '350px', background: 'var(--sf-panel-bg)', border: '1px solid var(--sf-panel-border)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                      <div style={{ color: 'var(--sf-text-muted)', marginBottom: '4px' }}>Aug 15</div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>Sales: ₹2.4L</div>
                   </div>
                </div>
             </div>

             <div className="sf-panel">
                <div className="sf-panel-header">
                   <h2 className="sf-panel-title">Order Status</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', position: 'relative' }}>
                   <svg className="sf-donut-svg" viewBox="0 0 100 100">
                      <circle className="sf-donut-bg" cx="50" cy="50" r="40" />
                      <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-gold)" strokeDasharray="250" strokeDashoffset="100" />
                      <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-info)" strokeDasharray="250" strokeDashoffset="180" />
                      <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-danger)" strokeDasharray="250" strokeDashoffset="230" />
                   </svg>
                   <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--sf-text-muted)' }}>Total Orders</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{salesOrders.length}</div>
                   </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: 'var(--sf-text-muted)', marginTop: '10px' }}>
                   <div style={{display: 'flex', alignItems: 'center', gap:'4px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--sf-gold)'}}></div>Delivered</div>
                   <div style={{display: 'flex', alignItems: 'center', gap:'4px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--sf-info)'}}></div>Confirmed</div>
                   <div style={{display: 'flex', alignItems: 'center', gap:'4px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--sf-danger)'}}></div>Late</div>
                </div>
             </div>
          </div>

          {/* ROW 3: OPERATIONS */}
          <div className="sf-ops-row">
             <div className="sf-panel">
                <h2 className="sf-panel-title" style={{marginBottom: '16px'}}>Inventory Health</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: 'var(--sf-text-muted)' }}>On Hand</span>
                   <span style={{ color: '#fff', fontWeight: '500' }}>1,240</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: 'var(--sf-text-muted)' }}>Reserved</span>
                   <span style={{ color: '#fff', fontWeight: '500' }}>420</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: 'var(--sf-text-muted)' }}>Free To Use</span>
                   <span style={{ color: 'var(--sf-success)', fontWeight: '600' }}>820</span>
                </div>
                <div className="sf-progress-bar"><div className="sf-progress-fill success" style={{width: '66%'}}></div></div>
             </div>

             <div className="sf-panel">
                <h2 className="sf-panel-title" style={{marginBottom: '16px'}}>Manufacturing Status</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: 'var(--sf-text-muted)' }}>In Progress</span>
                   <span style={{ color: '#fff', fontWeight: '500' }}>{inProgressMfg}</span>
                </div>
                <div className="sf-progress-bar" style={{marginBottom: '12px'}}><div className="sf-progress-fill info" style={{width: '45%'}}></div></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: 'var(--sf-text-muted)' }}>To Close</span>
                   <span style={{ color: '#fff', fontWeight: '500' }}>2</span>
                </div>
                <div className="sf-progress-bar"><div className="sf-progress-fill warning" style={{width: '15%'}}></div></div>
             </div>

             <div className="sf-panel">
                <h2 className="sf-panel-title" style={{marginBottom: '16px'}}>Procurement</h2>
                <div style={{ fontSize: '12px', color: 'var(--sf-text-muted)', marginBottom: '12px' }}>Items requiring procurement:</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: '#fff' }}>Teak Wood Logs</span>
                   <span style={{ color: 'var(--sf-danger)', fontWeight: '500' }}>Shortage: 8</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                   <span style={{ color: '#fff' }}>Brass Handles</span>
                   <span style={{ color: 'var(--sf-warning)', fontWeight: '500' }}>Shortage: 5</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                   <span style={{ color: '#fff' }}>Varnish 5L</span>
                   <span style={{ color: 'var(--sf-danger)', fontWeight: '500' }}>Shortage: 6</span>
                </div>
             </div>
          </div>

          {/* ROW 4: DATA TABLE */}
          <div className="sf-panel">
             <div className="sf-panel-header">
                <h2 className="sf-panel-title">Recent Sales Orders</h2>
                <button className="sf-btn">View All</button>
             </div>
             <div className="sf-table-wrapper">
                <table className="sf-table">
                   <thead>
                      <tr>
                         <th>Order ID</th>
                         <th>Product</th>
                         <th>Customer</th>
                         <th>Amount</th>
                         <th>Created</th>
                         <th>Status</th>
                         <th>Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {salesOrders.slice(0, 5).map((order, i) => {
                         const statusClass = order.status ? order.status.toLowerCase().replace(' ', '') : 'draft';
                         return (
                            <tr key={order.id || i}>
                               <td style={{ fontWeight: '500', color: 'var(--sf-gold)' }}>{order.id}</td>
                               <td>{order.name}</td>
                               <td style={{ color: 'var(--sf-text-muted)' }}>{order.owner}</td>
                               <td style={{ fontWeight: '600' }}>{order.amount || `$${order.total}`}</td>
                               <td style={{ color: 'var(--sf-text-muted)' }}>{order.date}</td>
                               <td><span className={`sf-badge ${statusClass}`}>{order.status}</span></td>
                               <td><button className="sf-btn" style={{padding: '4px 8px', fontSize: '11px'}}>Edit</button></td>
                            </tr>
                         )
                      })}
                   </tbody>
                </table>
             </div>
          </div>

          {/* ROW 5: INVENTORY + ACTIVITY */}
          <div className="sf-analytics-row">
             <div className="sf-panel">
                <h2 className="sf-panel-title" style={{marginBottom: '16px'}}>Low Stock Items</h2>
                <div className="sf-table-wrapper">
                   <table className="sf-table">
                      <thead>
                         <tr>
                            <th>Product</th>
                            <th>On Hand</th>
                            <th>Minimum</th>
                            <th>Status</th>
                         </tr>
                      </thead>
                      <tbody>
                         {lowStockItems.map((item, i) => {
                            const statusClass = item.status.toLowerCase();
                            return (
                               <tr key={i}>
                                  <td>{item.product}</td>
                                  <td style={{ fontWeight: '600' }}>{item.onHand}</td>
                                  <td style={{ color: 'var(--sf-text-muted)' }}>{item.min}</td>
                                  <td><span className={`sf-badge ${statusClass}`}>{item.status}</span></td>
                               </tr>
                            )
                         })}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="sf-panel">
                <h2 className="sf-panel-title" style={{marginBottom: '20px'}}>Recent Activity</h2>
                <div className="sf-activity-feed">
                   {activities.slice(0, 4).map((act, i) => (
                      <div className="sf-activity-item" key={act.id || i}>
                         <div className="sf-act-icon">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div className="sf-act-content">
                            <span className="sf-act-desc">{act.text}</span>
                            <span className="sf-act-meta">{act.time}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
