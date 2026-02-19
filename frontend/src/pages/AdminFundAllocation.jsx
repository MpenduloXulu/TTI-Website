import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useAdminApplications } from '../hooks/useAdminApplications';
import '../styles/admin-dashboard.css';

const AdminFundAllocation = () => {
  const {
    approvedApplicants,
    loading,
    statusMessage,
    clearStatusMessage,
    processing,
    saveFundAllocation,
    formatDateTime,
    setStatusMessage
  } = useAdminApplications();
  const [allocationDrafts, setAllocationDrafts] = useState({});

  const handleDraftChange = (applicationId, field, value) => {
    setAllocationDrafts((prev) => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        [field]: value
      }
    }));
  };

  const handleSave = async (application) => {
    const draft = allocationDrafts[application.id] || {};
    const amount = draft.amount !== undefined ? draft.amount : application.fundAllocation?.allocationAmount || 0;
    const parsedAmount = amount ? Number(amount) : 0;

    if (!parsedAmount || Number.isNaN(parsedAmount)) {
      setStatusMessage({ type: 'warning', text: 'Enter a valid allocation amount.' });
      return;
    }

    await saveFundAllocation(application.id, parsedAmount, draft.notes || application.fundAllocation?.allocationNotes || '');
    setAllocationDrafts((prev) => {
      const next = { ...prev };
      delete next[application.id];
      return next;
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading approved applicants..." />;
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
          <h1>Fund Allocation</h1>
          <p>Assign bursary values and keep track of allocations.</p>
        </header>

        {approvedApplicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>No approved applicants yet.</p>
            <span className="empty-state-hint">Approved applications will appear here for fund allocation.</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table fund-allocation-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Opportunity</th>
                  <th>Allocated Amount (R)</th>
                  <th>Notes</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedApplicants.map((application) => {
                  const draft = allocationDrafts[application.id] || {};
                  const amount = draft.amount !== undefined
                    ? draft.amount
                    : application.fundAllocation?.allocationAmount || '';
                  const notes = draft.notes !== undefined
                    ? draft.notes
                    : application.fundAllocation?.allocationNotes || '';
                  const hasAllocation = application.fundAllocation?.allocationAmount > 0;

                  return (
                    <tr key={application.id} className={hasAllocation ? 'allocated' : ''}>
                      <td>
                        <div className="applicant-cell">
                          <strong>{application.applicantName || 'N/A'}</strong>
                          <span className="applicant-email">{application.applicantEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="opportunity-badge">
                          {application.fundingTitle || application.fundingId || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="amount-input-wrapper">
                          <span className="currency-prefix">R</span>
                          <input
                            type="number"
                            min="0"
                            value={amount}
                            onChange={(event) => handleDraftChange(application.id, 'amount', event.target.value)}
                            placeholder="0"
                            className="amount-input"
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={notes}
                          onChange={(event) => handleDraftChange(application.id, 'notes', event.target.value)}
                          placeholder="Add notes..."
                          className="notes-input"
                        />
                      </td>
                      <td>
                        <span className="date-cell">
                          {application.fundAllocation?.updatedAt 
                            ? formatDateTime(application.fundAllocation.updatedAt) 
                            : application.fundAllocation?.allocatedAtIso 
                              ? formatDateTime(application.fundAllocation.allocatedAtIso)
                              : '—'}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className={`btn-save ${hasAllocation ? 'btn-update' : 'btn-primary'}`}
                          onClick={() => handleSave(application)} 
                          disabled={processing}
                        >
                          {hasAllocation ? 'Update' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminFundAllocation;
