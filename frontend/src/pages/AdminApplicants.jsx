import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useAdminApplications } from '../hooks/useAdminApplications';
import '../styles/admin-dashboard.css';

const AdminApplicants = () => {
  const {
    applications,
    loading,
    statusMessage,
    clearStatusMessage,
    processing,
    updateApplicationStatus,
    formatDate,
    formatDateTime
  } = useAdminApplications();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  const openApplicationModal = (application) => {
    setSelectedApplication(application);
    setNotesDraft(application.adminNotes || '');
    setModalOpen(true);
  };

  const closeApplicationModal = () => {
    setModalOpen(false);
    setSelectedApplication(null);
    setNotesDraft('');
  };

  const handleDecision = async (application, status, notes) => {
    await updateApplicationStatus(application.id, status, notes);
    closeApplicationModal();
  };

  const statusClassName = (status = 'pending') => {
    const lowered = status.toLowerCase();
    if (lowered === 'approved') {
      return 'status-pill status-pill-success';
    }
    if (lowered === 'declined' || lowered === 'rejected') {
      return 'status-pill status-pill-danger';
    }
    if (lowered === 'submitted' || lowered === 'under-review') {
      return 'status-pill status-pill-info';
    }
    return 'status-pill status-pill-warning';
  };

  if (loading) {
    return <LoadingSpinner message="Loading applicants..." />;
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
          <h1>Applicants</h1>
          <p>Review submissions and update their progress.</p>
        </header>

        {applications.length === 0 ? (
          <div className="empty-state">No applicants found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Submitted</th>
                  <th>Opportunity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const isPending = application.status === 'pending';
                  return (
                    <tr key={application.id}>
                      <td><strong>{application.applicantName || 'N/A'}</strong></td>
                      <td>{application.applicantEmail || 'N/A'}</td>
                      <td>{formatDate(application.submittedAt)}</td>
                      <td>{application.fundingTitle || application.fundingId || '—'}</td>
                      <td>
                        <span className={statusClassName(application.status)}>
                          {(application.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => openApplicationModal(application)}>View</button>
                          <button
                            type="button"
                            className="success"
                            onClick={() => handleDecision(application, 'approved', application.adminNotes || '')}
                            disabled={!isPending || processing}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDecision(application, 'declined', application.adminNotes || '')}
                            disabled={!isPending || processing}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && selectedApplication && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <header className="modal-card__header">
              <h2>Applicant details</h2>
              <button type="button" className="modal-close" onClick={closeApplicationModal} aria-label="Close">
                ×
              </button>
            </header>
            <div className="modal-card__body">
              <dl className="detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{selectedApplication.applicantName || 'N/A'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedApplication.applicantEmail || 'N/A'}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatDateTime(selectedApplication.submittedAt)}</dd>
                </div>
                <div>
                  <dt>Opportunity</dt>
                  <dd>{selectedApplication.fundingTitle || selectedApplication.fundingId || '—'}</dd>
                </div>
                <div>
                  <dt>Supporting details</dt>
                  <dd>
                    {selectedApplication.answers ? (
                      <pre className="detail-pre">
                        {JSON.stringify(selectedApplication.answers, null, 2)}
                      </pre>
                    ) : (
                      'No additional details provided.'
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selectedApplication.status || 'pending'}</dd>
                </div>
              </dl>
              <label htmlFor="adminNotes" className="modal-label">Admin notes</label>
              <textarea
                id="adminNotes"
                rows={4}
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Notes visible to the applicant"
              />
            </div>
            <footer className="modal-card__footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleDecision(selectedApplication, 'declined', notesDraft)}
                disabled={processing}
              >
                Decline
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleDecision(selectedApplication, 'approved', notesDraft)}
                disabled={processing}
              >
                Approve
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminApplicants;
