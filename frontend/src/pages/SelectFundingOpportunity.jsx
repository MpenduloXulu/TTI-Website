import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

const SelectFundingOpportunity = () => {
  const navigate = useNavigate();

  return (
    <div className="select-funding-page">
      <div className="select-funding-card">
        <p className="page-eyebrow">Application Guidance</p>
        <h1>Select a funding opportunity</h1>
        <p className="page-subtitle">
          Browse the bursaries available to you, review the eligibility criteria, and choose the programme that best matches your goals.
        </p>
        <div className="select-funding-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/funding')}>
            Browse bursaries
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectFundingOpportunity;
