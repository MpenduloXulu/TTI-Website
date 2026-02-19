import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import FirebaseService from '../utils/firebase-service';
import { getStoredUser } from '../utils/auth';
import { formatDate } from '../hooks/useAdminApplications';
import '../styles/pages.css';
import '../styles/admin-dashboard.css';

const FUNDING_PROGRAMS = [
  {
    id: 'i2p',
    value: 'IDEA TO PROTOTYPE PROGRAMME (I2P)',
    reference: 'DUT- IDEA TO PROTOTYPE PROGRAMME ( I2P)'
  },
  {
    id: 'tdf',
    value: 'DUT-TTI TECHNOLOGY DEVELOPMENT FUND (TDF)',
    reference: 'DUT- TTI TECHNOLOGY DEVELOPMENT FUND ( TDF)',
    attributes: [
      {
        id: 'personal-profile',
        title: 'Personal Profile',
        fields: [
          { id: 'name-surname', label: 'Name & Surname', placeholder: 'Enter your answer', inputType: 'text' },
          { id: 'staff-student-number', label: 'Staff Number/Student Number', placeholder: 'Enter your answer', inputType: 'text' },
          { id: 'email-address', label: 'Email Address', placeholder: 'Enter your answer', inputType: 'text' },
          { id: 'cellphone-number', label: 'Cellphone Number', placeholder: 'Enter your answer', inputType: 'text' }
        ]
      },
      {
        id: 'project-details',
        title: 'Innovation Technology/Projects',
        fields: [
          { id: 'project-title', label: 'Project Title', placeholder: 'Enter your answer', inputType: 'text' },
          {
            id: 'project-overview',
            label: 'Provide details about your project (Max 250 words)',
            placeholder: 'Enter your answer',
            inputType: 'textarea',
            maxLength: 250
          },
          { id: 'total-funding-requested', label: 'Total funding requested', placeholder: 'Enter your answer', inputType: 'number' },
          { id: 'purpose-of-funding', label: 'Purpose of funding', placeholder: 'Enter your answer', inputType: 'textarea' },
          {
            id: 'technology-innovation',
            label: 'What is new about your technology, and what market are you targeting?',
            placeholder: 'Enter your answer',
            inputType: 'textarea'
          },
          {
            id: 'technology-readiness',
            label: 'What is the Technology Readiness Level of your technology?',
            placeholder: 'Enter your answer',
            inputType: 'text'
          }
        ]
      }
    ]
  },
  {
    id: 'aif',
    value: 'DUT- ALUMNI INNOVATION FUND (AIF)',
    reference: 'DUT - ALUMINI INNOVATION FUND ( AIF)'
  },
  {
    id: 'ibf',
    value: 'DUT-TTI INNOVATION BUILDER FUND (IBF)',
    reference: 'DUT- TTI INNOVATION BUILDER FUND ( IBF)'
  }
];

const createEmptyBursaryForm = () => ({
  title: '',
  fundingType: '',
  totalBudget: '',
  closingDate: '',
  openingDate: '',
  description: '',
  eligibility: '',
  applicationAttributes: []
});

const cloneProgramAttributes = (sections = []) =>
  sections.map((section) => ({
    ...section,
    fields: Array.isArray(section.fields)
      ? section.fields.map((field) => ({ ...field }))
      : []
  }));

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [bursaries, setBursaries] = useState([]);
  const [bursaryForm, setBursaryForm] = useState(createEmptyBursaryForm());
  const [editingBursaryId, setEditingBursaryId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [processing, setProcessing] = useState(false);
  const currentUser = getStoredUser();

  const loadBursaries = async () => {
    try {
      setLoading(true);
      const records = await FirebaseService.getBursaryOpportunities();
      setBursaries(records);
    } catch (error) {
      console.error('Load bursaries error', error);
      setStatusMessage({ type: 'error', text: 'Failed to load bursary opportunities.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBursaries();
  }, []);

  const handleBursaryFormChange = (event) => {
    const { name, value } = event.target;
    setBursaryForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetBursaryForm = () => {
    setBursaryForm(createEmptyBursaryForm());
    setEditingBursaryId(null);
  };

  const handleEditBursary = (record) => {
    setEditingBursaryId(record.id);
    setBursaryForm({
      title: record.title || '',
      fundingType: record.fundingType || '',
      totalBudget: record.totalBudget ? String(record.totalBudget) : '',
      openingDate: record.openingDate || '',
      closingDate: record.closingDate || '',
      description: record.description || '',
      eligibility: Array.isArray(record.eligibilityCriteria)
        ? record.eligibilityCriteria.join('\n')
        : record.eligibilityCriteria || '',
      applicationAttributes: Array.isArray(record.applicationAttributes)
        ? cloneProgramAttributes(record.applicationAttributes)
        : cloneProgramAttributes(
            (FUNDING_PROGRAMS.find((program) => program.value === record.fundingType) || {}).attributes || []
          )
    });
  };

  const handleSelectFundingType = (value) => {
    const program = FUNDING_PROGRAMS.find((entry) => entry.value === value);
    setBursaryForm((prev) => ({
      ...prev,
      fundingType: value,
      applicationAttributes: program?.attributes ? cloneProgramAttributes(program.attributes) : []
    }));
  };

  const handleClearFundingType = () => {
    setBursaryForm((prev) => ({
      ...prev,
      fundingType: '',
      applicationAttributes: []
    }));
  };

  const handleDeleteBursary = async (bursaryId) => {
    if (!window.confirm('Delete this bursary opportunity?')) return;
    try {
      setProcessing(true);
      await FirebaseService.deleteBursaryOpportunity(bursaryId);
      await loadBursaries();
      setStatusMessage({ type: 'success', text: 'Bursary opportunity removed.' });
    } catch (error) {
      console.error('Bursary delete error', error);
      setStatusMessage({ type: 'error', text: 'Failed to delete bursary opportunity.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitBursary = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setStatusMessage({ type: '', text: '' });

    if (!bursaryForm.fundingType) {
      setStatusMessage({ type: 'error', text: 'Select a funding type before creating an opportunity.' });
      setProcessing(false);
      return;
    }

    const payload = {
      title: bursaryForm.title.trim(),
      fundingType: bursaryForm.fundingType.trim(),
      totalBudget: bursaryForm.totalBudget ? Number(bursaryForm.totalBudget) : 0,
      openingDate: bursaryForm.openingDate || null,
      closingDate: bursaryForm.closingDate || null,
      description: bursaryForm.description.trim(),
      eligibilityCriteria: bursaryForm.eligibility
        ? bursaryForm.eligibility.split('\n').map((line) => line.trim()).filter(Boolean)
        : [],
      applicationAttributes: bursaryForm.applicationAttributes,
      lastUpdatedBy: currentUser?.uid || currentUser?.id || 'admin'
    };

    try {
      if (editingBursaryId) {
        await FirebaseService.updateBursaryOpportunity(editingBursaryId, payload);
        setStatusMessage({ type: 'success', text: 'Bursary opportunity updated.' });
      } else {
        await FirebaseService.createBursaryOpportunity(payload);
        setStatusMessage({ type: 'success', text: 'Bursary opportunity created.' });
      }
      resetBursaryForm();
      await loadBursaries();
    } catch (error) {
      console.error('Bursary save error', error);
      setStatusMessage({ type: 'error', text: 'Failed to save bursary opportunity.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bursary opportunities..." />;
  }

  return (
    <>
      {statusMessage.text && (
        <Alert
          type={statusMessage.type || 'info'}
          message={statusMessage.text}
          onClose={() => setStatusMessage({ type: '', text: '' })}
        />
      )}

      <section className="admin-section">
        <header className="section-header">
          <h1>Funding Opportunities</h1>
          <p>Manage the bursary programmes available to applicants.</p>
        </header>

        <div className="bursary-panel">
          <form className="bursary-form" onSubmit={handleSubmitBursary}>
            <div className="funding-type-selector">
              <h2>Select a funding type</h2>
              <p>Choose a programme to unlock the relevant funding opportunity form.</p>
              <div className="funding-type-grid">
                {FUNDING_PROGRAMS.map((program) => {
                  const isSelected = bursaryForm.fundingType === program.value;
                  return (
                    <button
                      key={program.id}
                      type="button"
                      className={`funding-type-card${isSelected ? ' selected' : ''}`}
                      onClick={() => handleSelectFundingType(program.value)}
                      disabled={processing && !isSelected}
                    >
                      <span className="funding-type-name">{program.value}</span>
                      <span className="funding-type-reference">{program.reference}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {bursaryForm.fundingType ? (
              <>
                <div className="selected-type-banner">
                  <div>
                    <span className="selected-type-label">Selected programme</span>
                    <span className="selected-type-value">{bursaryForm.fundingType}</span>
                  </div>
                  <button type="button" className="link-button" onClick={handleClearFundingType} disabled={processing}>
                    Change selection
                  </button>
                </div>
                {bursaryForm.applicationAttributes.length > 0 && (
                  <div className="programme-attributes">
                    <h3>Applicant form requirements</h3>
                    {bursaryForm.applicationAttributes.map((section) => (
                      <div key={section.id} className="programme-attributes-section">
                        <h4>{section.title}</h4>
                        <ul>
                          {Array.isArray(section.fields) &&
                            section.fields.map((field) => (
                              <li key={field.id}>
                                <span className="programme-field-label">{field.label}</span>
                                <span className="programme-field-placeholder">{field.placeholder}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-row">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    name="title"
                    value={bursaryForm.title}
                    onChange={handleBursaryFormChange}
                    placeholder="Youth Skills Bursary"
                    required
                  />
                </div>
                <div className="form-grid">
                  <div>
                    <label htmlFor="totalBudget">Total budget</label>
                    <input
                      id="totalBudget"
                      name="totalBudget"
                      type="number"
                      min="0"
                      value={bursaryForm.totalBudget}
                      onChange={handleBursaryFormChange}
                      placeholder="50000"
                    />
                  </div>
                  <div className="read-only-type">
                    <span className="read-only-type-label">Programme type</span>
                    <span className="read-only-type-value">{bursaryForm.fundingType}</span>
                  </div>
                </div>
                <div className="form-grid">
                  <div>
                    <label htmlFor="openingDate">Opening date</label>
                    <input
                      id="openingDate"
                      name="openingDate"
                      type="date"
                      value={bursaryForm.openingDate}
                      onChange={handleBursaryFormChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="closingDate">Closing date</label>
                    <input
                      id="closingDate"
                      name="closingDate"
                      type="date"
                      value={bursaryForm.closingDate}
                      onChange={handleBursaryFormChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={bursaryForm.description}
                    onChange={handleBursaryFormChange}
                    placeholder="Brief overview of the bursary opportunity"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="eligibility">Eligibility notes (one per line)</label>
                  <textarea
                    id="eligibility"
                    name="eligibility"
                    rows={3}
                    value={bursaryForm.eligibility}
                    onChange={handleBursaryFormChange}
                    placeholder="Matriculated in 2025\nHousehold income below R150k"
                  />
                </div>
                <div className="form-actions">
                  {editingBursaryId ? (
                    <>
                      <button type="submit" className="btn-primary" disabled={processing}>
                        {processing ? 'Saving...' : 'Update opportunity'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={resetBursaryForm} disabled={processing}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="submit" className="btn-primary" disabled={processing}>
                      {processing ? 'Saving...' : 'Create opportunity'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="funding-type-placeholder">Select a funding type to start capturing the opportunity details.</div>
            )}
          </form>

          <div className="bursary-list">
            <h2>Existing opportunities</h2>
            {bursaries.length === 0 ? (
              <div className="empty-state">No bursary opportunities created yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Budget</th>
                    <th>Window</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bursaries.map((record) => (
                    <tr key={record.id}>
                      <td>{record.title}</td>
                      <td>{record.fundingType || '—'}</td>
                      <td>{record.totalBudget ? `R ${Number(record.totalBudget).toLocaleString()}` : '—'}</td>
                      <td>{formatDate(record.openingDate)} – {formatDate(record.closingDate)}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => handleEditBursary(record)}>Edit</button>
                          <button type="button" className="danger" onClick={() => handleDeleteBursary(record.id)} disabled={processing}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;