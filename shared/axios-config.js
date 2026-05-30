const API_BASE_URL = 'http://localhost:5260/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      if (reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/register-staff')) {
        return Promise.reject(error);
      }
      localStorage.clear();
      window.location.href = '/auth/login.html';
    }
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  login: (email, password) => axiosInstance.post('/auth/login', { email, password }),
  register: (email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear) =>
    axiosInstance.post('/auth/register', { email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear }),
  registerStaff: (email, password, fullName,phone,address,department) =>
    axiosInstance.post('/auth/register-staff', { email, password, fullName, phone, address, department }),
  registerCustomerByStaff: (email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear) =>
    axiosInstance.post('/auth/register-customer-by-staff', { email, password, fullName, phone, address, plateNumber, vehicleModel, vehicleYear }),

  // Customers
  getCustomers: (pageNumber = 1, pageSize = 10) => axiosInstance.get(`/customer?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  getCustomerProfile: (customerId) => axiosInstance.get(`/customer/profile/${customerId}`),
  updateCustomerProfile: (customerId, data) => axiosInstance.put(`/customer/profile/${customerId}`, data),
  searchCustomers: (query) => axiosInstance.get(`/customer/search/${encodeURIComponent(query)}`),
  getCustomerHistory: (customerId) => axiosInstance.get(`/customer/${customerId}/history`),
  getCustomerVehicles: (customerId) => axiosInstance.get(`/customer/${customerId}/vehicles`),
  addCustomerVehicle: (customerId, data) => axiosInstance.post(`/customer/${customerId}/vehicles`, data),

  // Customer feature pages: appointments, part requests and reviews
  getCustomerAppointments: (customerId) => axiosInstance.get(`/customer/${customerId}/appointments`),
  createCustomerAppointment: (customerId, data) => axiosInstance.post(`/customer/${customerId}/appointments`, data),
  updateAppointmentStatus: (appointmentId, status) => axiosInstance.put(`/customer/appointments/${appointmentId}/status`, { status }),
  deleteAppointment: (appointmentId) => axiosInstance.delete(`/customer/appointments/${appointmentId}`),

  getCustomerPartRequests: (customerId) => axiosInstance.get(`/customer/${customerId}/part-requests`),
  createCustomerPartRequest: (customerId, data) => axiosInstance.post(`/customer/${customerId}/part-requests`, data),
  updatePartRequestStatus: (requestId, isResolved) => axiosInstance.put(`/customer/part-requests/${requestId}/status`, { isResolved }),
  deletePartRequest: (requestId) => axiosInstance.delete(`/customer/part-requests/${requestId}`),

  getCustomerReviews: (customerId) => axiosInstance.get(`/customer/${customerId}/reviews`),
  createCustomerReview: (customerId, data) => axiosInstance.post(`/customer/${customerId}/reviews`, data),
  deleteReview: (reviewId) => axiosInstance.delete(`/customer/reviews/${reviewId}`),

  // Parts
  getParts: (pageNumber = 1, pageSize = 10) => axiosInstance.get(`/part?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  getPart: (id) => axiosInstance.get(`/part/${id}`),
  createPart: (data) => axiosInstance.post('/part/create', data),
  updatePart: (id, data) => axiosInstance.put(`/part/update/${id}`, data),
  deletePart: (id) => axiosInstance.delete(`/part/delete/${id}`),
  searchParts: (query) => axiosInstance.get(`/part/search?q=${encodeURIComponent(query)}`),

  // Sales
  createSale: (data) => axiosInstance.post('/sale/create', data),
  getSale: (id) => axiosInstance.get(`/sale/${id}`),
  getCustomerSales: (customerId) => axiosInstance.get(`/sale/customer/${customerId}`),
  getAllSales: () => axiosInstance.get('/sale'),
  sendSaleInvoiceEmail: (saleId) => axiosInstance.post(`/sale/${saleId}/email`),

  // Purchase Invoices
  createPurchaseInvoice: (data) => axiosInstance.post('/purchaseinvoice/create', data),
  getPurchaseInvoices: () => axiosInstance.get('/purchaseinvoice'),
  getPurchaseInvoice: (id) => axiosInstance.get(`/purchaseinvoice/${id}`),
  getPurchaseInvoicesByVendor: (vendorId) => axiosInstance.get(`/purchaseinvoice/vendor/${vendorId}`),

  // Vendors
  getVendors: (pageNumber = 1, pageSize = 10) => axiosInstance.get(`/vendor?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  getVendor: (id) => axiosInstance.get(`/vendor/${id}`),
  searchVendor: (name) => axiosInstance.get(`/vendor/search/${encodeURIComponent(name)}`),
  createVendor: (data) => axiosInstance.post('/vendor/create', data),
  updateVendor: (id, data) => axiosInstance.put(`/vendor/update/${id}`, data),
  deleteVendor: (id) => axiosInstance.delete(`/vendor/delete/${id}`),

  // Staff
  getStaff: (pageNumber = 1, pageSize = 10) => axiosInstance.get(`/staff?pageNumber=${pageNumber}&pageSize=${pageSize}`),
  getStaffMember: (id) => axiosInstance.get(`/staff/${id}`),
  updateStaff: (id, data) => axiosInstance.put(`/staff/update/${id}`, data),
  deleteStaff: (id) => axiosInstance.delete(`/staff/delete/${id}`),

  // Reports / business insights
  getFinancialReport: (startDate, endDate) => axiosInstance.get(`/report/financial?startDate=${startDate}&endDate=${endDate}`),
  getProfitLossReport: (startDate, endDate) => axiosInstance.get(`/report/profit-loss?startDate=${startDate}&endDate=${endDate}`),
  getYearlyFinancialReport: (year) => axiosInstance.get(`/report/financial/yearly?year=${year}`),
  getMonthlySalesReport: (year) => axiosInstance.get(`/report/sales/monthly?year=${year}`),
  getMonthlyPurchaseReport: (year) => axiosInstance.get(`/report/purchases/monthly?year=${year}`),
  getTopSellingProducts: (limit = 10) => axiosInstance.get(`/report/products/top-selling?limit=${limit}`),
  getInventorySummary: () => axiosInstance.get('/report/inventory/summary'),
  getCustomerInsights: () => axiosInstance.get('/report/customer-insights')
};

function setAuthToken(token) { localStorage.setItem('authToken', token); }
function getAuthToken() { return localStorage.getItem('authToken'); }
function setUserRole(role) { localStorage.setItem('userRole', role); }
function getUserRole() { return localStorage.getItem('userRole'); }
function setUserId(id) { localStorage.setItem('userId', id); }
function getUserId() { return localStorage.getItem('userId'); }
function setCustomerId(id) { if (id !== undefined && id !== null && id !== '') localStorage.setItem('customerId', id); }
function getCustomerId() { return localStorage.getItem('customerId'); }
function setUserEmail(email) { localStorage.setItem('userEmail', email); }
function setUserFullName(name) { localStorage.setItem('userFullName', name); }
function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('customerId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userFullName');
}
