// Authentication Guard - Protect pages requiring login

class AuthGuard {
  /**
   * Check if user is authenticated
   * @returns {boolean} true if authenticated, false otherwise
   */
  static isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Redirect to login if not authenticated
   * Call this at the top of pages that require login
   */
  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/auth/login.html';
      return false;
    }
    return true;
  }

  /**
   * Get current user role
   * @returns {string|null} user role (Admin, Staff, Customer) or null
   */
  static getUserRole() {
    return localStorage.getItem('userRole');
  }

  /**
   * Get authentication token
   * @returns {string|null} auth token or null
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Logout - clear auth data and redirect to login
   */
  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/auth/login.html';
  }

  /**
   * Store login credentials
   * @param {string} token - JWT token
   * @param {string} role - User role
   */
  static setAuth(token, role) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
  }

  /**
   * Check if token is expired (basic check)
   * @returns {boolean} true if expired or near expiration
   */
  static isTokenExpiring() {
    const token = localStorage.getItem('authToken');
    if (!token) return true;
    
    try {
      // Decode JWT (simple base64 decode - doesn't verify signature)
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Consider token as expiring if less than 5 minutes remain
      return (expirationTime - currentTime) < 5 * 60 * 1000;
    } catch (error) {
      return true;
    }
  }
}

// Initialize guard on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if current page requires authentication
  const publicPages = ['/auth/login.html', '/auth/register.html', '/index.html'];
  const currentPage = window.location.pathname;
  
  const isPublicPage = publicPages.some(page => currentPage.endsWith(page));
  
  if (!isPublicPage && !AuthGuard.isAuthenticated()) {
    AuthGuard.requireAuth();
  }
});
