import React, { useState } from 'react';

function Register({ users, onRegisterSuccess, onNavigateToLogin }) {
  // Fields
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

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

    // 2. Login ID: uniqueness
    const isLoginIdTaken = users.some(
      (u) => u.loginId.toLowerCase() === loginId.toLowerCase()
    ) || loginId.toLowerCase() === 'admin123';
    
    if (isLoginIdTaken) {
      setErrorMessage('Login ID already exists.');
      return;
    }

    // 3. Email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid Email ID.');
      return;
    }

    // 4. Email: uniqueness
    const isEmailTaken = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (isEmailTaken) {
      setErrorMessage('Email ID is already registered.');
      return;
    }

    // 5. Password strength and uniqueness
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      setErrorMessage('Password must contain a lowercase letter, an uppercase letter, a special character, and be more than 8 characters.');
      return;
    }

    const isPasswordTaken = users.some(
      (u) => u.password === password
    );
    if (isPasswordTaken) {
      setErrorMessage('Password must be unique.');
      return;
    }

    // 6. Password match
    if (password !== rePassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Save success callback
    const newUser = { loginId, email, password };
    setSuccessMessage('Registration successful! Redirecting to login...');
    setTimeout(() => {
      onRegisterSuccess(newUser);
    }, 1200);
  };

  const passwordStrength = checkPasswordStrength(password);

  return (
    <div className="auth-container register-container">
      {/* Brand logo */}
      <div className="brand-logo">
        <svg viewBox="0 0 24 24" className="brand-icon" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10a1 1 0 0 1 1 1v8H6V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 16v5M18 16v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="brand-text">Shiv Furniture</span>
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
            <input
              type="password"
              id="regPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
              required
            />
            
            {password.length > 0 && (
              <div className="password-checklist">
                <div className={`check-item ${passwordStrength.hasLength ? 'valid' : 'invalid'}`}>
                  {passwordStrength.hasLength ? '✓' : '✗'} More than 8 characters
                </div>
                <div className={`check-item ${passwordStrength.hasSmall ? 'valid' : 'invalid'}`}>
                  {passwordStrength.hasSmall ? '✓' : '✗'} Small case letter (a-z)
                </div>
                <div className={`check-item ${passwordStrength.hasLarge ? 'valid' : 'invalid'}`}>
                  {passwordStrength.hasLarge ? '✓' : '✗'} Large case letter (A-Z)
                </div>
                <div className={`check-item ${passwordStrength.hasSpecial ? 'valid' : 'invalid'}`}>
                  {passwordStrength.hasSpecial ? '✓' : '✗'} Special character (!@#$ etc.)
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="rePassword">Re-Enter Password</label>
            <input
              type="password"
              id="rePassword"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
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
