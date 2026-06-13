// lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ IMPORTANT: Send cookies with requests
});

// Request interceptor - NO token needed! Cookie is sent automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // For HTTP-only cookies, we don't need to add anything!
    // The cookie is automatically sent by the browser
    
    // Add request timestamp
    config.headers['X-Request-Time'] = Date.now().toString();
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and add retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', error);
    }
    
    // Retry logic for network failures (max 3 retries)
    if (!error.response && !originalRequest._retry && originalRequest._retryCount !== undefined) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        console.log(`[API Retry] Attempt ${originalRequest._retryCount} for ${originalRequest.url}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount)); // Exponential backoff
        return axiosInstance(originalRequest);
      }
    }
    
    // Initialize retry count for network errors
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = 0;
      console.log(`[API Retry] Attempt 1 for ${originalRequest.url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return axiosInstance(originalRequest);
    }
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && !originalRequest._authHandled) {
      originalRequest._authHandled = true;
      
      // Clear auth state and redirect to login
      useAuthStore.getState().clearAuth();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 forbidden errors (wrong role)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message);
      // Optionally redirect to dashboard or show message
      if (typeof window !== 'undefined') {
        // Redirect to dashboard or show error
        window.location.href = '/dashboard';
      }
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error - check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;