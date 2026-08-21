import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

function Register({ users, onRegisterSuccess, onNavigateToLogin }) {
  // Fields
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // Feedbacks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const checkPasswordStrength = (pass) => {
    const hasSmall = /[a-z]/.test(pass);
    const hasLarge = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+=[\]{};:'",<.>/?|\\-]/.test(pass);
    const hasLength = pass.length > 8;
    return {
      hasSmall,
      hasLarge,
      hasSpecial,
      hasLength,
      isValid: hasSmall && hasLarge && hasSpecial && hasLength
    };
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Login ID: between 6-12 chars
    if (loginId.length < 6 || loginId.length > 12) {
      setErrorMessage('Login ID must be between 6 and 12 characters.');
      return;
    }

    // 2. Email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid Email ID.');
      return;
    }

    // 3. Password strength and match
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      setErrorMessage('Password must contain a lowercase letter, an uppercase letter, a special character, and be more than 8 characters.');
      return;
    }

    // 4. Password match
    if (password !== rePassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Submit registration to backend Mongoose database
    const API_BASE_URL = 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        loginId, 
        email, 
        password,
        name: loginId,
        mobile: '',
        address: ''
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Registration successful! Awaiting Admin activation.');
        setTimeout(() => {
          onRegisterSuccess({ loginId, email, role: 'PENDING' });
        }, 1800);
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    })
    .catch((err) => {
      console.error('Registration error:', err);
      setErrorMessage('Server unreachable. Please try again later.');
    });
  };

  const passwordStrength = checkPasswordStrength(password);

  return (
    <div className="auth-container register-container">
      {/* Brand logo container */}
      <div className="brand-logo-container">
        <div className="brand-logo-emblem">
          <img src={logoImg} className="brand-logo-img" alt="Shiv Furniture" />
        </div>
        <h1 className="brand-title">SHIV FURNITURE</h1>
        <p className="brand-subtitle">Premium Asset & Inventory Management</p>
      </div>

      <div className="card glass signup-card">
        <h2>Sign up Page</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="regLoginId">Enter Login Id</label>
            <input
              type="text"
              id="regLoginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="6-12 characters"
              minLength={6}
              maxLength={12}
              required
            />
            <div className="input-hint">Length must be between 6 and 12 characters.</div>
          </div>

          <div className="input-group">
            <label htmlFor="regEmail">Enter Email Id</label>
            <input
              type="email"
              id="regEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="regPassword">Enter Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="regPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
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

            {password.length > 0 && (
              <div className="password-checklist">
                <div className={`check-item ${passwordStrength.hasLength ? 'valid' : 'invalid'}`}>
                  <span className="check-icon">{passwordStrength.hasLength ? '✓' : '✗'}</span> More than 8 characters
                </div>
                <div className={`check-item ${passwordStrength.hasSmall ? 'valid' : 'invalid'}`}>
                  <span className="check-icon">{passwordStrength.hasSmall ? '✓' : '✗'}</span> Small case letter (a-z)
                </div>
                <div className={`check-item ${passwordStrength.hasLarge ? 'valid' : 'invalid'}`}>
                  <span className="check-icon">{passwordStrength.hasLarge ? '✓' : '✗'}</span> Large case letter (A-Z)
                </div>
                <div className={`check-item ${passwordStrength.hasSpecial ? 'valid' : 'invalid'}`}>
                  <span className="check-icon">{passwordStrength.hasSpecial ? '✓' : '✗'}</span> Special character (!@#$ etc.)
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="rePassword">Re-Enter Password</label>
            <div className="password-wrapper">
              <input
                type={showRePassword ? 'text' : 'password'}
                id="rePassword"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowRePassword(!showRePassword)}
                title={showRePassword ? 'Hide password' : 'Show password'}
              >
                {showRePassword ? (
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
            {rePassword.length > 0 && password !== rePassword && (
              <div className="input-warning">Passwords do not match.</div>
            )}
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

          <button type="submit" className="btn btn-primary">SIGN UP</button>
        </form>

        <div className="card-footer single-footer">
          <span className="normal-text">Already registered? </span>
          <span className="link-text highlighted" onClick={onNavigateToLogin}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

export default Register;
