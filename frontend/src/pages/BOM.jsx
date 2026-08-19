import React from 'react';

function BOM() {
  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card glass" style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Document List Icon */}
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(207, 142, 109, 0.1)', color: 'var(--primary)', display: 'inline-flex' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Bills of Materials (BOM) Module</h2>
        <p style={{ fontSize: '27px', lineHeight: '1.6', color: '#5E4A3F', margin: 0 }}>
          This module is ready for implementation. Later, this view will connect to Express.js REST APIs and display a full PostgreSQL database query console for component lists, raw lumber usage, hardware lists, and labor estimates for every furniture design.
        </p>
      </div>
    </div>
  );
}

export default BOM;
