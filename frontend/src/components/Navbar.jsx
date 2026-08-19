import React from 'react';

function Navbar({ currentUser, onLogout, onNavigate }) {
  const getAvatarInitials = () => {
    if (!currentUser) return '';
    return currentUser.loginId.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-left" onClick={() => onNavigate('dashboard')}>
        <svg viewBox="0 0 24 24" className="brand-icon" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10a1 1 0 0 1 1 1v8H6V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 16v5M18 16v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="brand-text">Shiv Furniture</span>
      </div>

      {currentUser && (
        <div className="navbar-right">
          <div className="nav-user-info" onClick={() => onNavigate('profile')}>
            <div className="avatar nav-avatar">{getAvatarInitials()}</div>
            <div className="nav-user-text">
              <span className="nav-username">{currentUser.loginId}</span>
              <span className="nav-role">{currentUser.role === 'System Administrator' ? 'Admin' : 'User'}</span>
            </div>
          </div>
          <button className="btn btn-logout-nav" onClick={onLogout}>Log Out</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
