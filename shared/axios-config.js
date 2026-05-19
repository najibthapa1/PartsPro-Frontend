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
      // Don't auto-redirect for authentication endpoints themselves
      const reqUrl = error.config?.url || '';
      if (reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/register-staff')) {
        // Let the calling page handle the error (e.g., show message on login page)
        return Promise.reject(error);
      }

      // For other endpoints, clear auth and redirect to login
      localStorage.clear();
      window.location.href = '/auth/login.html';
    }
    return Promise.reject(error);
  }
);

// API Methods - Aligned with backend specification
const api = {
  // Auth
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  register: (email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear) =>
    axiosInstance.post('/auth/register', {
      email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear
    }),

  registerStaff: (email, password, fullName, department) =>
    axiosInstance.post('/auth/register-staff', { email, password, fullName, department }),

  registerCustomerByStaff: (email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear) =>
    axiosInstance.post('/auth/register-customer-by-staff', { email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear }),

  // Customers
  getCustomers: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/customer?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getCustomerProfile: (customerId) =>
    axiosInstance.get(`/customer/profile/${customerId}`),

  updateCustomerProfile: (customerId, data) =>
    axiosInstance.put(`/customer/profile/${customerId}`, data),

  searchCustomers: (query) =>
    axiosInstance.get(`/customer/search/${query}`),

  getCustomerHistory: (customerId) =>
    axiosInstance.get(`/customer/${customerId}/history`),

  getCustomerVehicles: (customerId) =>
    axiosInstance.get(`/customer/${customerId}/vehicles`),

  addCustomerVehicle: (customerId, data) =>
    axiosInstance.post(`/customer/${customerId}/vehicles`, data),

  // Parts
  getParts: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/part?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getPart: (id) =>
    axiosInstance.get(`/part/${id}`),

  createPart: (data) =>
    axiosInstance.post('/part/create', data),

  updatePart: (id, data) =>
    axiosInstance.put(`/part/update/${id}`, data),

  deletePart: (id) =>
    axiosInstance.delete(`/part/delete/${id}`),

  searchParts: (query) =>
    axiosInstance.get(`/part/search?q=${query}`),

  // Sales
  createSale: (data) =>
    axiosInstance.post('/sale/create', data),

  getSale: (id) =>
    axiosInstance.get(`/sale/${id}`),

  getCustomerSales: (customerId) =>
    axiosInstance.get(`/sale/customer/${customerId}`),

  getAllSales: () =>
    axiosInstance.get('/sale'),

  // Purchase Invoices
  createPurchaseInvoice: (data) =>
    axiosInstance.post('/purchaseinvoice/create', data),

  getPurchaseInvoices: () =>
    axiosInstance.get('/purchaseinvoice'),

  getPurchaseInvoice: (id) =>
    axiosInstance.get(`/purchaseinvoice/${id}`),

  getPurchaseInvoicesByVendor: (vendorId) =>
    axiosInstance.get(`/purchaseinvoice/vendor/${vendorId}`),

  // Vendors
  getVendors: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/vendor?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getVendor: (id) =>
    axiosInstance.get(`/vendor/${id}`),

  searchVendor: (name) =>
    axiosInstance.get(`/vendor/search/${name}`),

  createVendor: (data) =>
    axiosInstance.post('/vendor/create', data),

  updateVendor: (id, data) =>
    axiosInstance.put(`/vendor/update/${id}`, data),

  deleteVendor: (id) =>
    axiosInstance.delete(`/vendor/delete/${id}`),

  // Staff
  getStaff: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/staff?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getStaffMember: (id) =>
    axiosInstance.get(`/staff/${id}`),

  updateStaff: (id, data) =>
    axiosInstance.put(`/staff/update/${id}`, data),

  deleteStaff: (id) =>
    axiosInstance.delete(`/staff/delete/${id}`),

  // Reports
  getFinancialReport: (startDate, endDate) =>
    axiosInstance.get(`/report/financial?startDate=${startDate}&endDate=${endDate}`),

  getProfitLossReport: (startDate, endDate) =>
    axiosInstance.get(`/report/profit-loss?startDate=${startDate}&endDate=${endDate}`),

  getYearlyFinancialReport: (year) =>
    axiosInstance.get(`/report/financial/yearly?year=${year}`),

  getMonthlySalesReport: (year) =>
    axiosInstance.get(`/report/sales/monthly?year=${year}`),

  getMonthlyPurchaseReport: (year) =>
    axiosInstance.get(`/report/purchases/monthly?year=${year}`),

  getInventoryReport: () =>
    axiosInstance.get('/report/inventory'),
};

// Helper functions
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

function setUserId(id) {
  localStorage.setItem('userId', id);
}

function setCustomerId(id) {
  localStorage.setItem('customerId', id);
}

function setUserEmail(email) {
  localStorage.setItem('userEmail', email);
}

function setUserFullName(name) {
  localStorage.setItem('userFullName', name);
}

function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('customerId');
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

function setCustomerId(id) {
  if (id !== undefined && id !== null && id !== '') {
    localStorage.setItem('customerId', id);
  }
}

function getCustomerId() {
  return localStorage.getItem('customerId');
}

function setUserEmail(email) {
  localStorage.setItem('userEmail', email);
}

function setUserFullName(fullName) {
  localStorage.setItem('userFullName', fullName);
}