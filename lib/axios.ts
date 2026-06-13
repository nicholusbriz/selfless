// lib/axios.ts - Optimized version
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
    // Add request timestamp
    config.headers['X-Request-Time'] = Date.now().toString();
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // ✅ Don't retry on 401 or 403 - they won't succeed
    const shouldNotRetry = [401, 403].includes(error.response?.status);
    
    // Retry logic for network failures only (not auth errors)
    if (!error.response && !shouldNotRetry) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = 0;
      }
      
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        console.log(`[API Retry] Attempt ${originalRequest._retryCount} for ${originalRequest.url}`);
        const delay = 1000 * Math.min(originalRequest._retryCount, 5);
        await new Promise(resolve => setTimeout(resolve, delay));
        return axiosInstance(originalRequest);
      }
    }
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.message);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) {
        // Don't redirect if already on dashboard
        if (!window.location.pathname.includes('/dashboard')) {
          window.location.href = '/dashboard';
        }
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