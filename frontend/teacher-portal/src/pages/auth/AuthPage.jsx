import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  LockIcon,
  MailIcon,
  UserIcon,
  ServerIcon,
  AlertCircleIcon,
} from '../../components/common/Icons';
import './AuthPage.css';

export const AuthPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register, quickDemoLogin, isLoading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Error State
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regFullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter your institutional email.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
      });
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  const handleDemoLogin = () => {
    quickDemoLogin();
    navigate('/');
  };

  return (
    <div className="auth-simple-wrapper">
      <div className="auth-simple-card">
        {/* Brand Logo & Title */}
        <div className="auth-brand-center">
          <div className="auth-brand-icon">
            <ServerIcon size={20} color="#ffffff" />
          </div>
          <h1 className="auth-title">ExamLAN</h1>
          <p className="auth-subtitle">Teacher Administration Portal</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-simple-tabs">
          <button
            type="button"
            className={`auth-simple-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-simple-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-simple-error">
            <AlertCircleIcon size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-simple-form">
            <Input
              label="Email"
              type="email"
              placeholder="name@university.edu"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              icon={MailIcon}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              isPassword
              placeholder="••••••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              icon={LockIcon}
              required
              autoComplete="current-password"
            />

            <div className="auth-simple-row">
              <label className="auth-simple-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-simple-link"
                onClick={() => alert('Please contact your department lab administrator to reset password.')}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="auth-btn-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              className="auth-btn-full"
              onClick={handleDemoLogin}
            >
              ⚡ Quick Demo Sign In
            </Button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="auth-simple-form">
            <Input
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              icon={UserIcon}
              required
            />

            <Input
              label="Institutional Email"
              type="email"
              placeholder="name@university.edu"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              icon={MailIcon}
              required
            />

            <Input
              label="Password"
              type="password"
              isPassword
              placeholder="Minimum 6 characters"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              icon={LockIcon}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="auth-btn-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <div className="auth-footer-toggle">
              <span>Already have an account?</span>
              <button
                type="button"
                className="auth-simple-link bold"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="auth-simple-bottom-note">
        ExamLAN &bull; LAN Laboratory Examination System
      </p>
    </div>
  );
};
