import React, { useEffect, useState, useCallback, useRef } from 'react';
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

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [opportunities, setOpportunities] = useState([]);
  const [, setSelectedOpportunity] = useState(null);
  const [, setApplicationSections] = useState(DEFAULT_APPLICATION_SECTIONS);
  const [, setApplicationResponses] = useState({});
  const [, setAttachments] = useState([]);
  const [, setDocumentRequirements] = useState(DEFAULT_DOCUMENT_REQUIREMENTS);
  const [, setSelectedDocumentType] = useState(DEFAULT_DOCUMENT_REQUIREMENTS[0]?.id || '');
  const [, setDraftMeta] = useState(null);
  const [, setPanelBusy] = useState(false);
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
  }, [location.pathname, location.state, navigate, opportunities, handleSelectOpportunity]);


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
