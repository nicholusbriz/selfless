// lib/axios.ts
import axios from 'axios';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - redirect to login or refresh token
          console.error('Unauthorized access');
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
      }
      
      // Return error message from server if available
      if (data?.message) {
        error.message = data.message;
      } else if (data?.error) {
        error.message = data.error;
      }
    } else if (error.request) {
      // Request made but no response received
      error.message = 'Network error - no response received';
    } else {
      // Error in request setup
      error.message = error.message || 'Request setup error';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
