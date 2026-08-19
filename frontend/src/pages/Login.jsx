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
            {successMessage && <div className="feedback success">{successMessage}</div>}

            <button type="submit" className="btn btn-primary">SIGN IN</button>
          </form>

          <div className="card-footer">
            <span className="link-text" onClick={() => switchTab('forgot')}>Forgot Password?</span>
            <span className="link-text highlighted" onClick={onNavigateToRegister}>Sign Up</span>
          </div>

          <div className="toggle-role">
            <span className="link-text role-switch" onClick={() => switchTab('admin')}>Login as System Administrator</span>
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
            {successMessage && <div className="feedback success">{successMessage}</div>}

            <button type="submit" className="btn btn-admin">SIGN IN</button>
          </form>

          <div className="card-footer">
            <span className="link-text" onClick={() => switchTab('forgot')}>Forgot Password?</span>
            <span className="link-text highlighted" onClick={onNavigateToRegister}>Sign Up</span>
          </div>

          <div className="toggle-role">
            <span className="link-text role-switch" onClick={() => switchTab('user')}>Login as User</span>
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
            {resetSuccess && <div className="feedback success">{resetSuccess}</div>}

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
