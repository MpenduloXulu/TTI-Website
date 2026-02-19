import React from 'react';
import '../styles/components.css';

const FundingCard = ({ funding, onViewDetails, onApply }) => {
  const { id, title, fundingType, fundingPerAmount, closingDate, status } = funding;

  return (
    <div className="funding-card card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className={`badge ${status === 'open' ? 'badge-success' : 'badge-secondary'}`}>
          {status}
        </span>
      </div>

      <div className="card-body">
        <p><strong>Funding Type:</strong> {fundingType}</p>
        <p><strong>Funding Amount:</strong> ${fundingPerAmount}</p>
        <p><strong>Deadline:</strong> {new Date(closingDate).toLocaleDateString()}</p>
      </div>

      <div className="card-footer">
        <button onClick={() => onViewDetails(id)} className="btn btn-primary">
          View Details
        </button>
        {status === 'open' && (
          <button onClick={() => onApply(id)} className="btn btn-secondary">
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default FundingCard;
