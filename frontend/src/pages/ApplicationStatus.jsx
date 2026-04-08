import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import FirebaseService from '../utils/firebase-service';
import { clearUserData, getStoredUser, isAuthenticated } from '../utils/auth';
import '../styles/pages.css';

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const loadApplications = useCallback(async (currentUser) => {
    try {
      setLoading(true);
      const data = await FirebaseService.getUserApplications(currentUser.uid);

      const sorted = (data || [])
        .map((application) => {
          const submittedAt = toDate(application.submittedAt) || toDate(application.createdAt) || new Date();
          return {
            ...application,
            submittedAt,
            updatedAt: toDate(application.updatedAt) || submittedAt
          };
        })
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

      setApplications(sorted);
      setSelectedApplication((prev) => {
        if (prev) {
          const refreshed = sorted.find((app) => app.id === prev.id);
          return refreshed || sorted[0] || null;
        }
        return sorted[0] || null;
      });
      setError('');
    } catch (loadError) {
      console.error('Failed to load applications:', loadError);
      setError('Unable to load your applications at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/');
      return;
    }

    loadApplications(storedUser);
  }, [navigate, loadApplications]);

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, application) => {
        acc.total += 1;
        acc[application.status] = (acc[application.status] || 0) + 1;
        return acc;
      },
      { total: 0, submitted: 0, 'under-review': 0, approved: 0, rejected: 0, withdrawn: 0 }
    );
  }, [applications]);

  const handleViewFunding = () => {
    navigate('/funding');
  };

  const handleReturnDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    try {
      await FirebaseService.logoutUser();
    } catch (logoutError) {
      console.error('Error signing out:', logoutError);
    }
    clearUserData();
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your applications..." />;
  }

  return (
    <div className="application-status-page">
      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}

      <header className="page-header">
        <div>
          <p className="page-eyebrow">Applicant Portal</p>
          <h1>Application Status</h1>
          <p className="page-subtitle">
            Review the progress of your submissions, revisit your responses, and stay informed about important updates.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleReturnDashboard}>Back to Dashboard</button>
          <button className="btn btn-outline" onClick={handleViewFunding}>Explore Funding</button>
          <button className="btn btn-ghost" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <section className="status-summary">
        <div className="summary-card">
          <p className="summary-label">Total applications</p>
          <p className="summary-value">{statusCounts.total}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Submitted</p>
          <p className="summary-value">{statusCounts.submitted}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Under review</p>
          <p className="summary-value">{statusCounts['under-review']}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Approved</p>
          <p className="summary-value">{statusCounts.approved}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Rejected</p>
          <p className="summary-value">{statusCounts.rejected}</p>
        </div>
      </section>

      <section className="status-filter-bar">
        <label htmlFor="statusFilter" className="filter-label">Filter by status</label>
        <select
          id="statusFilter"
          className="filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All applications</option>
          <option value="submitted">Submitted</option>
          <option value="under-review">Under review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </section>

      <div className="status-layout">
       
        
      </div>
    </div>
  );
};

export default ApplicationStatus;
