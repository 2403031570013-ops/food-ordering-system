import axios from 'axios';

// Smart API URL detection - use env var if available, fallback based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://food-ordering-system-x6mu.onrender.com/api');

// Debug logging in development
if (typeof window !== 'undefined') {
  console.log('[API DEBUG]', {
    env_var: import.meta.env.VITE_API_URL,
    hostname: window.location.hostname,
    final_url: API_BASE_URL,
    is_localhost: window.location.hostname === 'localhost',
    mode: import.meta.env.MODE,
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to get static file URL (for images/invoices)
export const getStaticUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already absolute

  // Remove /api from base URL to get server root
  const serverRoot = API_BASE_URL.replace('/api', '');
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${serverRoot}${cleanPath}`;
};

export default api;
