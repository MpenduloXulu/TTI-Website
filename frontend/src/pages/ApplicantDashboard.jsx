import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { isAuthenticated, getStoredUser, clearUserData } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import FirebaseService from '../utils/firebase-service';
import '../styles/pages.css';
import SelectFundingOpportunity from './SelectFundingOpportunity';

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

const DEFAULT_DOCUMENT_REQUIREMENTS = [
  { id: 'proposal', label: 'Project proposal (PDF)' },
  { id: 'budget', label: 'Budget breakdown (XLS or PDF)' },
  { id: 'cv', label: 'Curriculum Vitae' }
];

const normaliseDocumentRequirements = (opportunity) => {
  const source = Array.isArray(opportunity?.requiredDocuments) && opportunity.requiredDocuments.length > 0
    ? opportunity.requiredDocuments
    : DEFAULT_DOCUMENT_REQUIREMENTS.map((item) => item.label);

  return source.map((label) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    label
  }));
};

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

const formatCurrencyValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Not specified';
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return value;
  }
  return `R ${numericValue.toLocaleString()}`;
};

const formatDateValue = (value) => {
  const date = toDate(value);
  return date ? date.toLocaleDateString() : 'Not specified';
};

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicationSections, setApplicationSections] = useState(DEFAULT_APPLICATION_SECTIONS);
  const [applicationResponses, setApplicationResponses] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [documentRequirements, setDocumentRequirements] = useState(DEFAULT_DOCUMENT_REQUIREMENTS);
  const [selectedDocumentType, setSelectedDocumentType] = useState(DEFAULT_DOCUMENT_REQUIREMENTS[0]?.id || '');
  const [fundingTypeFilter, setFundingTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draftMeta, setDraftMeta] = useState(null);
  const [panelBusy, setPanelBusy] = useState(false);
  const firstFieldRef = useRef(null);
  const applicationPanelRef = useRef(null);

  const loadDashboardData = useCallback(async (currentUser) => {
    try {
      setLoading(true);
      setError('');
      const bursaryOpportunities = await FirebaseService.getBursaryOpportunities();

      const now = new Date();
      const processedOpportunities = (bursaryOpportunities || [])
        .map((opportunity) => {
          const openingDate = toDate(opportunity.openingDate);
          const closingDate = toDate(opportunity.closingDate);
          let availability = 'open';

          if (closingDate && closingDate < now) {
            availability = 'closed';
          } else if (openingDate && openingDate > now) {
            availability = 'upcoming';
          }

          return {
            ...opportunity,
            openingDate,
            closingDate,
            availability
          };
        })
        .sort((a, b) => {
          const availabilityOrder = { open: 0, upcoming: 1, closed: 2 };
          const orderDiff = (availabilityOrder[a.availability] || 3) - (availabilityOrder[b.availability] || 3);
          if (orderDiff !== 0) {
            return orderDiff;
          }
          const aClosing = a.closingDate ? a.closingDate.getTime() : Number.MAX_SAFE_INTEGER;
          const bClosing = b.closingDate ? b.closingDate.getTime() : Number.MAX_SAFE_INTEGER;
          return aClosing - bClosing;
        });
      setOpportunities(processedOpportunities);
    } catch (loadError) {
      console.error('Applicant dashboard load error:', loadError);
      setError('Failed to load dashboard data. Please try again later.');
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

    if ((storedUser.role || '').toLowerCase() === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    loadDashboardData(storedUser);
  }, [navigate, loadDashboardData]);

  useEffect(() => {
    const targetOpportunityId = location.state?.focusOpportunityId;
    if (!targetOpportunityId || opportunities.length === 0) {
      return;
    }

    const matchingOpportunity = opportunities.find((item) => item.id === targetOpportunityId);
    if (matchingOpportunity) {
      handleSelectOpportunity(matchingOpportunity);
    } else {
      setStatusMessage({ type: 'info', text: 'The bursary you selected is no longer available.' });
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, opportunities]);

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
    return opportunities.filter((opportunity) => {
      const matchesType = fundingTypeFilter === 'all'
        || (opportunity.fundingType || '').toLowerCase() === fundingTypeFilter.toLowerCase();
      const matchesSearch = !searchTerm
        || opportunity.title.toLowerCase().includes(searchTerm.toLowerCase())
        || (opportunity.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [opportunities, fundingTypeFilter, searchTerm]);

  const handleSignOut = async () => {
    try {
      await FirebaseService.logoutUser();
    } catch (signOutError) {
      console.error('Firebase logout error:', signOutError);
    }

    clearUserData();
    setUser(null);

    // Force a full navigation back to the landing experience
    window.location.replace('/');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleSelectOpportunity = useCallback(async (opportunity) => {
    if (!opportunity) return;
    setPanelBusy(true);
    setSelectedOpportunity(opportunity);
    const sections = Array.isArray(opportunity.applicationAttributes) && opportunity.applicationAttributes.length > 0
      ? opportunity.applicationAttributes
      : DEFAULT_APPLICATION_SECTIONS;
    setApplicationSections(sections);
    setApplicationResponses(createInitialResponses(sections));
    const requirements = normaliseDocumentRequirements(opportunity);
    setDocumentRequirements(requirements);
    setSelectedDocumentType(requirements[0]?.id || '');
    setAttachments([]);
    setDraftMeta(null);

    if (user) {
      try {
        const draft = await FirebaseService.getApplicationDraft(user.uid, opportunity.id);
        if (draft) {
          const draftResponses = draft.responses || {};
          const mergedResponses = { ...createInitialResponses(sections), ...draftResponses };
          setApplicationResponses(mergedResponses);
          const draftAttachments = Array.isArray(draft.attachments)
            ? draft.attachments.map((attachment) => {
              const uploadedAtDate = toDate(attachment.uploadedAt) || (attachment.uploadedAt ? new Date(attachment.uploadedAt) : null);
              return {
                ...attachment,
                uploadedAt: uploadedAtDate ? uploadedAtDate.toISOString() : new Date().toISOString()
              };
            })
            : [];
          setAttachments(draftAttachments);
          const draftUpdatedAt = toDate(draft.updatedAt) || (draft.updatedAt ? new Date(draft.updatedAt) : null);
          setDraftMeta(draftUpdatedAt ? { updatedAt: draftUpdatedAt.toISOString() } : null);
          setStatusMessage({ type: 'info', text: 'Draft loaded. Continue where you left off.' });
        }
      } catch (draftError) {
        console.error('Draft load error:', draftError);
        setStatusMessage({ type: 'error', text: 'Failed to load your draft. You can continue and save again.' });
      }
    }

    requestAnimationFrame(() => {
      if (applicationPanelRef.current) {
        applicationPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      firstFieldRef.current?.focus();
    });
    setPanelBusy(false);
  }, [user]);

  const handleResponseChange = (fieldId, value) => {
    setApplicationResponses((previous) => ({
      ...previous,
      [fieldId]: value
    }));
  };

  const handleUploadDocuments = async (event) => {
    if (!user || !selectedOpportunity) {
      setStatusMessage({ type: 'error', text: 'Select a funding opportunity before uploading documents.' });
      return;
    }

    if (!selectedDocumentType) {
      setStatusMessage({ type: 'error', text: 'Choose the document type you are uploading.' });
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    try {
      const uploads = [];
      for (const file of files) {
        const metadata = await FirebaseService.uploadSupportingDocument(user.uid, selectedOpportunity.id, file);
        uploads.push({
          name: metadata.name,
          url: metadata.url,
          path: metadata.path,
          size: metadata.size,
          contentType: metadata.contentType,
          base64: metadata.base64,
          uploadedAt: (toDate(metadata.uploadedAt) || new Date()).toISOString(),
          docType: selectedDocumentType,
          docLabel: documentRequirements.find((requirement) => requirement.id === selectedDocumentType)?.label || selectedDocumentType
        });
      }

      setAttachments((previous) => {
        const remaining = previous.filter((attachment) => attachment.docType !== selectedDocumentType);
        return [...remaining, ...uploads];
      });
      setStatusMessage({ type: 'success', text: 'Document uploaded successfully.' });
    } catch (uploadError) {
      console.error('Supporting document upload error:', uploadError);
      setStatusMessage({ type: 'error', text: uploadError.message || 'Failed to upload document. Please try again.' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = async (attachment) => {
    if (!attachment) return;
    try {
      await FirebaseService.deleteSupportingDocument(attachment.path);
    } catch (deleteError) {
      console.error('Attachment delete error:', deleteError);
    }
    setAttachments((previous) => previous.filter((item) => item.path !== attachment.path));
  };

  const handleSaveDraft = async () => {
    if (!user || !selectedOpportunity) return;
    setDraftSaving(true);
    try {
      await FirebaseService.saveApplicationDraft(user.uid, selectedOpportunity.id, {
        responses: applicationResponses,
        attachments
      });
      setDraftMeta({ updatedAt: new Date().toISOString() });
      setStatusMessage({ type: 'success', text: 'Draft saved successfully.' });
    } catch (saveError) {
      console.error('Draft save error:', saveError);
      setStatusMessage({ type: 'error', text: saveError.message || 'Failed to save draft. Please try again.' });
    } finally {
      setDraftSaving(false);
    }
  };

  const handleCancelApplication = () => {
    setSelectedOpportunity(null);
    setApplicationResponses({});
    setAttachments([]);
    setDraftMeta(null);
    setStatusMessage({ type: '', text: '' });
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    if (!user || !selectedOpportunity) return;

    const missingField = applicationSections.some((section) =>
      (section.fields || []).some((field) => {
        const value = applicationResponses[field.id];
        if (field.inputType === 'number') {
          return value === '' || value === null || value === undefined;
        }
        return !String(value || '').trim();
      })
    );

    if (missingField) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields before submitting.' });
      return;
    }

    const requiredIds = documentRequirements.map((requirement) => requirement.id);
    const satisfiedDocs = attachments.filter((attachment) => requiredIds.includes(attachment.docType));
    if (requiredIds.some((requirementId) => !satisfiedDocs.find((attachment) => attachment.docType === requirementId))) {
      setStatusMessage({ type: 'error', text: 'Upload all required supporting documents before submitting.' });
      return;
    }

    const structuredResponses = applicationSections.map((section) => ({
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
      applicationAttributes: applicationSections,
      attachments,
      submittedBy: user.uid,
      lastUpdatedBy: user.uid
    };

    try {
      setSubmitting(true);
      setStatusMessage({ type: '', text: '' });
      await FirebaseService.submitApplication(payload);
      await FirebaseService.deleteApplicationDraft(user.uid, selectedOpportunity.id);
      setStatusMessage({ type: 'success', text: 'Application submitted successfully. Track progress from the status panel.' });
      handleCancelApplication();
      await loadDashboardData(user);
    } catch (submitError) {
      console.error('Application submission error:', submitError);
      setStatusMessage({ type: 'error', text: submitError.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewStatus = () => {
    navigate('/application-status');
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your dashboard..." />;
  }

  return (
    <div className="applicant-dashboard-shell">
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {statusMessage.text && (
        <Alert
          type={statusMessage.type || 'info'}
          message={statusMessage.text}
          onClose={() => setStatusMessage({ type: '', text: '' })}
        />
      )}

      <header className="dashboard-topbar">
        <div>
          <p className="page-eyebrow">Applicant Workspace</p>
          <h1>Funding Applications</h1>
          <p className="topbar-subtitle">Explore opportunities, prepare your submission, and track progress in one place.</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="user-chip" onClick={handleViewProfile}>
            <span className="avatar-chip">{(user?.firstName || user?.displayName || 'A').slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.displayName || user?.email}</strong>
              <span>{(user?.role || 'applicant').toString().toUpperCase()}</span>
            </div>
          </button>
          <button type="button" className="btn btn-primary" onClick={handleViewStatus}>
            View application status
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <SelectFundingOpportunity />
    </div>
  );
};

export default ApplicantDashboard;
