import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

function clearAuthAndRedirectToLogin() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if token becomes invalid, force re-auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthAndRedirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const dashboardService = {
  getConfig: (params) => api.get('/dashboard', params ? { params } : undefined),
  saveConfig: (data) => api.post('/dashboard', data),
};

export default api;
