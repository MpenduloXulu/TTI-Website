import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from '../utils/auth';
import FirebaseService from '../utils/firebase-service';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/pages.css';

const DEFAULT_APPLICATION_SECTIONS = [
  {
    id: 'personal-profile',
    title: 'Personal Profile',
    fields: [
      { id: 'name-surname', label: '1. Name & Surname', inputType: 'text', placeholder: 'Enter your answer' },
      { id: 'staff-student-number', label: '2. Staff Number/ Student Number', inputType: 'text', placeholder: 'Enter your answer' },
      { id: 'email-address', label: '3. Email Address', inputType: 'email', placeholder: 'Enter your answer' },
      { id: 'cellphone-number', label: '4. Cellphone Number', inputType: 'text', placeholder: 'Enter your answer' }
    ]
  },
  {
    id: 'innovation-projects',
    title: 'Innovation Technology/ Projects',
    fields: [
      { id: 'project-title', label: '5. Project Title', inputType: 'text', placeholder: 'Enter your answer' },
      {
        id: 'project-details',
        label: '6. Provide details about your project - Max 250 words',
        inputType: 'textarea',
        placeholder: 'Enter your answer',
        maxWords: 250
      },
      { id: 'total-funding-requested', label: '7. Total funding requested/Requested', inputType: 'number', placeholder: 'Enter your answer' },
      { id: 'purpose-of-funding', label: '8. Purpose of funding', inputType: 'textarea', placeholder: 'Enter your answer' },
      {
        id: 'technology-innovation',
        label: '9. What is new about your technology, and what market are you targeting?',
        inputType: 'textarea',
        placeholder: 'Enter your answer'
      },
      {
        id: 'technology-readiness',
        label: '10. What is the Technology Readiness Level of your technology?',
        inputType: 'text',
        placeholder: 'Enter your answer'
      }
    ]
  }
];

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const createInitialResponses = (sections) => {
  const responses = {};
  sections.forEach((section) => {
    (section.fields || []).forEach((field) => {
      responses[field.id] = '';
    });
  });
  return responses;
};

const availabilityLabels = {
  open: { label: 'Open for applications', tone: 'success' },
  upcoming: { label: 'Opening soon', tone: 'warning' },
  closed: { label: 'Closed', tone: 'danger' }
};

const FundingOpportunities = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [fundingTypeFilter, setFundingTypeFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationResponses, setApplicationResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  const applicationFormRef = useRef(null);
  const firstFieldRef = useRef(null);

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const bursaries = await FirebaseService.getBursaryOpportunities();
      const now = new Date();

      const processed = (bursaries || [])
        .map((item) => {
          const openingDate = toDate(item.openingDate);
          const closingDate = toDate(item.closingDate);
          let availability = 'open';

          if (closingDate && closingDate < now) {
            availability = 'closed';
          } else if (openingDate && openingDate > now) {
            availability = 'upcoming';
          }

          return {
            ...item,
            openingDate,
            closingDate,
            availability
          };
        })
        .sort((a, b) => {
          const availabilityOrder = { open: 0, upcoming: 1, closed: 2 };
          const availabilityDiff = (availabilityOrder[a.availability] || 3) - (availabilityOrder[b.availability] || 3);
          if (availabilityDiff !== 0) {
            return availabilityDiff;
          }
          const aClosing = a.closingDate ? a.closingDate.getTime() : Number.MAX_SAFE_INTEGER;
          const bClosing = b.closingDate ? b.closingDate.getTime() : Number.MAX_SAFE_INTEGER;
          return aClosing - bClosing;
        });

      setOpportunities(processed);
      setError('');
    } catch (loadError) {
      console.error('Available funding load error:', loadError);
      setError('Failed to load available bursaries. Please try again later.');
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
    loadOpportunities();
  }, [navigate, loadOpportunities]);

  const fundingTypes = useMemo(() => {
    const types = new Set();
    opportunities.forEach((opportunity) => {
      if (opportunity.fundingType) {
        types.add(opportunity.fundingType);
      }
    });
    return Array.from(types).sort();
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    if (fundingTypeFilter === 'all') {
      return opportunities;
    }
    return opportunities.filter((opportunity) => (opportunity.fundingType || '').toLowerCase() === fundingTypeFilter.toLowerCase());
  }, [opportunities, fundingTypeFilter]);

  const formatDate = (value) => {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : 'Not specified';
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    return `R ${numericValue.toLocaleString()}`;
  };

  const handleApply = (opportunity) => {
    if (opportunity.availability && opportunity.availability !== 'open') {
      setStatusMessage({ type: 'info', text: 'This funding opportunity is not currently accepting applications.' });
      return;
    }

    setSelectedOpportunity(opportunity);
    setApplicationResponses(createInitialResponses(DEFAULT_APPLICATION_SECTIONS));
    setStatusMessage({ type: '', text: '' });
    requestAnimationFrame(() => {
      applicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      firstFieldRef.current?.focus();
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleResponseChange = (fieldId, value) => {
    setApplicationResponses((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCancelApplication = () => {
    setSelectedOpportunity(null);
    setApplicationResponses({});
    firstFieldRef.current = null;
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    if (!selectedOpportunity || !user) return;

    const requiredMissing = DEFAULT_APPLICATION_SECTIONS.some((section) =>
      (section.fields || []).some((field) => {
        const value = applicationResponses[field.id];
        if (field.inputType === 'number') {
          return value === '' || value === null || value === undefined;
        }
        return !String(value || '').trim();
      })
    );

    if (requiredMissing) {
      setStatusMessage({ type: 'error', text: 'Please complete all the required fields before submitting.' });
      return;
    }

    const structuredResponses = DEFAULT_APPLICATION_SECTIONS.map((section) => ({
      sectionId: section.id,
      sectionTitle: section.title,
      fields: (section.fields || []).map((field) => ({
        id: field.id,
        label: field.label,
        value: applicationResponses[field.id] || ''
      }))
    }));

    const applicantName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.displayName || user?.email;

    const payload = {
      applicantId: user.uid,
      applicantEmail: user.email,
      applicantName,
      applicantRole: user.role || 'applicant',
      fundingOpportunityId: selectedOpportunity.id,
      fundingTitle: selectedOpportunity.title,
      fundingType: selectedOpportunity.fundingType,
      programmeReference: selectedOpportunity.reference || '',
      responses: structuredResponses,
      rawResponses: applicationResponses,
      applicationAttributes: DEFAULT_APPLICATION_SECTIONS,
      submittedBy: user.uid,
      lastUpdatedBy: user.uid
    };

    try {
      setSubmitting(true);
      setStatusMessage({ type: '', text: '' });
      await FirebaseService.submitApplication(payload);
      setStatusMessage({ type: 'success', text: 'Application submitted successfully. You can track the status from your dashboard.' });
      handleCancelApplication();
      await loadOpportunities();
    } catch (submitError) {
      console.error('Application submission error:', submitError);
      setStatusMessage({ type: 'error', text: submitError.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading available bursaries..." />;
  }

  return (
    <div className="available-funding-page">
      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}
      {statusMessage.text && (
        <Alert type={statusMessage.type || 'info'} message={statusMessage.text} onClose={() => setStatusMessage({ type: '', text: '' })} />
      )}

      <header className="page-header">
        <div>
          <p className="page-eyebrow">Funding Catalogue</p>
          <h1>Available Funding Bursaries</h1>
          <p className="page-subtitle">
            Browse the bursary calls published by the TTI admin team and submit your application directly when a call is open.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleBack}>Back to Dashboard</button>
          <button className="btn btn-outline" onClick={loadOpportunities}>Refresh List</button>
        </div>
      </header>

      <section className="available-funding-controls">
        <div className="available-funding-filters">
          <label htmlFor="fundingTypeFilter">Filter by funding type</label>
          <select
            id="fundingTypeFilter"
            className="filter-select"
            value={fundingTypeFilter}
            onChange={(event) => setFundingTypeFilter(event.target.value)}
          >
            <option value="all">All bursaries</option>
            {fundingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <p className="available-funding-meta">
          Showing {filteredOpportunities.length} of {opportunities.length} bursaries
        </p>
      </section>

      {filteredOpportunities.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">🔍</div>
          <h3>No bursaries match the current filters</h3>
          <p>Adjust the funding type filter or check back later for new opportunities.</p>
          <button className="btn btn-primary" onClick={() => setFundingTypeFilter('all')}>
            Reset filter
          </button>
        </div>
      ) : (
        <div className="funding-grid">
          {filteredOpportunities.map((opportunity) => {
            const meta = availabilityLabels[opportunity.availability] || { label: 'Status unavailable', tone: 'neutral' };
            const isOpen = opportunity.availability === 'open';

            return (
              <div key={opportunity.id} className="funding-card">
                <div className="available-funding-card-header">
                  <div>
                    <h3>{opportunity.title}</h3>
                    <p className="funding-description">{opportunity.description || 'No description provided.'}</p>
                  </div>
                  <span className={`status-pill status-pill-${meta.tone}`}>{meta.label}</span>
                </div>

                <div className="funding-info">
                  <span><strong>Funding type:</strong> {opportunity.fundingType || 'Not specified'}</span>
                  <span><strong>Total budget:</strong> {formatCurrency(opportunity.totalBudget)}</span>
                  {opportunity.fundingPerApplication && (
                    <span><strong>Per application:</strong> {formatCurrency(opportunity.fundingPerApplication)}</span>
                  )}
                  <span>
                    <strong>Application window:</strong> {formatDate(opportunity.openingDate)} – {formatDate(opportunity.closingDate)}
                  </span>
                </div>

                {Array.isArray(opportunity.eligibilityCriteria) && opportunity.eligibilityCriteria.length > 0 && (
                  <div className="funding-meta">
                    <strong>Eligibility highlights</strong>
                    <ul className="funding-list">
                      {opportunity.eligibilityCriteria.map((criterion, index) => (
                        <li key={`${opportunity.id}-eligibility-${index}`}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(opportunity.requiredDocuments) && opportunity.requiredDocuments.length > 0 && (
                  <div className="funding-meta">
                    <strong>Required documentation</strong>
                    <ul className="funding-list">
                      {opportunity.requiredDocuments.map((document, index) => (
                        <li key={`${opportunity.id}-document-${index}`}>{document}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="available-funding-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleApply(opportunity)}
                    disabled={!isOpen}
                  >
                    {isOpen ? 'Apply now' : 'Applications closed'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOpportunity && (
        <div ref={applicationFormRef} className="application-form-card">
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2>Application form: {selectedOpportunity.title}</h2>
              <p style={{ margin: 0, color: '#4b5563' }}>Complete the form below to submit your application for this bursary.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleCancelApplication} disabled={submitting}>
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitApplication} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {DEFAULT_APPLICATION_SECTIONS.map((section, sectionIndex) => (
              <div key={section.id} style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px' }}>{section.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(section.fields || []).map((field, fieldIndex) => {
                    const isFirstField = sectionIndex === 0 && fieldIndex === 0;
                    const value = applicationResponses[field.id] || '';
                    const commonProps = {
                      id: field.id,
                      name: field.id,
                      value,
                      onChange: (event) => handleResponseChange(field.id, event.target.value),
                      required: true,
                      placeholder: field.placeholder || ''
                    };

                    if (field.inputType === 'textarea') {
                      return (
                        <div key={field.id} className="form-group">
                          <label htmlFor={field.id}>{field.label}</label>
                          <textarea
                            {...commonProps}
                            ref={isFirstField ? firstFieldRef : undefined}
                            rows={field.maxWords ? 6 : 4}
                            maxLength={field.maxWords ? field.maxWords * 8 : undefined}
                          />
                          {field.maxWords && (
                            <small className="form-hint">Maximum {field.maxWords} words.</small>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={field.id} className="form-group">
                        <label htmlFor={field.id}>{field.label}</label>
                        <input
                          {...commonProps}
                          ref={isFirstField ? firstFieldRef : undefined}
                          type={field.inputType === 'number' ? 'number' : field.inputType || 'text'}
                          min={field.inputType === 'number' ? '0' : undefined}
                          step={field.inputType === 'number' ? '0.01' : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelApplication} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FundingOpportunities;
