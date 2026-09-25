import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer token into all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resqhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiry gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login/register, clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('resqhub_token');
        localStorage.removeItem('resqhub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

export const complaintService = {
  create: (formData) => {
    return api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getDetail: (id) => api.get(`/complaints/${id}`)
};

export const emergencyService = {
  trigger: (data) => api.post('/emergencies', data),
  getMyEmergencies: () => api.get('/emergencies/my'),
  getDetail: (id) => api.get(`/emergencies/${id}`)
};

export const adminService = {
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  getEmergencies: (params) => api.get('/admin/emergencies', { params }),
  updateComplaintStatus: (id, status, remarks) => api.put(`/admin/complaints/${id}/status`, { status, remarks }),
  assignComplaint: (id, staff_id, remarks) => api.put(`/admin/complaints/${id}/assign`, { staff_id, remarks }),
  acknowledgeEmergency: (id, status = 'Acknowledged') => api.put(`/admin/emergencies/${id}/acknowledge`, { status }),
  resolveEmergency: (id) => api.put(`/admin/emergencies/${id}/resolve`),
  getStudents: () => api.get('/admin/students'),
  getStaff: () => api.get('/admin/staff'),
  getAnalytics: () => api.get('/admin/analytics')
};

export const staffService = {
  getAssignedComplaints: (params) => api.get('/staff/complaints', { params }),
  updateStatus: (id, status, resolution_notes) => api.put(`/staff/complaints/${id}/status`, { status, resolution_notes })
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};
