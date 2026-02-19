import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeUserData } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import Alert from '../components/Alert';
import '../styles/pages.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, uid } = await FirebaseService.loginUser(formData.email, formData.password);
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
            role: 'applicant'
          };

      storeUserData(storedUser, idToken);

      const role = (profile?.role || storedUser.role || '').toLowerCase();
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Firebase login failed:', err);
      const message = err.message || 'Login failed. Please try again.';
      setError(message.replace('Firebase: ', '').replace('auth/', '').replace('(', '').replace(')', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h2>Login</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
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
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
