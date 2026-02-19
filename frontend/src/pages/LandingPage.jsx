import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeUserData, isAuthenticated } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import Alert from '../components/Alert';
import '../styles/pages.css';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Remove automatic redirect - allow authenticated users to view landing page
  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  // Show loading screen while checking auth, but only briefly
  useEffect(() => {
    if (isCheckingAuth) {
      const timer = setTimeout(() => {
        if (!isAuthenticated()) {
          setIsCheckingAuth(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCheckingAuth]);

  // ===== LOGIN STATE =====
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, uid } = await FirebaseService.loginUser(loginData.email, loginData.password);
      let profile = null;

      try {
        profile = await FirebaseService.getUserProfile(uid);
      } catch (profileError) {
        console.warn('User profile not found in Firestore:', profileError);
      }

      const idToken = await user.getIdToken();
      const storedUser = profile
        ? {
            ...profile,
            uid,
            role: (profile.role || '').toLowerCase()
          }
        : {
            uid,
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: ''
          };

      storeUserData(storedUser, idToken);
      setUserData(storedUser);
      setShowRoleSelection(true);
    } catch (err) {
      console.error('Firebase login failed:', err);
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message.replace('Firebase: ', '').replace('auth/', '').replace('(', '').replace(')', ''));
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER STATE =====
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(registerData.password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain ${passwordErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const { user, uid } = await FirebaseService.registerUser(registerData.email, registerData.password, {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'applicant'
      });

      let profile = null;
      try {
        profile = await FirebaseService.getUserProfile(uid);
      } catch (profileError) {
        console.warn('Profile fetch after landing registration failed:', profileError);
      }

      const idToken = await user.getIdToken();
      const storedUser = profile
        ? {
            ...profile,
            uid,
            role: (profile.role || '').toLowerCase()
          }
        : {
            uid,
            email: user.email,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role: 'applicant'
          };

      storeUserData(storedUser, idToken);
      setUserData(storedUser);
      setSuccess(`Welcome, ${storedUser.firstName || storedUser.name || 'there'}! Your account has been created successfully.`);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowRoleSelection(true);
      }, 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage.replace('Firebase: ', '').replace('auth/', '').replace('(', '').replace(')', ''));
    } finally {
      setLoading(false);
    }
  };

  // ===== FORGOT PASSWORD STATE =====
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setLoading(true);

    try {
      await FirebaseService.sendPasswordReset(forgotEmail);
      setForgotSuccess('Password reset link sent to your email. Please check your inbox.');
      setForgotEmail('');
      
      setTimeout(() => {
        setActiveTab('login');
        setForgotSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
      const message = err.message || 'Failed to send reset link. Please try again.';
      setError(message.replace('Firebase: ', '').replace('auth/', '').replace('(', '').replace(')', ''));
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setForgotSuccess('');
  };

  const handleRoleSelection = async (selectedRole) => {
    if (!userData) {
      setError('User data not found. Please login again.');
      return;
    }
    
    const normalizedRole = selectedRole.toLowerCase();
    const token = localStorage.getItem('token');
    
    // Ensure token exists
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }
    
    const updatedUser = { ...userData, role: normalizedRole };

    try {
      await FirebaseService.updateUserProfile(userData.uid, { role: normalizedRole });
    } catch (updateError) {
      console.error('Failed to update role in Firestore:', updateError);
    }
    
    // Store updated user with token BEFORE navigating
    storeUserData(updatedUser, token);

    setUserData(updatedUser);
    setShowSuccessModal(false);
    setShowRoleSelection(false);

    // Clear form data
    setLoginData({ email: '', password: '' });
    
    // Navigate immediately (no delay)
    if (normalizedRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // Don't render anything while checking authentication
  if (isCheckingAuth) {
    return <div></div>;
  }

  return (
    <>
      {/* Role Selection Modal */}
      {showRoleSelection && (
        <div className="modal-overlay">
          <div className="role-selection-modal">
            <h2>Select Your Role</h2>
            <p>How would you like to access the system?</p>
            <div className="role-options">
              <button 
                className="role-option"
                onClick={() => handleRoleSelection('applicant')}
              >
                <div className="role-icon">👤</div>
                <div className="role-name">Applicant</div>
                <div className="role-desc">Apply for funding opportunities and track your applications</div>
              </button>
              <button 
                className="role-option"
                onClick={() => handleRoleSelection('admin')}
              >
                <div className="role-icon">👨‍💼</div>
                <div className="role-name">Administrator</div>
                <div className="role-desc">Manage applications, funding, and system settings</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p>{success}</p>
            <p className="redirect-text">Redirecting you now...</p>
            <div className="spinner"></div>
          </div>
        </div>
      )}

      <div className="landing-container">
        {/* Left Side - Branding */}
        <div className="landing-hero">
          <div className="hero-content">
            <div className="logo-large">
              <div className="logo-icon">📋</div>
              <h1>Application Portal</h1>
            </div>
            <p className="hero-tagline">Streamline your application process with ease</p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Easy Application Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Track Your Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="landing-auth">
          <div className="auth-container">
            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to continue to your account</p>

                {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-footer">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => switchTab('forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                <p className="auth-switch">
                  Don't have an account? {' '}
                  <button onClick={() => switchTab('register')} className="link-button">
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <div className="auth-card">
                <h2>Create Account</h2>

                {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        required
                        placeholder="John"
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-email">Email Address</label>
                    <input
                      type="email"
                      id="register-email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <small className="form-hint">
                      Must contain 8+ characters, uppercase, lowercase, and a number
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Account Type</label>
                    <select
                      id="role"
                      name="role"
                      value={registerData.role}
                      onChange={handleRegisterChange}
                      className="form-select"
                    >
                      <option value="applicant">Applicant</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account? {' '}
                  <button onClick={() => switchTab('login')} className="link-button">
                    Login
                  </button>
                </p>
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {activeTab === 'forgot-password' && (
              <div className="auth-card">
                <h2>Reset Password</h2>
                <p className="auth-subtitle">We'll send you a link to reset your password</p>

                {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
                {forgotSuccess && <Alert type="success" message={forgotSuccess} onClose={() => setForgotSuccess('')} />}

                <form onSubmit={handleForgotSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email Address</label>
                    <input
                      type="email"
                      id="forgot-email"
                      name="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <p className="auth-switch">
                  Remember your password? {' '}
                  <button onClick={() => switchTab('login')} className="link-button">
                    Back to login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
