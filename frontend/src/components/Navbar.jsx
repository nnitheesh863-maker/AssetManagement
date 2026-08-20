import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

function Navbar({ currentUser, onLogout, onNavigate, onToggleSidebar, onSearchChange, searchVal, profilePhoto }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getAvatarInitials = () => {
    if (!currentUser) return '';
    return currentUser.loginId.substring(0, 2).toUpperCase();
  };

  const handleDropdownItemClick = (view) => {
    setIsDropdownOpen(false);
    onNavigate(view);
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-left">
        {currentUser && (
          <button className="sidebar-toggle-btn" onClick={onToggleSidebar} title="Toggle Master Menu">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {currentUser && (
          <div className="search-wrapper navbar-search-left">
            <svg className="search-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="global-search-input"
              placeholder="Search orders, products, items..."
              value={searchVal || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {currentUser && (
        <div className="navbar-center-brand" onClick={() => onNavigate('dashboard')} title="Back to Dashboard">
          <div className="nav-brand-logo-emblem">
            <img src={logoImg} className="nav-brand-logo-img" alt="Shiv Furniture" />
          </div>
          <span className="nav-brand-title">SHIV FURNITURE</span>
        </div>
      )}

      {currentUser && (
        <div className="navbar-right-actions">
          {/* Notifications bell */}
          <div className="nav-action-icon-wrapper" onClick={() => onNavigate('notifications')} title="Notifications">
            <svg className="nav-action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="notification-badge-dot"></span>
          </div>

          {/* User avatar menu */}
          <div className="nav-user-dropdown-container">
            <div className="nav-user-info-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {profilePhoto ? (
                <img src={profilePhoto} className="avatar nav-avatar-circle" alt="User Avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="avatar nav-avatar-circle">{getAvatarInitials()}</div>
              )}
              <div className="nav-user-meta">
                <span className="nav-username-text">{currentUser.loginId}</span>
                <span className="nav-role-text">{currentUser.role === 'System Administrator' ? 'Admin' : 'User'}</span>
              </div>
              <svg className={`dropdown-caret-svg ${isDropdownOpen ? 'open' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="user-dropdown-menu glass">
                <div className="dropdown-user-header">
                  <span className="dropdown-username">{currentUser.loginId}</span>
                  <span className="dropdown-role">{currentUser.role}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleDropdownItemClick('profile')}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => handleDropdownItemClick('notifications')}>
                  Notifications
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={() => { setIsDropdownOpen(false); onLogout(); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
