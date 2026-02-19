import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeUserData, isAuthenticated } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import Alert from '../components/Alert';
import '../styles/pages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'applicant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { user, uid } = await FirebaseService.registerUser(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });

      let profile = null;
      try {
        profile = await FirebaseService.getUserProfile(uid);
      } catch (profileError) {
        console.warn('Profile fetch after registration failed:', profileError);
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
            firstName: formData.firstName,
            lastName: formData.lastName,
              role: formData.role.toLowerCase()
          };

      storeUserData(storedUser, idToken);

      setSuccess(`Welcome, ${storedUser.firstName || storedUser.name || 'there'}! Your account has been created successfully.`);
      setShowSuccessModal(true);

      setTimeout(() => {
        if ((storedUser.role || '').toLowerCase() === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 2500);
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.message || 'Registration failed. Please try again.';
        setError(message.replace('Firebase: ', '').replace('auth/', '').replace('(', '').replace(')', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <div className="auth-container">
        <div className="auth-card card">
          <h2>Register</h2>
          <p className="auth-subtitle">Create your account to get started</p>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <small>At least 8 characters with uppercase, lowercase, and numbers</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="applicant">Applicant</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
