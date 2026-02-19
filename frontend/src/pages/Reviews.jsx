import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../utils/api';
import { getStoredUser, isAuthenticated } from '../utils/auth';
import ApplicationCard from '../components/ApplicationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/pages.css';

const Reviews = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const storedUser = getStoredUser();
    setUser(storedUser);

    if (!storedUser || storedUser.role !== 'reviewer') {
      navigate('/login');
      return;
    }

    loadAssignedApplications();
  }, [navigate]);

  const loadAssignedApplications = async () => {
    try {
      setLoading(true);
      // Get applications assigned to this reviewer
      const response = await applicationAPI.getApplicationsByStatus('under-review');
      setApplications(response.data.data || []);
      setFilteredApplications(response.data.data || []);
    } catch (err) {
      setError('Failed to load applications for review');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);

    if (status === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === status)
      );
    }
  };

  const handleReviewClick = (applicationId) => {
    navigate(`/application/${applicationId}/review`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Applications for Review</h1>
        <p>Review and evaluate submitted applications</p>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="filter-section">
        <div className="form-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="applications-grid">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(application => (
            <div key={application.id} className="application-item">
              <ApplicationCard application={application} />
              <button
                className="btn btn-primary"
                onClick={() => handleReviewClick(application.id)}
              >
                Review Application
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No applications to review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
