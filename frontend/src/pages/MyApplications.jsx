import React, { useEffect, useState, useCallback } from 'react';
import { applicationAPI, fundingAPI } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/pages.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [fundingCalls, setFundingCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [appsResponse, fundingResponse] = await Promise.all([
        applicationAPI.getApplications(filters),
        fundingAPI.getAllFundingCalls({ limit: 6 })
      ]);
      
      setApplications(appsResponse.data.data || []);
      setFundingCalls(fundingResponse.data.data || []);
      
      // Calculate statistics
      const apps = appsResponse.data.data || [];
      setStats({
        total: apps.length,
        submitted: apps.filter(a => a.status === 'submitted').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length
      });
      
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
    
    // Set up polling to refresh funding opportunities every 10 seconds
    // This ensures new funding opportunities appear instantly
    const pollInterval = setInterval(() => {
      fundingAPI.getAllFundingCalls({ limit: 6 })
        .then(response => {
          setFundingCalls(response.data.data || []);
        })
        .catch(err => console.error('Error polling funding:', err));
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, [filters, navigate, fetchData]);

  const handleViewDetails = (applicationId) => {
    navigate(`/application/${applicationId}`);
  };

  const handleApplyForFunding = (fundingCallId) => {
    navigate(`/funding/${fundingCallId}`);
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    // TODO: Implement withdrawal
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'under-review': return 'badge-warning';
      case 'submitted': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div className="applicant-dashboard">
      {error && <Alert type="danger" message={error} />}

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Applicant Dashboard</h1>
          <p>Manage your funding applications and explore new opportunities</p>
        </div>
        <a href="/funding" className="btn btn-primary btn-lg">
          <span>+ Browse Funding Opportunities</span>
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className="dashboard-tab"
          onClick={() => navigate('/dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className="dashboard-tab active"
          onClick={() => navigate('/my-applications')}
        >
          📝 My Applications
        </button>
        <button
          className="dashboard-tab"
          onClick={() => navigate('/funding')}
        >
          🎯 Opportunities
        </button>
        <button
          className="dashboard-tab sign-out-tab"
          onClick={handleSignOut}
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Statistics Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: '#ecfdf5'}}>
            <span style={{color: '#10b981'}}>📊</span>
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: '#dbeafe'}}>
            <span style={{color: '#3b82f6'}}>📤</span>
          </div>
          <div className="stat-content">
            <h3>{stats.submitted}</h3>
            <p>Submitted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: '#f0fdf4'}}>
            <span style={{color: '#22c55e'}}>✓</span>
          </div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2'}}>
            <span style={{color: '#ef4444'}}>✕</span>
          </div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* My Applications Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>My Applications</h2>
            <p>Track the status of all your submitted funding applications</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="form-group">
            <label htmlFor="status">Filter by Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Applications</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <h3>No Applications Yet</h3>
            <p>You haven't submitted any applications. Explore available funding opportunities and start your journey today!</p>
            <a href="/funding" className="btn btn-primary">Explore Funding Opportunities</a>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map(application => (
              <div key={application.id} className="application-status-card">
                <div className="app-card-header">
                  <h3>{application.fundingCallTitle || 'Funding Application'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                    {application.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="app-card-body">
                  <div className="app-detail-row">
                    <span className="app-label">Submitted:</span>
                    <span className="app-value">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {application.funding && (
                    <div className="app-detail-row">
                      <span className="app-label">Requested Amount:</span>
                      <span className="app-value" style={{color: '#10b981', fontWeight: 'bold'}}>
                        ${application.fundingAmount?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  )}

                  {application.reviewedAt && (
                    <div className="app-detail-row">
                      <span className="app-label">Reviewed:</span>
                      <span className="app-value">
                        {new Date(application.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {application.feedback && (
                    <div className="app-feedback">
                      <strong>Feedback:</strong>
                      <p>{application.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="app-card-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewDetails(application.id)}
                  >
                    View Details
                  </button>
                  {application.status === 'submitted' && (
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => handleWithdraw(application.id)}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Funding Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Available Funding Opportunities</h2>
            <p>Explore and apply for new funding from TTI 🔄 (Auto-updates every 10 seconds)</p>
          </div>
          <a href="/funding" className="btn btn-outline">View All</a>
        </div>

        {fundingCalls.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">🔍</div>
            <h3>No Funding Available</h3>
            <p>There are currently no open funding opportunities. Please check back later.</p>
          </div>
        ) : (
          <div className="funding-grid">
            {fundingCalls.map(funding => (
              <div key={funding.id} className="funding-opportunity-card">
                <div className="funding-card-header">
                  <h3>{funding.title}</h3>
                  {funding.status === 'open' && (
                    <span className="badge-open">Open</span>
                  )}
                </div>

                <div className="funding-card-body">
                  <p className="funding-description">{funding.description?.substring(0, 100)}...</p>

                  <div className="funding-details">
                    <div className="detail-item">
                      <span className="detail-label">Funding Amount:</span>
                      <span className="detail-value" style={{color: '#10b981'}}>
                        ${funding.maxAmount?.toLocaleString() || 'TBD'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Deadline:</span>
                      <span className="detail-value">
                        {funding.deadline ? new Date(funding.deadline).toLocaleDateString() : 'No deadline'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Focus Area:</span>
                      <span className="detail-value">{funding.focusArea || 'General'}</span>
                    </div>
                  </div>

                  <div className="funding-progress">
                    <div className="progress-label">
                      <span>Application Progress</span>
                      <span>{funding.applicationsReceived || 0} applicants</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{width: `${Math.min((funding.applicationsReceived || 0) / 10 * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="funding-card-footer">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleApplyForFunding(funding.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
