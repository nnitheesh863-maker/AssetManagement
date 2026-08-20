import React from 'react';

function Notifications() {
  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card glass" style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Bell Icon */}
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(207, 142, 109, 0.1)', color: 'var(--primary)', display: 'inline-flex' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Notifications Center</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#5E4A3F', margin: 0 }}>
          This module is ready for implementation. Later, this view will connect to Express.js REST APIs and display a full PostgreSQL database query console for system alerts, production logs, shipping delays, and inventory reports.
        </p>
      </div>
    </div>
  );
}

export default Notifications;
