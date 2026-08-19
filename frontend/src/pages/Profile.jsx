import React from 'react';

function Profile({ currentUser }) {
  return (
    <div className="page-content animated fadeIn">
      <div className="card glass profile-card">
        <h2>Account Settings & Profile</h2>
        
        <div className="profile-details-section">
          <div className="profile-hero">
            <div className="avatar profile-avatar">
              {currentUser.loginId.substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-hero-text">
              <h3>{currentUser.loginId}</h3>
              <p className="profile-role">{currentUser.role}</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="info-row">
              <span className="info-label">Account Username:</span>
              <span className="info-value">{currentUser.loginId}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Email ID Address:</span>
              <span className="info-value">{currentUser.email}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">System Rights level:</span>
              <span className="info-value">
                {currentUser.role === 'System Administrator' 
                  ? 'FULL_ACCESS (Manage Users, Settings, Databases)' 
                  : 'READ_WRITE (View catalog, Request order status)'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Environment status:</span>
              <span className="info-value green-text">Online & Secure</span>
            </div>
          </div>
        </div>

        <div className="security-guidelines">
          <h4>Shiv Furniture Works Compliance Policy</h4>
          <p>This profile is verified under Shiv Furniture employee registry policy guidelines. Please log out at the end of each session to prevent unauthorized access to manufacturing data. Contact system administration for credential recovery or modifications.</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
