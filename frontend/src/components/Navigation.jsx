import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearUserData, isAuthenticated } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import '../styles/components.css';

const Navigation = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    }
  }, []);

  const handleLogout = async () => {
    try {
      await FirebaseService.logoutUser();
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
    clearUserData();
    setUser(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <a href="/" className="brand-link">TTI Funding</a>
        <button className="close-btn" onClick={toggleMenu}>✕</button>
      </div>

      <ul className="sidebar-menu">
        <li><a href="/">Home</a></li>
        <li><a href="/funding">Funding Opportunities</a></li>
        
        {user && user.role === 'admin' && (
          <>
            <li><a href="/admin/dashboard">Dashboard</a></li>
            <li><a href="/admin/create-funding">Create Funding</a></li>
            <li><a href="/admin/applications">Manage Applications</a></li>
          </>
        )}

        {user && user.role === 'applicant' && (
          <>
            <li><a href="/application-status">Application Status</a></li>
            <li><a href="/profile">Profile</a></li>
          </>
        )}
      </ul>

      <div className="sidebar-footer">
        {user ? (
          <div className="user-section">
            <p className="user-info">Welcome, {user.firstName}</p>
            <a href="/profile" className="sidebar-link">Profile</a>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <div className="auth-section">
            <a href="/login" className="sidebar-link">Login</a>
            <a href="/register" className="sidebar-link">Register</a>
          </div>
        )}
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </nav>
  );
};

export default Navigation;
