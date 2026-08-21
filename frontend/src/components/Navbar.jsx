import React from 'react';

function Navbar({ currentUser, onLogout, onToggleSidebar, onSearchChange, searchVal }) {
  return (
    <div className="sf-topbar" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="sf-header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="sf-icon-btn" onClick={onToggleSidebar} style={{ display: 'none' }}>
           <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>
        <div>
           <h1>Dashboard</h1>
           <p>Business overview and operational performance</p>
        </div>
      </div>

      <div className="sf-search">
        <svg width="16" height="16" fill="none" stroke="var(--sf-text-muted)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input 
          type="text" 
          placeholder="Search orders, products, customers..." 
          value={searchVal || ''}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="sf-header-right">
         <div className="sf-status-indicator">
            <div className="sf-status-dot"></div> ERP Connected
         </div>
         
         <div className="sf-icon-btn">
           <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
         </div>
         
         <div className="sf-user-profile" onClick={onLogout}>
            <div className="sf-avatar">EMP</div>
            <div className="sf-user-details">
               <span className="sf-user-name">{currentUser?.name || 'emp001'}</span>
               <span className="sf-user-role">Logout</span>
            </div>
            <svg width="14" height="14" fill="none" stroke="var(--sf-text-muted)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
         </div>
      </div>
    </div>
  );
}

export default Navbar;
