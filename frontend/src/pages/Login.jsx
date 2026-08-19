import React, { useState } from 'react';

const PRESEEDED_ADMIN = {
  loginId: 'admin123',
  password: 'AdminPassword@123'
};

function Login({ users, onLoginSuccess, onNavigateToRegister }) {
  // loginType: 'user' | 'admin' | 'forgot'
  const [loginType, setLoginType] = useState('user');

  // Fields
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [forgotLoginId, setForgotLoginId] = useState('');

  // Feedbacks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleUserLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const matchedUser = users.find(
      (u) => u.loginId === loginId && u.password === password
    );

    if (matchedUser) {
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        onLoginSuccess({
          loginId: matchedUser.loginId,
          email: matchedUser.email,
          role: 'User'
        });
      }, 600);
    } else {
      setErrorMessage('Invalid Login Id or Password');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (loginId === PRESEEDED_ADMIN.loginId && password === PRESEEDED_ADMIN.password) {
      setSuccessMessage('Welcome, Administrator!');
      setTimeout(() => {
        onLoginSuccess({
          loginId: PRESEEDED_ADMIN.loginId,
          email: 'admin@assetflow.com',
          role: 'System Administrator'
        });
      }, 600);
    } else {
      setErrorMessage('Invalid Login Id or Password');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const foundUser = users.find((u) => u.loginId === forgotLoginId);
    const isAdmin = PRESEEDED_ADMIN.loginId === forgotLoginId;

    if (foundUser || isAdmin) {
      setResetSuccess(`Password reset instructions sent to ${isAdmin ? 'admin@assetflow.com' : foundUser.email}!`);
      setForgotLoginId('');
    } else {
      setResetError('Login ID not found in database.');
    }
  };

  const switchTab = (type) => {
    setErrorMessage('');
    setSuccessMessage('');
    setResetError('');
    setResetSuccess('');
    setLoginId('');
    setPassword('');
    setForgotLoginId('');
    setLoginType(type);
  };

  return (
    <div className="auth-container">
      {/* Brand logo */}
      <div className="brand-logo">
        <svg viewBox="0 0 24 24" className="brand-icon" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10a1 1 0 0 1 1 1v8H6V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 16v5M18 16v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="brand-text">Shiv Furniture</span>
      </div>

      {/* USER LOGIN FORM */}
      {loginType === 'user' && (
        <div className="card glass">
          <h2>Login for System User</h2>
          <form onSubmit={handleUserLogin}>
            <div className="input-group">
              <label htmlFor="loginId">Login Id</label>
              <input
                type="text"
                id="loginId"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your Login Id"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {errorMessage && <div className="feedback error">{errorMessage}</div>}
            {successMessage && (
              <div className="feedback success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary">SIGN IN</button>
          </form>

          <div className="card-footer">
            <span className="link-text" onClick={() => switchTab('forgot')}>Forgot Password?</span>
            <span className="link-text highlighted" onClick={onNavigateToRegister}>Sign Up</span>
          </div>

          <div className="toggle-role">
            <button type="button" className="admin-switch-btn" onClick={() => switchTab('admin')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Login as System Administrator
            </button>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN FORM */}
      {loginType === 'admin' && (
        <div className="card glass admin-card">
          <h2 className="admin-title">Login for System Administrator</h2>
          <form onSubmit={handleAdminLogin}>
            <div className="input-group">
              <label htmlFor="adminLoginId">Login Id</label>
              <input
                type="text"
                id="adminLoginId"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter Administrator ID"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="adminPassword">Password</label>
              <input
                type="password"
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                required
              />
            </div>

            {errorMessage && <div className="feedback error">{errorMessage}</div>}
            {successMessage && (
              <div className="feedback success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <button type="submit" className="btn btn-admin">SIGN IN</button>
          </form>

          <div className="card-footer">
            <span className="link-text" onClick={() => switchTab('forgot')}>Forgot Password?</span>
            <span className="link-text highlighted" onClick={onNavigateToRegister}>Sign Up</span>
          </div>

          <div className="toggle-role">
            <button type="button" className="user-switch-btn" onClick={() => switchTab('user')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Login as User
            </button>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD FORM */}
      {loginType === 'forgot' && (
        <div className="card glass">
          <h2>Forgot Password</h2>
          <p className="forgot-desc">Enter your Login ID to receive reset instructions.</p>
          <form onSubmit={handleForgotPassword}>
            <div className="input-group">
              <label htmlFor="forgotLoginId">Login Id</label>
              <input
                type="text"
                id="forgotLoginId"
                value={forgotLoginId}
                onChange={(e) => setForgotLoginId(e.target.value)}
                placeholder="Enter your Login ID"
                required
              />
            </div>

            {resetError && <div className="feedback error">{resetError}</div>}
            {resetSuccess && (
              <div className="feedback success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{resetSuccess}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary">RESET PASSWORD</button>
          </form>

          <div className="card-footer single-footer">
            <span className="link-text highlighted" onClick={() => switchTab('user')}>Back to Login</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
