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

const statusMetadata = {
  submitted: { label: 'Submitted', tone: 'info' },
  'under-review': { label: 'Under Review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' }
};

const ApplicationStatus = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
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

    setUser(storedUser);
    loadApplications(storedUser);
  }, [navigate, loadApplications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter((application) => application.status === statusFilter);
  }, [applications, statusFilter]);

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

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
  };

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

  const renderStatusPill = (status) => {
    const meta = statusMetadata[status] || { label: status, tone: 'neutral' };
    return (
      <span className={`status-pill status-pill-${meta.tone}`}>
        {meta.label}
      </span>
    );
  };

  const renderApplicationDetail = () => {
    if (!selectedApplication) {
      return (
        <div className="application-detail empty">
          <h3>Select an application to view its full details</h3>
          <p>Your submitted responses will appear here for quick reference.</p>
        </div>
      );
    }

    const {
      fundingTitle,
      fundingType,
      programmeReference,
      status,
      responses,
      rawResponses,
      submittedAt,
      updatedAt,
      adminNotes,
      feedback,
      allocationDecision,
      fundAllocation
    } = selectedApplication;

    const sections = Array.isArray(responses) && responses.length > 0
      ? responses
      : [
          {
            sectionTitle: 'Application Responses',
            fields: Object.entries(rawResponses || {}).map(([key, value]) => ({
              id: key,
              label: key,
              value
            }))
          }
        ];

    const formattedDate = (value) => {
      const date = toDate(value);
      return date ? date.toLocaleString() : 'Not recorded';
    };

    return (
      <div className="application-detail">
        <div className="detail-header">
          <div>
            <p className="detail-subtitle">Funding Opportunity</p>
            <h2>{fundingTitle || 'Funding Application'}</h2>
            <p className="detail-meta">{programmeReference || 'No reference available'}</p>
          </div>
          <div className="detail-meta-group">
            {renderStatusPill(status)}
            <span className="detail-meta">{fundingType || 'Funding type not specified'}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <p className="detail-label">Submitted on</p>
            <p className="detail-value">{formattedDate(submittedAt)}</p>
          </div>
          <div>
            <p className="detail-label">Last updated</p>
            <p className="detail-value">{formattedDate(updatedAt)}</p>
          </div>
        </div>

        {(adminNotes || feedback) && (
          <div className="detail-panel">
            <h3>Review Feedback</h3>
            {feedback && <p className="detail-copy">{feedback}</p>}
            {adminNotes && (
              <p className="detail-copy detail-copy-muted">Internal notes: {adminNotes}</p>
            )}
          </div>
        )}

        {allocationDecision?.status && (
          <div className="detail-panel">
            <h3>Allocation Decision</h3>
            <p className="detail-copy">{allocationDecision.status}</p>
            {allocationDecision.comments && (
              <p className="detail-copy detail-copy-muted">{allocationDecision.comments}</p>
            )}
          </div>
        )}

        {fundAllocation && (
          <div className="detail-panel">
            <h3>Funding Allocation</h3>
            {fundAllocation.allocationAmount && (
              <p className="detail-copy">Awarded Amount: R {Number(fundAllocation.allocationAmount).toLocaleString()}</p>
            )}
            {fundAllocation.allocationNotes && (
              <p className="detail-copy detail-copy-muted">Notes: {fundAllocation.allocationNotes}</p>
            )}
          </div>
        )}

        <div className="detail-panel">
          <h3>Submitted Responses</h3>
          {sections.map((section) => (
            <div key={section.sectionId || section.sectionTitle} className="detail-section">
              <h4>{section.sectionTitle}</h4>
              <dl>
                {(section.fields || []).map((field) => (
                  <div key={field.id || field.label} className="detail-field">
                    <dt>{field.label}</dt>
                    <dd>{field.value || 'Not provided'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    );
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
