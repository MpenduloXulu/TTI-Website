// Common utilities
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusBadgeClass = (status) => {
  const statusMap = {
    'draft': 'badge-secondary',
    'submitted': 'badge-primary',
    'under-review': 'badge-info',
    'approved': 'badge-success',
    'rejected': 'badge-danger',
    'open': 'badge-success',
    'closed': 'badge-secondary',
    'archived': 'badge-dark'
  };
  return statusMap[status] || 'badge-secondary';
};

export const calculateDaysUntilDeadline = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isDeadlineApproaching = (deadline, threshold = 7) => {
  return calculateDaysUntilDeadline(deadline) <= threshold && calculateDaysUntilDeadline(deadline) > 0;
};

export const isDeadlinePassed = (deadline) => {
  return calculateDaysUntilDeadline(deadline) <= 0;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
