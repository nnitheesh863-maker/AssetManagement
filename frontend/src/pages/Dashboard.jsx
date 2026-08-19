import React from 'react';

function Dashboard({ currentUser }) {
  // Mock furniture orders list
  const mockOrders = [
    { id: 'ORD-5012', name: 'Teak Wood Dining Table', type: 'Custom Dining', status: 'In Production', owner: currentUser.loginId },
    { id: 'ORD-3294', name: 'Premium Oak Sofa Set', type: 'Living Room', status: 'Ready to Ship', owner: currentUser.loginId },
    { id: 'ORD-1109', name: 'Ergonomic Study Table', type: 'Office Series', status: 'Delivered', owner: currentUser.loginId },
  ];

  return (
    <div className="page-content animated fadeIn">
      <div className="card glass dashboard-card-full">
        <div className="dashboard-content-header">
          <h2>Shiv Furniture ERP Console</h2>
          <p className="sys-desc">Authentication verified. Welcome to your furniture manufacturing management dashboard.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-val">{currentUser.role === 'System Administrator' ? '284' : '3'}</div>
            <div className="stat-lbl">{currentUser.role === 'System Administrator' ? 'Total Active Orders' : 'My Assigned Orders'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{currentUser.role === 'System Administrator' ? '1,059' : '1'}</div>
            <div className="stat-lbl">{currentUser.role === 'System Administrator' ? 'Items Manufactured' : 'My Completed Items'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">99.2%</div>
            <div className="stat-lbl">Production Efficiency</div>
          </div>
        </div>

        {/* Orders Directory Table */}
        <div className="assets-table-section">
          <h3>Current Production Inventory & Orders</h3>
          <div className="table-responsive">
            <table className="assets-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Furniture Item</th>
                  <th>Category</th>
                  <th>Production Status</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="asset-id">{order.id}</td>
                    <td className="asset-name">{order.name}</td>
                    <td><span className="type-pill">{order.type}</span></td>
                    <td>
                      <span className={`status-pill ${
                        order.status === 'Delivered' ? 'status-active' : 'status-pending'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System log / Info */}
        <div className="console-info-box">
          <h4>Security & Audit logs</h4>
          <div className="audit-log">
            <div className="log-item">
              <span className="log-time">15:42:00</span>
              <span className="log-text">ERP portal session initialized for {currentUser.loginId} ({currentUser.role})</span>
            </div>
            <div className="log-item">
              <span className="log-time">15:41:20</span>
              <span className="log-text">Production database synchronized with local state</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

