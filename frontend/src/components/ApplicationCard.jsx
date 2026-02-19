import React from 'react';
import '../styles/components.css';

const ApplicationCard = ({ application, onViewDetails, onWithdraw }) => {
  const { id, fundingCallId, status, submissionDate } = application;

  return (
    <div className="application-card card">
      <div className="card-header">
        <h4>Application #{id.substring(0, 8).toUpperCase()}</h4>
        <span className={`badge ${status === 'approved' ? 'badge-success' : status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
          {status}
        </span>
      </div>

      <div className="card-body">
        <p><strong>Submitted:</strong> {new Date(submissionDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}</p>
      </div>

      <div className="card-footer">
        <button onClick={() => onViewDetails(id)} className="btn btn-primary">
          View Details
        </button>
        {status === 'submitted' && (
          <button onClick={() => onWithdraw(id)} className="btn btn-danger">
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
