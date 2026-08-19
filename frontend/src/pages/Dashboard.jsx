import React, { useState } from 'react';
import { mockDashboardData } from '../data/mockData';

function Dashboard({ currentUser, onNavigate, searchVal }) {
  // Store the active filter state
  const [activeFilter, setActiveFilter] = useState({
    section: 'sales',
    mode: 'All',
    status: 'Confirmed'
  });

  const handlePillClick = (section, mode, status) => {
    if (activeFilter.section === section && activeFilter.mode === mode && activeFilter.status === status) {
      setActiveFilter(null);
    } else {
      setActiveFilter({ section, mode, status });
    }
  };

  // Helper to filter data based on section, mode (All vs My), and status
  const getFilteredOrders = (section) => {
    let list = [];
    if (section === 'sales') list = mockDashboardData.salesOrders;
    else if (section === 'purchase') list = mockDashboardData.purchaseOrders;
    else if (section === 'manufacturing') list = mockDashboardData.manufacturingOrders;

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

  // Status mappings
  const salesPills = {
    All: [
      { count: 2, label: 'Draft' },
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'Partially Delivered' },
      { count: 11, label: 'Delivered' },
      { count: 11, label: 'Late' }
    ],
    My: [
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'Draft' },
      { count: 5, label: 'Delivered' }
    ]
  };

  const purchasePills = {
    All: [
      { count: 2, label: 'Draft' },
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'Partially Received' },
      { count: 11, label: 'Received' },
      { count: 11, label: 'Late' }
    ],
    My: [
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'Draft' },
      { count: 5, label: 'Received' }
    ]
  };

  const manufacturingPills = {
    All: [
      { count: 2, label: 'Draft' },
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'In Progress' },
      { count: 5, label: 'To Close' },
      { count: 11, label: 'Done' }
    ],
    My: [
      { count: 7, label: 'Confirmed' },
      { count: 1, label: 'In Progress' },
      { count: 5, label: 'Done' }
    ]
  };

  const activities = mockDashboardData.recentActivities;

  return (
    <div className="page-content animated fadeIn">

      {/* 1. SALES ORDERS PANEL */}
      <div className="card glass erp-dashboard-panel">
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
                            <button className="btn btn-outline btn-small-table" onClick={() => alert(`Details for ${order.id} ready to load.`)}>
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
      <div className="card glass erp-dashboard-panel">
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
                            <button className="btn btn-outline btn-small-table" onClick={() => alert(`Details for ${order.id} ready to load.`)}>
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
      <div className="card glass erp-dashboard-panel">
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
                            <button className="btn btn-outline btn-small-table" onClick={() => alert(`Details for ${order.id} ready to load.`)}>
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
      <div className="card glass erp-dashboard-panel">
        <h3 className="erp-panel-title" style={{ textAlign: 'left', marginBottom: '18px' }}>Recent Activity</h3>
        <div className="activity-list-container">
          {activities.map((act) => (
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
    </div>
  );
}

export default Dashboard;
