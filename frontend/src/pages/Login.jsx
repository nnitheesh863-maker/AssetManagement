import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

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
  const [showPassword, setShowPassword] = useState(false);

  // Feedbacks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleUserLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Allow admin credentials on user tab for seamless UX
    if (loginId === PRESEEDED_ADMIN.loginId && password === PRESEEDED_ADMIN.password) {
      setSuccessMessage('Welcome, Administrator!');
      setTimeout(() => {
        onLoginSuccess({
          loginId: PRESEEDED_ADMIN.loginId,
          email: 'admin@assetflow.com',
          role: 'System Administrator'
        });
      }, 600);
      return;
    }

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
    setShowPassword(false);
  };

  return (
    <div className="auth-container">
      {/* Brand logo container */}
      <div className="brand-logo-container">
        <div className="brand-logo-emblem">
          <img src={logoImg} className="brand-logo-img" alt="Shiv Furniture" />
        </div>
        <h1 className="brand-title">SHIV FURNITURE</h1>
        <p className="brand-subtitle">Premium Asset & Inventory Management</p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="card glass auth-card-premium">
        {loginType !== 'forgot' && (
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-tab ${loginType === 'user' ? 'active' : ''}`}
              onClick={() => switchTab('user')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="tab-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>System User</span>
            </button>
            <button
              type="button"
              className={`segmented-tab ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => switchTab('admin')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="tab-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Administrator</span>
            </button>
          </div>
        )}

        {/* USER LOGIN FORM */}
        {loginType === 'user' && (
          <div className="form-fade-in">
            <h2 className="form-heading-premium">Login for System User</h2>
            <form onSubmit={handleUserLogin} autoComplete="off">
              <div className="input-group-premium">
                <label htmlFor="loginId">Login Id</label>
                <div className="input-with-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="input-field-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    id="loginId"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter your Login Id"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper-premium">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="input-field-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn-premium"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

              <button type="submit" className="btn btn-primary btn-premium">
                <span>SIGN IN</span>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="btn-arrow-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            <div className="card-footer-premium">
              <span className="link-text-premium" onClick={() => switchTab('forgot')}>Forgot Password?</span>
              <span className="link-text-premium highlighted" onClick={onNavigateToRegister}>Sign Up</span>
            </div>

            <div className="toggle-role-premium">
              <span className="toggle-role-text">Or switch to </span>
              <span className="toggle-role-link" onClick={() => switchTab('admin')}>Login as System Administrator</span>
            </div>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {loginType === 'admin' && (
          <div className="form-fade-in">
            <h2 className="form-heading-premium admin-title-premium">Login for System Administrator</h2>
            <form onSubmit={handleAdminLogin} autoComplete="off">
              <div className="input-group-premium">
                <label htmlFor="adminLoginId">Login Id</label>
                <div className="input-with-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="input-field-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <input
                    type="text"
                    id="adminLoginId"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter Administrator ID"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label htmlFor="adminPassword">Password</label>
                <div className="password-wrapper-premium">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="input-field-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="adminPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn-premium"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

              <button type="submit" className="btn btn-admin btn-premium-admin">
                <span>SIGN IN AS ADMIN</span>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="btn-arrow-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            <div className="card-footer-premium">
              <span className="link-text-premium" onClick={() => switchTab('forgot')}>Forgot Password?</span>
              <span className="link-text-premium highlighted" onClick={onNavigateToRegister}>Sign Up</span>
            </div>

            <div className="toggle-role-premium">
              <span className="toggle-role-text">Or switch to </span>
              <span className="toggle-role-link" onClick={() => switchTab('user')}>Login as System User</span>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {loginType === 'forgot' && (
          <div className="form-fade-in">
            <h2 className="form-heading-premium">Forgot Password</h2>
            <p className="forgot-desc-premium">Enter your Login ID to receive password reset instructions.</p>
            <form onSubmit={handleForgotPassword} autoComplete="off">
              <div className="input-group-premium">
                <label htmlFor="forgotLoginId">Login Id</label>
                <div className="input-with-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="input-field-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    id="forgotLoginId"
                    value={forgotLoginId}
                    onChange={(e) => setForgotLoginId(e.target.value)}
                    placeholder="Enter your Login ID"
                    required
                    autoComplete="off"
                  />
                </div>
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

              <button type="submit" className="btn btn-primary btn-premium">RESET PASSWORD</button>
            </form>

            <div className="card-footer-premium single-footer">
              <span className="link-text-premium highlighted" onClick={() => switchTab('user')}>Back to Login</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
