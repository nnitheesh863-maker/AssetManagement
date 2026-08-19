import React from 'react';

function Products() {
  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card glass" style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Armchair Icon */}
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(207, 142, 109, 0.1)', color: 'var(--primary)', display: 'inline-flex' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
            <path d="M7 3h10a1 1 0 0 1 1 1v8H6V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 16v5M18 16v5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Products & Designs Catalog</h2>
        <p style={{ fontSize: '27px', lineHeight: '1.6', color: '#5E4A3F', margin: 0 }}>
          This module is ready for implementation. Later, this view will connect to Express.js REST APIs and display a full PostgreSQL database query console for standard and custom furniture product listings, pricing matrices, and raw materials spec sheets.
        </p>
      </div>
    </div>
  );
}

export default Products;
