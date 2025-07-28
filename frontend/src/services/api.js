import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Plans API
export const plansAPI = {
  getPlans: () => api.get('/plans'),
  getPlan: (id) => api.get(`/plans/${id}`),
};

// Customer API
export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  getSubscription: () => api.get('/customer/subscription'),
  pauseSubscription: () => api.post('/customer/subscription/pause'),
  resumeSubscription: () => api.post('/customer/subscription/resume'),
  cancelSubscription: () => api.post('/customer/subscription/cancel'),
  getOrders: () => api.get('/customer/orders'),
};

// Payment API
export const paymentAPI = {
  processPayment: (data) => api.post('/payments/simulate', data),
  simulatePayment: (data) => api.post('/payments/simulate', data),
  getPaymentHistory: () => api.get('/payments/history'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getCustomers: () => api.get('/admin/customers'),
  getSubscriptions: () => api.get('/admin/subscriptions'),
  getProducts: () => api.get('/admin/products'),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
};

export default api; 