import React, { useState, useEffect } from 'react';

function AuditLogs({ defaultModuleFilter = 'All Modules' }) {
  const [allLogs, setAllLogs] = useState(() => [
    { datetime: '26 May 2026, 11:42 AM', user: 'Amit Sharma', module: 'Sales', type: 'Product', id: 'PROD-0034', action: 'Updated', field: 'Sales Price', oldVal: '₹120.00', newVal: '₹135.00' },
    { datetime: '26 May 2026, 11:15 AM', user: 'Neha Verma', module: 'Sales', type: 'Item', id: 'ITEM-0102', action: 'Updated', field: 'Cost Price', oldVal: '₹80.00', newVal: '₹85.00' },
    { datetime: '26 May 2026, 10:55 AM', user: 'Ravi Patel', module: 'Purchase', type: 'Purchase Order', id: 'PO-2026-087', action: 'Created', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 10:20 AM', user: 'Amit Sharma', module: 'Purchase', type: 'Item', id: 'ITEM-0456', action: 'Updated', field: 'Cost Price', oldVal: '₹45.00', newVal: '₹50.00' },
    { datetime: '26 May 2026, 09:48 AM', user: 'Meera Singh', module: 'BOM', type: 'BOM', id: 'BOM-2026-015', action: 'Created', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 09:30 AM', user: 'Ravi Patel', module: 'Sales', type: 'Item', id: 'ITEM-0102', action: 'Updated', field: 'Sales Price', oldVal: '₹110.00', newVal: '₹120.00' },
    { datetime: '26 May 2026, 09:10 AM', user: 'Neha Verma', module: 'Purchase', type: 'Product', id: 'PROD-0021', action: 'Deleted', field: '-', oldVal: '-', newVal: '-' },
    { datetime: '26 May 2026, 08:45 AM', user: 'Amit Sharma', module: 'Manufacturing', type: 'Manufacturing Order', id: 'MO-2026-022', action: 'Updated', field: 'Demand', oldVal: '80', newVal: '100' },
    { datetime: '26 May 2026, 08:30 AM', user: 'Meera Singh', module: 'Manufacturing', type: 'Material Consumption', id: 'MC-2026-055', action: 'Updated', field: 'Consumed Qty', oldVal: '45', newVal: '50' }
  ]);
  
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedModule, setSelectedModule] = useState(defaultModuleFilter);
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');

  const [appliedUser, setAppliedUser] = useState('All Users');
  const [appliedModule, setAppliedModule] = useState(defaultModuleFilter);
  const [appliedAction, setAppliedAction] = useState('All Actions');
  const [appliedStartDate, setAppliedStartDate] = useState('2026-05-01');
  const [appliedEndDate, setAppliedEndDate] = useState('2026-05-31');

  useEffect(() => {
    setSelectedModule(defaultModuleFilter);
    setAppliedModule(defaultModuleFilter);
  }, [defaultModuleFilter]);

  const [activePage, setActivePage] = useState(1);

  const handleFilter = () => {
    setAppliedUser(selectedUser);
    setAppliedModule(selectedModule);
    setAppliedAction(selectedAction);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setActivePage(1);
  };

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

  const filteredLogs = allLogs.filter(log => {
    const matchesUser = appliedUser === 'All Users' || log.user === appliedUser;
    const matchesModule = appliedModule === 'All Modules' || log.module === appliedModule;
    const matchesAction = appliedAction === 'All Actions' || log.action === appliedAction;
    return matchesUser && matchesModule && matchesAction;
  });

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. KPI SUMMARY CARDS */}
      <div className="sf-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sf-kpi-card">
          <div className="sf-kpi-header">
             <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
             Total Logs
          </div>
          <div className="sf-kpi-value">1265</div>
          <div className="sf-kpi-footer">
             <span className="sf-kpi-subtext">All time logs</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header" style={{ color: 'var(--sf-success)' }}>
             <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
             Create Actions
          </div>
          <div className="sf-kpi-value" style={{ color: 'var(--sf-success)' }}>356</div>
          <div className="sf-kpi-footer">
             <span className="sf-kpi-subtext">Records Created</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header" style={{ color: 'var(--sf-warning)' }}>
             <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Update Actions
          </div>
          <div className="sf-kpi-value" style={{ color: 'var(--sf-warning)' }}>789</div>
          <div className="sf-kpi-footer">
             <span className="sf-kpi-subtext">Records Updated</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-header" style={{ color: 'var(--sf-danger)' }}>
             <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             Delete Actions
          </div>
          <div className="sf-kpi-value" style={{ color: 'var(--sf-danger)' }}>120</div>
          <div className="sf-kpi-footer">
             <span className="sf-kpi-subtext">Records Deleted</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS */}
      <div className="sf-panel">
         <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '11px', color: 'var(--sf-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Start Date</label>
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-panel-border)', color: 'var(--sf-text)', padding: '8px 12px', borderRadius: '4px' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '11px', color: 'var(--sf-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>End Date</label>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-panel-border)', color: 'var(--sf-text)', padding: '8px 12px', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '11px', color: 'var(--sf-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>User</label>
               <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-panel-border)', color: 'var(--sf-text)', padding: '8px 12px', borderRadius: '4px' }}>
                  <option value="All Users">All Users</option>
                  <option value="Amit Sharma">Amit Sharma</option>
                  <option value="Neha Verma">Neha Verma</option>
               </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '11px', color: 'var(--sf-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Module</label>
               <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-panel-border)', color: 'var(--sf-text)', padding: '8px 12px', borderRadius: '4px' }}>
                  <option value="All Modules">All Modules</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
               </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '11px', color: 'var(--sf-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Actions</label>
               <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-panel-border)', color: 'var(--sf-text)', padding: '8px 12px', borderRadius: '4px' }}>
                  <option value="All Actions">All Actions</option>
                  <option value="Created">Created</option>
                  <option value="Updated">Updated</option>
                  <option value="Deleted">Deleted</option>
               </select>
            </div>

            <button className="sf-btn" onClick={handleFilter} style={{ background: 'var(--sf-gold)', color: '#000', height: '36px' }}>Filter</button>
            <button className="sf-btn" onClick={handleReset} style={{ height: '36px' }}>Reset</button>
         </div>
      </div>

      {/* 3. AUDIT LOGS DATA TABLE */}
      <div className="sf-panel">
         <div className="sf-panel-header">
            <h2 className="sf-panel-title">Audit Logs Activity</h2>
         </div>
         <div className="sf-table-wrapper">
            <table className="sf-table">
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
                  {filteredLogs.map((log, idx) => {
                     let badgeClass = 'draft';
                     if (log.action === 'Created') badgeClass = 'done';
                     if (log.action === 'Updated') badgeClass = 'warning';
                     if (log.action === 'Deleted') badgeClass = 'critical';

                     return (
                        <tr key={idx}>
                           <td style={{ color: 'var(--sf-text-muted)', fontSize: '12px' }}>{log.datetime}</td>
                           <td style={{ fontWeight: '500' }}>{log.user}</td>
                           <td style={{ color: 'var(--sf-text-muted)' }}>{log.module}</td>
                           <td>{log.type}</td>
                           <td style={{ color: 'var(--sf-gold)', fontWeight: '600' }}>{log.id}</td>
                           <td><span className={`sf-badge ${badgeClass}`}>{log.action}</span></td>
                           <td>{log.field}</td>
                           <td style={{ color: 'var(--sf-text-muted)' }}>{log.oldVal}</td>
                           <td style={{ fontWeight: '500' }}>{log.newVal}</td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

export default AuditLogs;
