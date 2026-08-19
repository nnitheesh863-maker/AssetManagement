import React, { useState } from 'react';

function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Realistic sample log records
  const sampleLogs = [
    { timestamp: '2026-08-19 18:32:15', user: 'mahesh_gupta', action: 'CREATE_ORDER', module: 'Sales', desc: 'Created Sales Order SO-001 for Deluxe Oak Dining Table', status: 'Success', type: 'User' },
    { timestamp: '2026-08-19 18:15:40', user: 'amit_sharma', action: 'UPDATE_PRODUCT', module: 'Products', desc: 'Updated Teak Veneer specifications (PROD-0034)', status: 'Success', type: 'User' },
    { timestamp: '2026-08-19 17:55:12', user: 'admin123', action: 'SYSTEM_LOGIN', module: 'Auth', desc: 'Successful login from IP 192.168.1.105', status: 'Success', type: 'Security' },
    { timestamp: '2026-08-19 17:48:22', user: 'admin123', action: 'FAILED_LOGIN', module: 'Auth', desc: 'Failed login attempt for user guest from IP 192.168.1.201', status: 'Warning', type: 'Security' },
    { timestamp: '2026-08-19 16:20:05', user: 'meera_sen', action: 'CONFIRM_PURCHASE', module: 'Purchasing', desc: 'Confirmed Purchase Order PO-001 for Raw Teak logs', status: 'Success', type: 'User' },
    { timestamp: '2026-08-19 15:40:50', user: 'ravi_verma', action: 'COMPLETE_MO', module: 'Manufacturing', desc: 'Completed Manufacturing Order MO-016 (Sanding Desks)', status: 'Success', type: 'User' },
    { timestamp: '2026-08-18 14:12:35', user: 'mahesh_gupta', action: 'DELETE_DRAFT', module: 'Sales', desc: 'Deleted draft order SO-009', status: 'Success', type: 'User' },
    { timestamp: '2026-08-18 11:05:18', user: 'admin123', action: 'UPDATE_SETTINGS', module: 'Settings', desc: 'Modified system backup parameters', status: 'Success', type: 'System' },
    { timestamp: '2026-08-18 09:30:12', user: 'meera_sen', action: 'CREATE_PO', module: 'Purchasing', desc: 'Created draft Purchase Order PO-005', status: 'Success', type: 'User' },
    { timestamp: '2026-08-17 16:45:00', user: 'ravi_verma', action: 'START_MO', module: 'Manufacturing', desc: 'Started production on MO-010 (Teak Dining Assembly)', status: 'Success', type: 'User' }
  ];

  // Stats
  const totalLogs = 120;
  const todayCount = 6;
  const securityCount = 2;
  const userActionsCount = 112;

  // Filter logic
  const filteredLogs = sampleLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);

    return matchesSearch && matchesType && matchesDate;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setDateFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="page-content animated fadeIn">
      {/* 1. Header & Subtitle */}
      <div className="dashboard-header-block">
        <h2>Audit Logs & Activities</h2>
        <p className="sys-desc">Track and review critical transactions, user logins, and system changes</p>
      </div>

      {/* 2. ERP Summary Cards Grid */}
      <div className="audit-stats-grid">
        <div className="card glass audit-stat-card">
          <span className="audit-stat-label">Total Activities</span>
          <span className="audit-stat-val">{totalLogs}</span>
        </div>
        <div className="card glass audit-stat-card">
          <span className="audit-stat-label">Today's Activities</span>
          <span className="audit-stat-val" style={{ color: 'var(--primary)' }}>{todayCount}</span>
        </div>
        <div className="card glass audit-stat-card">
          <span className="audit-stat-label">Security Events</span>
          <span className="audit-stat-val" style={{ color: 'var(--error)' }}>{securityCount}</span>
        </div>
        <div className="card glass audit-stat-card">
          <span className="audit-stat-label">User Actions</span>
          <span className="audit-stat-val" style={{ color: 'var(--success)' }}>{userActionsCount}</span>
        </div>
      </div>

      {/* 3. Filter Controls Box */}
      <div className="card glass audit-filter-container">
        <div className="audit-filter-row-grid">
          {/* Search bar */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Search Activity</label>
            <input
              type="text"
              placeholder="Search user, action, description..."
              className="filter-control-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Activity Type select */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Activity Type</label>
            <select
              className="filter-control-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="User">User Action</option>
              <option value="Security">Security Event</option>
              <option value="System">System Log</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="filter-input-wrapper">
            <label className="filter-label">Date</label>
            <input
              type="date"
              className="filter-control-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="filter-actions-wrapper">
            <button className="btn btn-outline reset-filters-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* 4. Table list panel */}
      <div className="card glass erp-dashboard-panel" style={{ padding: '20px 24px' }}>
        <h3 className="audit-table-title">Activity Log Records</h3>
        
        <div className="table-container-scroll">
          <table className="erp-dashboard-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="log-timestamp-cell">{log.timestamp}</td>
                    <td><span className="log-user-badge">{log.user}</span></td>
                    <td style={{ fontWeight: '600' }}>{log.action}</td>
                    <td><span className="badge category-badge">{log.module}</span></td>
                    <td className="log-desc-text">{log.desc}</td>
                    <td>
                      <span className={`status-pill ${log.status === 'Success' ? 'status-active' : 'status-warning-badge'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No audit activities match the active search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination controls */}
        <div className="audit-pagination-bar">
          <span className="pagination-text">Showing {filteredLogs.length} of {totalLogs} events</span>
          <div className="pagination-buttons">
            <button className="pagination-btn disabled" disabled>Prev</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
