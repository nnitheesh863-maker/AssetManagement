import React, { useState, useEffect } from 'react';
import { mockDashboardData } from '../data/mockData';

function Dashboard({ currentUser, onNavigate, searchVal }) {
  // Store the active filter state
  const [activeFilter, setActiveFilter] = useState(null);

  // Store the selected order for detail modal view
  const [selectedOrder, setSelectedOrder] = useState(null);

  // API states
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [manufacturingOrders, setManufacturingOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [salesRes, purchaseRes, mfgRes, auditRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sales-orders`),
          fetch(`${API_BASE_URL}/purchase-orders`),
          fetch(`${API_BASE_URL}/manufacturing-orders`),
          fetch(`${API_BASE_URL}/audit-logs`)
        ]);

        let salesData = [];
        if (salesRes.ok) {
          const rawSales = await salesRes.ok ? await salesRes.json() : [];
          salesData = rawSales.map(b => {
            const item = b.items[0] || {};
            return {
              id: b.id,
              name: item.product || 'Unknown Product',
              type: 'Custom Dining',
              status: b.status,
              amount: `$${(b.total || 0).toLocaleString()}`,
              date: b.date,
              owner: b.salesperson || 'Amit Sharma'
            };
          });
        }

        let purchaseData = [];
        if (purchaseRes.ok) {
          const rawPurchase = await purchaseRes.json();
          purchaseData = rawPurchase.map(p => ({
            id: p.id,
            name: p.item || 'Raw Lumber',
            type: 'Raw Materials',
            status: p.status,
            amount: `$${(p.qty * 10).toLocaleString()}`,
            date: p.date,
            owner: p.responsible || 'Ravi Patel'
          }));
        }

        let mfgData = [];
        if (mfgRes.ok) {
          const rawMfg = await mfgRes.json();
          mfgData = rawMfg.map(m => ({
            id: m.id,
            name: m.product || 'Door Frames',
            type: 'Assembly Line',
            status: m.status,
            qty: `${m.qty || 0} ${m.units || 'Units'}`,
            date: m.date,
            owner: m.assignee || 'Amit Sharma'
          }));
        }

        let activityData = [];
        if (auditRes.ok) {
          const rawAudit = await auditRes.json();
          activityData = rawAudit.slice(0, 8).map(l => ({
            id: `act-${l.id}`,
            text: `${l.user || 'System'} ${l.action ? l.action.toLowerCase() : 'updated'} ${l.type || 'record'} ${l.record_id || ''}`,
            time: l.datetime || 'Just now'
          }));
        }

        setSalesOrders(salesData.length > 0 ? salesData : mockDashboardData.salesOrders);
        setPurchaseOrders(purchaseData.length > 0 ? purchaseData : mockDashboardData.purchaseOrders);
        setManufacturingOrders(mfgData.length > 0 ? mfgData : mockDashboardData.manufacturingOrders);
        setActivities(activityData.length > 0 ? activityData : mockDashboardData.recentActivities);
      } catch (err) {
        console.warn("Failed to fetch dashboard data from backend. Falling back to mock data.", err);
        setSalesOrders(mockDashboardData.salesOrders);
        setPurchaseOrders(mockDashboardData.purchaseOrders);
        setManufacturingOrders(mockDashboardData.manufacturingOrders);
        setActivities(mockDashboardData.recentActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handlePillClick = (section, mode, status) => {
    if (activeFilter && activeFilter.section === section && activeFilter.mode === mode && activeFilter.status === status) {
      setActiveFilter(null);
    } else {
      setActiveFilter({ section, mode, status });
    }
  };

  // Helper to filter data based on section, mode (All vs My), and status
  const getFilteredOrders = (section) => {
    let list = [];
    if (section === 'sales') list = salesOrders;
    else if (section === 'purchase') list = purchaseOrders;
    else if (section === 'manufacturing') list = manufacturingOrders;

    // Apply global search if present
    if (searchVal) {
      const q = searchVal.toLowerCase();
      list = list.filter(item => 
        item.id.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q) || 
        item.type.toLowerCase().includes(q)
      );
    }

    // Apply active status filter if this section is selected
    if (activeFilter && activeFilter.section === section) {
      list = list.filter(item => {
        const matchesStatus = item.status.toLowerCase() === activeFilter.status.toLowerCase();
        const matchesOwner = activeFilter.mode === 'All' || item.owner === currentUser.loginId;
        return matchesStatus && matchesOwner;
      });
    } else {
      return [];
    }

    return list;
  };

  // Helper to return the correct SVG icon for each status label
  const getPillIcon = (status) => {
    const s = status.toLowerCase();
    
    // Draft icon (Pencil / Document)
    if (s.includes('draft')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    }
    
    // Confirmed icon (Double check / Approved Badge)
    if (s.includes('confirmed')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    // Partially Delivered / Received icon (Box packaging)
    if (s.includes('partially')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    }

    // Delivered / Received / Done icon (Success mark)
    if (s.includes('delivered') || s.includes('received') || s.includes('done')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    // Late / Warning icon (Alert triangle)
    if (s.includes('late')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }

    // In Progress icon (Spinning gear)
    if (s.includes('progress')) {
      return (
        <svg className="pill-icon spin-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      );
    }

    // To Close icon (Lock pad)
    if (s.includes('close')) {
      return (
        <svg className="pill-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }

    return null;
  };

  const getPillsForSection = (ordersList, statuses, mode) => {
    return statuses.map(status => {
      const count = ordersList.filter(o => {
        const matchesStatus = o.status.toLowerCase() === status.toLowerCase();
        const matchesOwner = mode === 'All' || o.owner === currentUser.loginId;
        return matchesStatus && matchesOwner;
      }).length;
      return { count, label: status };
    });
  };

  const salesStatuses = ['Draft', 'Confirmed', 'Partially Delivered', 'Delivered', 'Late'];
  const purchaseStatuses = ['Draft', 'Confirmed', 'Partially Received', 'Received', 'Late'];
  const manufacturingStatuses = ['Draft', 'Confirmed', 'In Progress', 'To Close', 'Done'];

  const salesPills = {
    All: getPillsForSection(salesOrders, salesStatuses, 'All'),
    My: getPillsForSection(salesOrders, salesStatuses, 'My')
  };

  const purchasePills = {
    All: getPillsForSection(purchaseOrders, purchaseStatuses, 'All'),
    My: getPillsForSection(purchaseOrders, purchaseStatuses, 'My')
  };

  const manufacturingPills = {
    All: getPillsForSection(manufacturingOrders, manufacturingStatuses, 'All'),
    My: getPillsForSection(manufacturingOrders, manufacturingStatuses, 'My')
  };

  // Resolve activities fallback dynamically
  const displayActivities = activities.length > 0 ? activities : mockDashboardData.recentActivities;

  if (loading) {
    return (
      <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <style>{`
          @keyframes customSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(207, 142, 109, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'customSpin 1s linear infinite'
          }}></div>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Connecting to ERP Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content animated fadeIn">

      {/* 1. SALES ORDERS PANEL */}
      <div className="card glass erp-dashboard-panel hub-red">
        <div className="erp-panel-header">
          <div style={{ width: '80px' }}></div>
          <h3 className="erp-panel-title">Sale Orders</h3>
          <button className="btn-view-all-link" onClick={() => onNavigate('sales-orders')}>
            View All →
          </button>
        </div>

        <div className="erp-panel-body">
          {/* All row */}
          <div className="erp-filter-row">
            <span className="erp-row-label">All</span>
            <div className="erp-pills-container">
              {salesPills.All.map(pill => {
                const isActive = activeFilter?.section === 'sales' && activeFilter?.mode === 'All' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`sales-all-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('sales', 'All', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My row */}
          <div className="erp-filter-row" style={{ marginTop: '14px' }}>
            <span className="erp-row-label">My</span>
            <div className="erp-pills-container">
              {salesPills.My.map(pill => {
                const isActive = activeFilter?.section === 'sales' && activeFilter?.mode === 'My' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`sales-my-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('sales', 'My', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded orders table */}
          {activeFilter?.section === 'sales' && (
            <div className="erp-orders-table-wrapper">
              <div className="table-filter-indicator">
                Showing {activeFilter.mode === 'My' ? 'My' : 'All'} Sales Orders with status: <strong>{activeFilter.status}</strong>
              </div>
              <div className="table-container-scroll">
                <table className="erp-dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Furniture Item</th>
                      <th>Category</th>
                      <th>Release Date</th>
                      <th>Amount</th>
                      <th>Owner</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders('sales').length > 0 ? (
                      getFilteredOrders('sales').map(order => (
                        <tr key={order.id}>
                          <td className="order-id-cell">{order.id}</td>
                          <td>{order.name}</td>
                          <td><span className="badge category-badge">{order.type}</span></td>
                          <td>{order.date}</td>
                          <td style={{ fontWeight: '600' }}>{order.amount}</td>
                          <td>{order.owner}</td>
                          <td>
                            <button className="btn btn-outline btn-small-table" onClick={() => setSelectedOrder({ ...order, section: 'sales' })}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No sales orders found under this status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. PURCHASE ORDERS PANEL */}
      <div className="card glass erp-dashboard-panel hub-indigo">
        <div className="erp-panel-header">
          <div style={{ width: '80px' }}></div>
          <h3 className="erp-panel-title">Purchase Orders</h3>
          <button className="btn-view-all-link" onClick={() => onNavigate('purchase-orders')}>
            View All →
          </button>
        </div>

        <div className="erp-panel-body">
          {/* All row */}
          <div className="erp-filter-row">
            <span className="erp-row-label">All</span>
            <div className="erp-pills-container">
              {purchasePills.All.map(pill => {
                const isActive = activeFilter?.section === 'purchase' && activeFilter?.mode === 'All' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`purchase-all-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('purchase', 'All', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My row */}
          <div className="erp-filter-row" style={{ marginTop: '14px' }}>
            <span className="erp-row-label">My</span>
            <div className="erp-pills-container">
              {purchasePills.My.map(pill => {
                const isActive = activeFilter?.section === 'purchase' && activeFilter?.mode === 'My' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`purchase-my-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('purchase', 'My', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded orders table */}
          {activeFilter?.section === 'purchase' && (
            <div className="erp-orders-table-wrapper">
              <div className="table-filter-indicator">
                Showing {activeFilter.mode === 'My' ? 'My' : 'All'} Purchase Orders with status: <strong>{activeFilter.status}</strong>
              </div>
              <div className="table-container-scroll">
                <table className="erp-dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Supply Item</th>
                      <th>Category</th>
                      <th>Order Date</th>
                      <th>Amount</th>
                      <th>Requestor</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders('purchase').length > 0 ? (
                      getFilteredOrders('purchase').map(order => (
                        <tr key={order.id}>
                          <td className="order-id-cell">{order.id}</td>
                          <td>{order.name}</td>
                          <td><span className="badge category-badge">{order.type}</span></td>
                          <td>{order.date}</td>
                          <td style={{ fontWeight: '600' }}>{order.amount}</td>
                          <td>{order.owner}</td>
                          <td>
                            <button className="btn btn-outline btn-small-table" onClick={() => setSelectedOrder({ ...order, section: 'purchase' })}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No purchase orders found under this status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MANUFACTURING ORDERS PANEL */}
      <div className="card glass erp-dashboard-panel hub-mint">
        <div className="erp-panel-header">
          <div style={{ width: '80px' }}></div>
          <h3 className="erp-panel-title">Manufacturing Orders</h3>
          <button className="btn-view-all-link" onClick={() => onNavigate('manufacturing-orders')}>
            View All →
          </button>
        </div>

        <div className="erp-panel-body">
          {/* All row */}
          <div className="erp-filter-row">
            <span className="erp-row-label">All</span>
            <div className="erp-pills-container">
              {manufacturingPills.All.map(pill => {
                const isActive = activeFilter?.section === 'manufacturing' && activeFilter?.mode === 'All' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`mfg-all-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('manufacturing', 'All', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* My row */}
          <div className="erp-filter-row" style={{ marginTop: '14px' }}>
            <span className="erp-row-label">My</span>
            <div className="erp-pills-container">
              {manufacturingPills.My.map(pill => {
                const isActive = activeFilter?.section === 'manufacturing' && activeFilter?.mode === 'My' && activeFilter?.status === pill.label;
                return (
                  <button
                    key={`mfg-my-${pill.label}`}
                    className={`erp-status-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handlePillClick('manufacturing', 'My', pill.label)}
                  >
                    {getPillIcon(pill.label)}
                    <span className="pill-count">{pill.count}</span>
                    <span className="pill-label">{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded orders table */}
          {activeFilter?.section === 'manufacturing' && (
            <div className="erp-orders-table-wrapper">
              <div className="table-filter-indicator">
                Showing {activeFilter.mode === 'My' ? 'My' : 'All'} Manufacturing Orders with status: <strong>{activeFilter.status}</strong>
              </div>
              <div className="table-container-scroll">
                <table className="erp-dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Operation</th>
                      <th>Work Center</th>
                      <th>Scheduled Date</th>
                      <th>Batch Qty</th>
                      <th>Supervisor</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders('manufacturing').length > 0 ? (
                      getFilteredOrders('manufacturing').map(order => (
                        <tr key={order.id}>
                          <td className="order-id-cell">{order.id}</td>
                          <td>{order.name}</td>
                          <td><span className="badge category-badge">{order.type}</span></td>
                          <td>{order.date}</td>
                          <td style={{ fontWeight: '600' }}>{order.qty}</td>
                          <td>{order.owner}</td>
                          <td>
                            <button className="btn btn-outline btn-small-table" onClick={() => setSelectedOrder({ ...order, section: 'manufacturing' })}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No manufacturing orders found under this status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LOGS PANEL */}
      <div className="card glass erp-dashboard-panel hub-blue">
        <h3 className="erp-panel-title" style={{ textAlign: 'left', marginBottom: '18px' }}>Recent Activity</h3>
        <div className="activity-list-container">
          {displayActivities.map((act) => (
            <div className="activity-item-row" key={act.id}>
              <div className="activity-dot-indicator"></div>
              <div className="activity-detail-meta">
                <span className="activity-text">{act.text}</span>
                <span className="activity-time-stamp">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(62, 47, 39, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card glass" style={{
            maxWidth: '500px',
            width: '90%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--card-border)',
              paddingBottom: '14px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {selectedOrder.section === 'sales' ? 'Sales Order Details' : 
                 selectedOrder.section === 'purchase' ? 'Purchase Order Details' : 
                 'Manufacturing Order Details'}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: '1'
                }}
              >
                &times;
              </button>
            </div>

            {/* Body Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'sales' ? 'Order ID' : 
                   selectedOrder.section === 'purchase' ? 'Reference' : 
                   'Manufacturing ID'}
                </span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {selectedOrder.id}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'sales' ? 'Furniture Item' : 
                   selectedOrder.section === 'purchase' ? 'Supply Item' : 
                   'Operation'}
                </span>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedOrder.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'manufacturing' ? 'Work Center' : 'Category'}
                </span>
                <div style={{ marginTop: '2px' }}>
                  <span className="badge category-badge">{selectedOrder.type}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'sales' ? 'Release Date' : 
                   selectedOrder.section === 'purchase' ? 'Order Date' : 
                   'Scheduled Date'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedOrder.date}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'manufacturing' ? 'Batch Qty' : 'Amount'}
                </span>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedOrder.section === 'manufacturing' ? selectedOrder.qty : selectedOrder.amount}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {selectedOrder.section === 'sales' ? 'Owner' : 
                   selectedOrder.section === 'purchase' ? 'Requestor' : 
                   'Supervisor'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedOrder.owner}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Status
                </span>
                <div style={{ marginTop: '4px' }}>
                  <span className="badge" style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: selectedOrder.status === 'Delivered' || selectedOrder.status === 'Received' || selectedOrder.status === 'Done' ? '#d1fae5' : 
                                selectedOrder.status === 'Draft' ? '#f3f4f6' : 
                                selectedOrder.status === 'Late' ? '#fee2e2' : '#fef3c7',
                    color: selectedOrder.status === 'Delivered' || selectedOrder.status === 'Received' || selectedOrder.status === 'Done' ? '#065f46' : 
                           selectedOrder.status === 'Draft' ? '#374151' : 
                           selectedOrder.status === 'Late' ? '#991b1b' : '#92400e'
                  }}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{
              borderTop: '1px solid var(--card-border)',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setSelectedOrder(null)}
                style={{ marginTop: 0 }}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const targetView = selectedOrder.section === 'sales' ? 'sales-orders' : 
                                     selectedOrder.section === 'purchase' ? 'purchase-orders' : 
                                     'manufacturing-orders';
                  onNavigate(targetView);
                  setSelectedOrder(null);
                }}
                style={{ marginTop: 0, width: 'auto', padding: '0 20px' }}
              >
                Manage in Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
