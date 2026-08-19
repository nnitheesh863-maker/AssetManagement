import React from 'react';

function PurchaseOrders() {
  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card glass" style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Shopping Bag Icon */}
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(207, 142, 109, 0.1)', color: 'var(--primary)', display: 'inline-flex' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Purchase Orders Module</h2>
        <p style={{ fontSize: '27px', lineHeight: '1.6', color: '#5E4A3F', margin: 0 }}>
          This module is ready for implementation. Later, this view will connect to Express.js REST APIs and display a full PostgreSQL database query console for raw materials procurement, purchase requisitions, and vendor details.
        </p>
      </div>
    </div>
  );
}

export default PurchaseOrders;
