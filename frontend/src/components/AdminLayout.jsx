import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { clearUserData, getStoredUser } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import '../styles/admin-dashboard.css';

const AdminLayout = () => {
  const user = getStoredUser();

  const handleSignOut = async () => {
    try {
      await FirebaseService.logoutUser();
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
    clearUserData();
    window.location.href = '/';
  };

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="sidebar-header">
          <div className="brand">TTI Admin</div>
          <p className="brand-subtitle">Bursary management panel</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Funding Opportunities
          </NavLink>
          <NavLink to="/admin/applicants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Applicants
          </NavLink>
          <NavLink to="/admin/fund-allocation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Fund Allocation
          </NavLink>
          <NavLink to="/admin/declined" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Declined applicants
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {(user?.firstName?.[0] || 'A').toUpperCase()}
            </div>
            <div className="user-meta">
              <span className="name">{`${user?.firstName || 'Admin'} ${user?.lastName || ''}`.trim()}</span>
              <span className="role">Administrator</span>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
