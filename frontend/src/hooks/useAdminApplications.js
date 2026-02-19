import { useCallback, useEffect, useMemo, useState } from 'react';
import FirebaseService from '../utils/firebase-service';
import { fetchAdminApplications } from '../services/adminApplicantsService';
import { getStoredUser } from '../utils/auth';

const normalizeStatus = (status) => {
  if (!status) return 'pending';
  if (status === 'approved') return 'approved';
  if (status === 'declined' || status === 'rejected') return 'declined';
  return 'pending';
};

const toDateObject = (value) => {
  if (!value) return null;
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate();
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value) => {
  const date = toDateObject(value);
  return date ? date.toLocaleDateString() : '—';
};

export const formatDateTime = (value) => {
  const date = toDateObject(value);
  return date ? date.toLocaleString() : '—';
};

export const useAdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [processing, setProcessing] = useState(false);
  const currentUser = getStoredUser();

  const refreshApplications = useCallback(async () => {
    try {
      setLoading(true);
      const records = await fetchAdminApplications();
      setApplications(
        records.map((record) => ({
          ...record,
          status: normalizeStatus(record.status)
        }))
      );
      setError('');
    } catch (err) {
      console.error('Admin applications load error', err);
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const pendingApplicants = useMemo(
    () => applications.filter((app) => app.status === 'pending'),
    [applications]
  );

  const approvedApplicants = useMemo(
    () => applications.filter((app) => app.status === 'approved'),
    [applications]
  );

  const declinedApplicants = useMemo(
    () => applications.filter((app) => app.status === 'declined'),
    [applications]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId, newStatus, notes = '') => {
      try {
        setProcessing(true);
        await FirebaseService.updateApplicationStatus(applicationId, {
          status: newStatus,
          adminDecision: newStatus,
          adminNotes: notes,
          decisionBy: currentUser?.uid || currentUser?.id || 'admin',
          decisionDate: new Date().toISOString()
        });
        await refreshApplications();
        setStatusMessage({ type: 'success', text: `Application ${newStatus}.` });
      } catch (err) {
        console.error('Status update error', err);
        setStatusMessage({ type: 'error', text: err?.message || 'Failed to update application status.' });
      } finally {
        setProcessing(false);
      }
    },
    [currentUser, refreshApplications]
  );

  const saveFundAllocation = useCallback(
    async (applicationId, allocation, notes = '') => {
      try {
        setProcessing(true);
        await FirebaseService.setFundAllocation(applicationId, {
          allocationAmount: allocation,
          allocationNotes: notes,
          allocatedBy: currentUser?.uid || currentUser?.id || 'admin',
          allocatedAtIso: new Date().toISOString()
        });
        await refreshApplications();
        setStatusMessage({ type: 'success', text: 'Fund allocation saved.' });
      } catch (err) {
        console.error('Allocation save error', err);
        setStatusMessage({ type: 'error', text: 'Failed to save fund allocation.' });
      } finally {
        setProcessing(false);
      }
    },
    [currentUser, refreshApplications]
  );

  const clearStatusMessage = useCallback(() => setStatusMessage({ type: '', text: '' }), []);

  return {
    applications,
    pendingApplicants,
    approvedApplicants,
    declinedApplicants,
    loading,
    error,
    statusMessage,
    clearStatusMessage,
    processing,
    updateApplicationStatus,
    saveFundAllocation,
    refreshApplications,
    formatDate,
    formatDateTime,
    setStatusMessage
  };
};
