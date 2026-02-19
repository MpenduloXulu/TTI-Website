// API Service - Axios configuration and API calls
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use(
  async (config) => {
    // Try to get Firebase token first
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Fall back to localStorage token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data)
};

// Funding API calls
export const fundingAPI = {
  getAllFundingCalls: (params = {}) => apiClient.get('/funding', { params }),
  getFundingCallById: (fundingCallId) => apiClient.get(`/funding/${fundingCallId}`),
  createFundingCall: (fundingData) => apiClient.post('/funding', fundingData),
  updateFundingCall: (fundingCallId, fundingData) => apiClient.put(`/funding/${fundingCallId}`, fundingData),
  publishFundingCall: (fundingCallId) => apiClient.post(`/funding/${fundingCallId}/publish`),
  deleteFundingCall: (fundingCallId) => apiClient.delete(`/funding/${fundingCallId}`)
};

// Application API calls
export const applicationAPI = {
  submitApplication: (applicationData) => apiClient.post('/applications', applicationData),
  getApplications: (params = {}) => apiClient.get('/applications', { params }),
  getApplicationById: (applicationId) => apiClient.get(`/applications/${applicationId}`),
  updateApplication: (applicationId, updateData) => apiClient.put(`/applications/${applicationId}`, updateData),
  assignReviewer: (applicationId, reviewerId) => apiClient.post(`/applications/${applicationId}/assign-reviewer`, { reviewerId })
};

// Review API calls
export const reviewAPI = {
  submitReview: (reviewData) => apiClient.post('/reviews', reviewData),
  getReviews: (params = {}) => apiClient.get('/reviews', { params }),
  getReviewById: (reviewId) => apiClient.get(`/reviews/${reviewId}`),
  getAssignedReviews: (params = {}) => apiClient.get('/reviews/assigned/list', { params })
};

export default apiClient;
