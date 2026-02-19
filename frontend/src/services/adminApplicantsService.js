import FirebaseService from '../utils/firebase-service';

const toDate = (value) => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate();
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
    if (typeof value._seconds === 'number') {
      return new Date(value._seconds * 1000);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normaliseName = (record) => {
  if (record.applicantName) {
    return record.applicantName;
  }
  const applicant = record.applicant || {};
  if (applicant.name) {
    return applicant.name;
  }
  const nameParts = [applicant.firstName, applicant.lastName].filter(Boolean);
  if (nameParts.length) {
    return nameParts.join(' ');
  }
  return '';
};

const normaliseEmail = (record) => {
  if (record.applicantEmail) {
    return record.applicantEmail;
  }
  const applicant = record.applicant || {};
  return applicant.email || '';
};

const normaliseFundingTitle = (record) => {
  return (
    record.fundingTitle ||
    record.fundingCallTitle ||
    record.fundingCall?.title ||
    record.fundingCallName ||
    ''
  );
};

const normaliseAnswers = (record) => {
  if (record.answers) {
    return record.answers;
  }
  if (record.formData?.responses) {
    return record.formData.responses;
  }
  if (record.formData) {
    return record.formData;
  }
  return {};
};

const normaliseSubmittedAt = (record) => {
  return (
    toDate(record.submissionDate) ||
    toDate(record.submittedAt) ||
    toDate(record.createdAt) ||
    null
  );
};

const normaliseStatus = (record) => {
  if (record.status) {
    return record.status;
  }
  if (record.adminDecision && record.adminDecision !== 'pending') {
    return record.adminDecision;
  }
  return 'pending';
};

const normaliseApplication = (record = {}) => {
  const normalised = {
    ...record,
    id: record.id || record.applicationId || record.uid || '',
    applicantName: normaliseName(record),
    applicantEmail: normaliseEmail(record),
    fundingId: record.fundingId || record.fundingCallId || record.funding?.id || '',
    fundingTitle: normaliseFundingTitle(record),
    answers: normaliseAnswers(record),
    submittedAt: normaliseSubmittedAt(record),
    status: normaliseStatus(record)
  };

  if (!normalised.fundAllocation && record.allocation) {
    normalised.fundAllocation = record.allocation;
  }

  return normalised;
};

export const fetchAdminApplications = async () => {
  const records = await FirebaseService.getAllApplications();
  return records.map((item) => normaliseApplication(item));
};

export default {
  fetchAdminApplications
};
