import axios from 'axios';

const API_BASE_URL = "https://food-ordering-system-x6mu.onrender.com/api";

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
