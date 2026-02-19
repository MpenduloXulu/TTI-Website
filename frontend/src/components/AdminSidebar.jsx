import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getStoredUser, clearUserData } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import { fundingAPI } from '../utils/api';
import '../styles/admin-sidebar.css';

const AdminSidebar = ({ onOpenOpportunityModal }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(getStoredUser());
  const [fundingCalls, setFundingCalls] = useState([]);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    fundingType: '',
    totalBudget: '',
    openingDate: '',
    closingDate: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (opportunitiesOpen) fetchFundingCalls();
  }, [opportunitiesOpen]);

  const fetchFundingCalls = async () => {
    try {
      setLoading(true);
      const res = await fundingAPI.getAllFundingCalls();
      const calls = (res.data?.data || []).map(f => ({ id: f.id || f._id || f.fundingCallId, ...f }));
      setFundingCalls(calls);
    } catch (err) {
      console.error('Error loading funding calls', err);
      setStatusMessage('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const openOpportunities = () => {
    setOpportunitiesOpen(!opportunitiesOpen);
    setStatusMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (op) => {
    setEditingId(op.id);
    setForm({
      title: op.title || '',
      fundingType: op.fundingType || '',
      totalBudget: op.totalBudget || '',
      openingDate: op.openingDate ? op.openingDate.split('T')[0] : '',
      closingDate: op.closingDate ? op.closingDate.split('T')[0] : '',
      description: op.description || ''
    });
    setStatusMessage('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', fundingType: '', totalBudget: '', openingDate: '', closingDate: '', description: '' });
    setStatusMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    try {
      const payload = {
        title: form.title,
        fundingType: form.fundingType,
        totalBudget: parseFloat(form.totalBudget) || 0,
        openingDate: form.openingDate || null,
        closingDate: form.closingDate || null,
        description: form.description
      };
      if (editingId) {
        await fundingAPI.updateFundingCall(editingId, payload);
        setStatusMessage('Opportunity updated');
      } else {
        await fundingAPI.createFundingCall(payload);
        setStatusMessage('Opportunity created');
      }
      await fetchFundingCalls();
      handleCancelEdit();
    } catch (err) {
      console.error('Save error', err);
      setStatusMessage('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await fundingAPI.deleteFundingCall(id);
      setStatusMessage('Opportunity deleted');
      await fetchFundingCalls();
    } catch (err) {
      console.error('Delete error', err);
      setStatusMessage('Failed to delete');
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">⚙️</span>
            {isOpen && <span className="logo-text">TTI Admin</span>}
          </div>
          <button 
            className="toggle-sidebar-btn"
            onClick={toggleSidebar}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {isOpen && <h3 className="nav-section-title">Main</h3>}
            <ul className="nav-list">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                  title="Dashboard"
                >
                  <span className="nav-icon">📊</span>
                  {isOpen && <span className="nav-label">Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/funding" 
                  className={`nav-item ${isActive('/funding') ? 'active' : ''}`}
                  title="Browse Funding"
                >
                  <span className="nav-icon">💰</span>
                  {isOpen && <span className="nav-label">Funding Opportunities</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            {isOpen && <h3 className="nav-section-title">Management</h3>}
            <ul className="nav-list">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                  title="Manage Funding"
                >
                  <span className="nav-icon">📋</span>
                  {isOpen && <span className="nav-label">Manage Funding</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item`}
                  title="Applications"
                >
                  <span className="nav-icon">📝</span>
                  {isOpen && <span className="nav-label">Applications</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item`}
                  title="Reports"
                >
                  <span className="nav-icon">📈</span>
                  {isOpen && <span className="nav-label">Reports</span>}
                </Link>
              </li>
            </ul>
          </div>

          <div className="nav-section opportunities-section">
            {isOpen && <h3 className="nav-section-title">Opportunities</h3>}
            <div className="opportunities-widget">
              <button
                className={`nav-item opportunities-toggle ${opportunitiesOpen ? 'open' : ''}`}
                onClick={openOpportunities}
                title="Opportunities Management"
              >
                <span className="nav-icon">🎯</span>
                {isOpen && <span className="nav-label">Opportunities</span>}
              </button>

              {opportunitiesOpen && isOpen && (
                <div className="opportunities-panel">
                  {statusMessage && <div className="op-status">{statusMessage}</div>}
                  <form className="op-form" onSubmit={handleSave}>
                    <input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required />
                    <select name="fundingType" value={form.fundingType} onChange={handleFormChange}>
                      <option value="">Type</option>
                      <option value="Grant">Grant</option>
                      <option value="Loan">Loan</option>
                      <option value="Scholarship">Scholarship</option>
                    </select>
                    <input name="totalBudget" placeholder="Total Budget" type="number" value={form.totalBudget} onChange={handleFormChange} />
                    <div className="date-row">
                      <input name="openingDate" type="date" value={form.openingDate} onChange={handleFormChange} />
                      <input name="closingDate" type="date" value={form.closingDate} onChange={handleFormChange} />
                    </div>
                    <textarea name="description" placeholder="Short description" value={form.description} onChange={handleFormChange} rows={3} />
                    <div className="op-form-actions">
                      <button className="btn btn-sm btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
                      {editingId ? <button type="button" className="btn btn-sm" onClick={handleCancelEdit}>Cancel</button> : null}
                    </div>
                  </form>

                  <div className="opportunities-list">
                    {loading ? <div className="loading-state">Loading...</div> : (
                      fundingCalls.length === 0 ? <div className="empty-state">No opportunities</div> : (
                        fundingCalls.map(op => (
                          <div key={op.id} className="opportunity-item">
                            <div className="op-info">
                              <div className="op-title">{op.title}</div>
                              <div className="op-meta">{op.fundingType || ''} • {op.totalBudget ? `$${Number(op.totalBudget).toLocaleString()}` : '—'}</div>
                            </div>
                            <div className="op-actions">
                              <button className="btn btn-sm" onClick={() => handleEdit(op)}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(op.id)}>Del</button>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nav-section">
            {isOpen && <h3 className="nav-section-title">System</h3>}
            <ul className="nav-list">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item`}
                  title="Settings"
                >
                  <span className="nav-icon">⚙️</span>
                  {isOpen && <span className="nav-label">Settings</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-item`}
                  title="Users"
                >
                  <span className="nav-icon">👥</span>
                  {isOpen && <span className="nav-label">Users</span>}
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
            {isOpen && (
              <div className="user-info">
                <p className="user-name">{user?.firstName} {user?.lastName}</p>
                <p className="user-role">Administrator</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            <span className="logout-icon">🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={toggleSidebar}
        title="Toggle sidebar"
      >
        ☰
      </button>
    </>
  );
};

export default AdminSidebar;
