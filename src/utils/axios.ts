import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    // Only check localStorage if we're in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, continue with request (let backend handle it)
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle auth errors in browser environment
    if (typeof window !== 'undefined' && error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized and 403 Forbidden
      if (status === 401 || status === 403) {
        // Clear stored auth data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
