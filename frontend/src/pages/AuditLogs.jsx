import React, { useState, useEffect } from 'react';

function AuditLogs({ defaultModuleFilter = 'All Modules' }) {
  // Exact 9 rows from the Excalidraw mockup
  const allLogs = [
    { datetime: '26 May 2026, 11:42 AM', user: 'Amit Sharma', module: 'Sales', type: 'Product', id: 'PROD-0034', action: 'Updated', field: 'Sales Price', oldVal: '₹120.00', newVal: '₹135.00' },
    { datetime: '26 May 2026, 11:15 AM', user: 'Neha Verma', module: 'Sales', type: 'Item', id: 'ITEM-0102', action: 'Updated', field: 'Cost Price', oldVal: '₹80.00', newVal: '₹85.00' },
    { datetime: '26 May 2026, 10:55 AM', user: 'Ravi Patel', module: 'Purchase', type: 'Purchase Order', id: 'PO-2026-087', action: 'Created', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 10:20 AM', user: 'Amit Sharma', module: 'Purchase', type: 'Item', id: 'ITEM-0456', action: 'Updated', field: 'Cost Price', oldVal: '₹45.00', newVal: '₹50.00' },
    { datetime: '26 May 2026, 09:48 AM', user: 'Meera Singh', module: 'BOM', type: 'BOM', id: 'BOM-2026-015', action: 'Created', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 09:30 AM', user: 'Ravi Patel', module: 'Sales', type: 'Item', id: 'ITEM-0102', action: 'Updated', field: 'Sales Price', oldVal: '₹110.00', newVal: '₹120.00' },
    { datetime: '26 May 2026, 09:10 AM', user: 'Neha Verma', module: 'Purchase', type: 'Product', id: 'PROD-0021', action: 'Deleted', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 08:45 AM', user: 'Amit Sharma', module: 'Manufacturing', type: 'Manufacturing Order', id: 'MO-2026-022', action: 'Updated', field: 'Demand', oldVal: '80', newVal: '100' },
    { datetime: '26 May 2026, 08:30 AM', user: 'Meera Singh', module: 'Manufacturing', type: 'Material Consumption', id: 'MC-2026-055', action: 'Updated', field: 'Consumed Qty', oldVal: '45', newVal: '50' }
  ];

  // States for filter selectors
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedModule, setSelectedModule] = useState(defaultModuleFilter);
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');

  // Filter application states
  const [appliedUser, setAppliedUser] = useState('All Users');
  const [appliedModule, setAppliedModule] = useState(defaultModuleFilter);
  const [appliedAction, setAppliedAction] = useState('All Actions');
  const [appliedStartDate, setAppliedStartDate] = useState('2026-05-01');
  const [appliedEndDate, setAppliedEndDate] = useState('2026-05-31');

  // Sync prop changes
  useEffect(() => {
    setSelectedModule(defaultModuleFilter);
    setAppliedModule(defaultModuleFilter);
  }, [defaultModuleFilter]);

  // Pagination page state
  const [activePage, setActivePage] = useState(1);

  // Apply filters handler
  const handleFilter = () => {
    setAppliedUser(selectedUser);
    setAppliedModule(selectedModule);
    setAppliedAction(selectedAction);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setActivePage(1);
  };

  // Reset filters handler
  const handleReset = () => {
    setSelectedUser('All Users');
    setSelectedModule('All Modules');
    setSelectedAction('All Actions');
    setStartDate('2026-05-01');
    setEndDate('2026-05-31');
    setAppliedUser('All Users');
    setAppliedModule('All Modules');
    setAppliedAction('All Actions');
    setAppliedStartDate('2026-05-01');
    setAppliedEndDate('2026-05-31');
    setActivePage(1);
  };

  // Helper to parse date string e.g. "26 May 2026, 11:42 AM"
  const parseLogDate = (dateStr) => {
    try {
      const cleanStr = dateStr.split(',')[0].trim();
      const [day, monthName, year] = cleanStr.split(' ');
      const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      const month = months[monthName] !== undefined ? months[monthName] : 0;
      return new Date(parseInt(year), month, parseInt(day));
    } catch (e) {
      return new Date();
    }
  };

  // Helper to parse input date values safely
  const parseInputDate = (dateStr) => {
    if (!dateStr) return null;
    
    // 1. Try manual parts split first to guarantee local timezone Date!
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        year = parseInt(parts[2]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[0]);
      }
      if (year && !isNaN(month) && day) {
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
    
    // 2. Fallback to standard constructor
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      // Force it to local timezone to match logDate
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    return null;
  };

  // Filtered log computations
  const filteredLogs = allLogs.filter(log => {
    const matchesUser = appliedUser === 'All Users' || log.user === appliedUser;
    const matchesModule = appliedModule === 'All Modules' || log.module === appliedModule;
    const matchesAction = appliedAction === 'All Actions' || log.action === appliedAction;
    
    // Date Range filtering
    const logDate = parseLogDate(log.datetime);
    const startLimit = parseInputDate(appliedStartDate);
    const endLimit = parseInputDate(appliedEndDate);
    
    let matchesDate = true;
    if (startLimit && endLimit) {
      startLimit.setHours(0, 0, 0, 0);
      endLimit.setHours(23, 59, 59, 999);
      matchesDate = logDate >= startLimit && logDate <= endLimit;
    }

    return matchesUser && matchesModule && matchesAction && matchesDate;
  });

  return (
    <div className="page-content animated fadeIn">
      
      {/* 1. KPI SUMMARY CARDS */}
      <div className="audit-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Total Logs */}
        <div className="audit-kpi-card">
          <div className="audit-card-header" style={{ background: '#2563eb' }}>
            Total Logs
          </div>
          <div className="audit-card-body">
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#1e3a8a' }}>1265</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All time logs</span>
          </div>
        </div>

        {/* Create Actions */}
        <div className="audit-kpi-card">
          <div className="audit-card-header" style={{ background: '#10b981' }}>
            Create Actions
          </div>
          <div className="audit-card-body">
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#065f46' }}>356</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Records Created</span>
          </div>
        </div>

        {/* Update Actions */}
        <div className="audit-kpi-card">
          <div className="audit-card-header" style={{ background: '#f59e0b' }}>
            Update Actions
          </div>
          <div className="audit-card-body">
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#92400e' }}>789</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Records Updated</span>
          </div>
        </div>

        {/* Delete Actions */}
        <div className="audit-kpi-card">
          <div className="audit-card-header" style={{ background: '#ef4444' }}>
            Delete Actions
          </div>
          <div className="audit-card-body">
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#991b1b' }}>120</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Records Deleted</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & PAGINATION SECTION */}
      <div className="card glass" style={{ padding: '20px', marginBottom: '24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', flex: '1' }}>
            {/* Start Date Selector */}
            <div className="filter-input-wrapper">
              <label className="filter-label">Start Date</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  className="filter-control-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ paddingLeft: '32px', width: '160px' }}
                />
                <span style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }}>📅</span>
              </div>
            </div>

            {/* End Date Selector */}
            <div className="filter-input-wrapper">
              <label className="filter-label">End Date</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  className="filter-control-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ paddingLeft: '32px', width: '160px' }}
                />
                <span style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }}>📅</span>
              </div>
            </div>

            {/* User Dropdown */}
            <div className="filter-input-wrapper">
              <label className="filter-label">User</label>
              <select
                className="filter-control-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="All Users">All Users</option>
                <option value="Amit Sharma">Amit Sharma</option>
                <option value="Neha Verma">Neha Verma</option>
                <option value="Ravi Patel">Ravi Patel</option>
                <option value="Meera Singh">Meera Singh</option>
              </select>
            </div>

            {/* Module Dropdown */}
            <div className="filter-input-wrapper">
              <label className="filter-label">Module</label>
              <select
                className="filter-control-select"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="All Modules">All Modules</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="BOM">BOM</option>
              </select>
            </div>

            {/* Actions Dropdown */}
            <div className="filter-input-wrapper">
              <label className="filter-label">Actions</label>
              <select
                className="filter-control-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="All Actions">All Actions</option>
                <option value="Created">Created</option>
                <option value="Updated">Updated</option>
                <option value="Deleted">Deleted</option>
              </select>
            </div>

            {/* Filter & Reset Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleFilter} style={{ height: '42px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 0 }}>
                <span>🔍</span> Filter
              </button>
              <button className="btn btn-outline" onClick={handleReset} style={{ height: '42px', padding: '0 16px', marginTop: 0 }}>
                Reset
              </button>
            </div>
          </div>

          {/* Top Right Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="pagination-btn disabled" disabled style={{ padding: '0 8px' }}>&lt;</button>
            <button className={`pagination-btn ${activePage === 1 ? 'active' : ''}`} onClick={() => setActivePage(1)}>1</button>
            <button className={`pagination-btn ${activePage === 2 ? 'active' : ''}`} onClick={() => setActivePage(2)}>2</button>
            <button className={`pagination-btn ${activePage === 3 ? 'active' : ''}`} onClick={() => setActivePage(3)}>3</button>
            <span style={{ color: 'var(--text-secondary)', padding: '0 4px' }}>.........</span>
            <button className="pagination-btn" onClick={() => setActivePage(100)}>100</button>
            <button className="pagination-btn" style={{ padding: '0 8px' }}>&gt;</button>
          </div>

        </div>
      </div>

      {/* 3. AUDIT LOGS DATA TABLE */}
      <div className="card glass erp-dashboard-panel" style={{ padding: '24px 20px', boxSizing: 'border-box' }}>
        <div className="table-container-scroll">
          <table className="erp-dashboard-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Module</th>
                <th>Record Type</th>
                <th>Record ID</th>
                <th>Action</th>
                <th>Field Changed</th>
                <th>Old Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontSize: '18px' }}>{log.datetime}</td>
                    <td><span className="log-user-badge" style={{ fontSize: '15px' }}>{log.user}</span></td>
                    <td><span className="badge category-badge" style={{ fontSize: '15px' }}>{log.module}</span></td>
                    <td style={{ fontWeight: '600' }}>{log.type}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{log.id}</td>
                    <td>
                      <span className={`status-pill ${log.action === 'Created' ? 'status-active' : log.action === 'Deleted' ? 'status-warning-badge' : 'status-pending-badge'}`} style={{ padding: '4px 10px', fontSize: '14px', fontWeight: '600' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500', color: '#5E4A3F' }}>{log.field}</td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{log.oldVal}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{log.newVal}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No audit records match the current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default AuditLogs;
