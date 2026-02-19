import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useAdminApplications } from '../hooks/useAdminApplications';
import '../styles/admin-dashboard.css';

const AdminDeclinedApplicants = () => {
  const {
    declinedApplicants,
    loading,
    statusMessage,
    clearStatusMessage,
    formatDateTime
  } = useAdminApplications();

  if (loading) {
    return <LoadingSpinner message="Loading declined applicants..." />;
  }

  return (
    <>
      {statusMessage.text && (
        <Alert
          type={statusMessage.type || 'info'}
          message={statusMessage.text}
          onClose={clearStatusMessage}
        />
      )}

      <section className="admin-section">
        <header className="section-header">
          <h1>Declined applicants</h1>
          <p>Audit log for applicants who were not successful.</p>
        </header>

        {declinedApplicants.length === 0 ? (
          <div className="empty-state">No declined applicants.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Opportunity</th>
                <th>Decision date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {declinedApplicants.map((application) => (
                <tr key={application.id}>
                  <td>{application.applicantName || 'N/A'}</td>
                  <td>{application.applicantEmail || 'N/A'}</td>
                  <td>{application.fundingTitle || application.fundingId || '—'}</td>
                  <td>{formatDateTime(application.decisionDate)}</td>
                  <td>{application.adminNotes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
};

export default AdminDeclinedApplicants;
