import React from 'react';

function Settings() {
  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card glass" style={{ maxWidth: '640px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Settings Gear Icon */}
        <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(207, 142, 109, 0.1)', color: 'var(--primary)', display: 'inline-flex' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Account Settings</h2>
        <p style={{ fontSize: '27px', lineHeight: '1.6', color: '#5E4A3F', margin: 0 }}>
          This module is ready for implementation. Later, this view will connect to Express.js REST APIs and display a full PostgreSQL database query console for user account administration, password modification, security keys, and system parameters.
        </p>
      </div>
    </div>
  );
}

export default Settings;
