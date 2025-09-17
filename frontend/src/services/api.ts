import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure the token doesn't already have the Bearer prefix
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and normalize responses
api.interceptors.response.use(
  (response) => {
    // If the response has a nested data property, use that as the response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data,
        message: response.data.message,
        success: response.data.success
      };
    }
    return response;
  },
  (error) => {
    // Only logout on authentication errors, not server errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      // Only auto-logout if it's an authentication issue, not a server error
      if (errorMessage.toLowerCase().includes('token') || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('expired')) {
        console.log('Authentication token is invalid, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
