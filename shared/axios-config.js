/**
 * Axios Configuration - API client with authentication
 */

const API_BASE_URL = 'http://localhost:5260/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth/login.html';
    }
    return Promise.reject(error);
  }
);

// API Methods
const api = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  register: (email, password, fullName, phone, address) =>
    axiosInstance.post('/auth/register', {
      email, password, fullName, phone, address
    }),

  getUser: () => axiosInstance.get('/users/profile'),
  updateUser: (userData) => axiosInstance.put('/users/profile', userData),

  getParts: () => axiosInstance.get('/parts'),
  getPart: (id) => axiosInstance.get(`/parts/${id}`),

  getStaff: () => axiosInstance.get('/staff'),
  createStaff: (staffData) => axiosInstance.post('/staff', staffData),

  getVendors: () => axiosInstance.get('/vendors'),
  createVendor: (vendorData) => axiosInstance.post('/vendors', vendorData),

  getCustomers: () => axiosInstance.get('/customers'),
  getCustomer: (id) => axiosInstance.get(`/customers/${id}`),
  createCustomer: (customerData) => axiosInstance.post('/customers', customerData),
};

// Helper functions
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userFullName');
}

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function setUserRole(role) {
  localStorage.setItem('userRole', role);
}

function getUserRole() {
  return localStorage.getItem('userRole');
}

function setUserId(id) {
  localStorage.setItem('userId', id);
}

function getUserId() {
  return localStorage.getItem('userId');
}

function setUserEmail(email) {
  localStorage.setItem('userEmail', email);
}

function setUserFullName(fullName) {
  localStorage.setItem('userFullName', fullName);
}