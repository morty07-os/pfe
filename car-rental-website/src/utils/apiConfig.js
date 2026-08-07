// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

// Common fetch options with credentials
const fetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Helper function to include auth token in headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? {
    ...fetchOptions.headers,
    'Authorization': `Bearer ${token}`
  } : fetchOptions.headers;
};

// API endpoints
const endpoints = {
  login: `${API_URL}/api/auth/login`,
  signup: `${API_URL}/api/auth/signup`,
  verifyEmail: `${API_URL}/api/auth/verify-email`,
  resendVerificationCode: `${API_URL}/api/auth/resend-verification-code`,
  logout: `${API_URL}/api/auth/logout`,
  profile: `${API_URL}/api/auth/me`,
  // Add other endpoints as needed
};

export {
  API_URL,
  fetchOptions,
  getAuthToken,
  getAuthHeaders,
  endpoints
};