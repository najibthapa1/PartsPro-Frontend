// Role Guard - Restrict pages by user role (Admin, Staff, Customer)

class RoleGuard {
  // Define allowed routes per role
  static ROLE_ROUTES = {
    Admin: [
      '/admin/dashboard.html',
      '/admin/parts.html',
      '/admin/vendors.html',
      '/admin/staff.html',
      '/admin/purchases.html',
      '/admin/reports.html',
    ],
    Staff: [
      '/staff/dashboard.html',
      '/staff/sales.html',
      '/staff/customers.html',
      '/staff/search.html',
      '/staff/alerts.html',
    ],
    Customer: [
      '/customer/dashboard.html',
      '/customer/profile.html',
      '/customer/appointments.html',
      '/customer/history.html',
      '/customer/reviews.html',
    ],
  };

  /**
   * Check if user has required role
   * @param {string} requiredRole - Required role (Admin, Staff, Customer)
   * @returns {boolean} true if user has required role
   */
  static hasRole(requiredRole) {
    const userRole = localStorage.getItem('userRole');
    return userRole === requiredRole;
  }

  /**
   * Check if user has one of multiple roles
   * @param {array} allowedRoles - Array of allowed roles
   * @returns {boolean} true if user has one of the allowed roles
   */
  static hasAnyRole(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    return allowedRoles.includes(userRole);
  }

  /**
   * Redirect to appropriate dashboard based on role
   */
  static redirectToDashboard() {
    const userRole = localStorage.getItem('userRole');
    
    const dashboards = {
      Admin: '/admin/dashboard.html',
      Staff: '/staff/dashboard.html',
      Customer: '/customer/dashboard.html',
    };
    
    const dashboardUrl = dashboards[userRole] || '/auth/login.html';
    window.location.href = dashboardUrl;
  }

  /**
   * Restrict access to role-specific pages
   * Call this at the top of pages that require specific role
   * @param {string} requiredRole - Required role
   * @returns {boolean} true if access granted
   */
  static requireRole(requiredRole) {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      // Not logged in, redirect to login
      window.location.href = '/auth/login.html';
      return false;
    }
    
    if (userRole !== requiredRole) {
      // Wrong role, redirect to their dashboard
      this.redirectToDashboard();
      return false;
    }
    
    return true;
  }

  /**
   * Restrict access to any of multiple roles
   * @param {array} allowedRoles - Array of allowed roles
   * @returns {boolean} true if access granted
   */
  static requireAnyRole(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      // Not logged in, redirect to login
      window.location.href = '/auth/login.html';
      return false;
    }
    
    if (!allowedRoles.includes(userRole)) {
      // Role not in allowed list, redirect to their dashboard
      this.redirectToDashboard();
      return false;
    }
    
    return true;
  }

  /**
   * Check if user can perform action (future extensibility)
   * @param {string} action - Action name (e.g., 'delete_part', 'view_reports')
   * @returns {boolean} true if user can perform action
   */
  static canPerformAction(action) {
    const userRole = localStorage.getItem('userRole');
    
    // Define permissions per role
    const permissions = {
      Admin: ['delete_part', 'edit_part', 'create_part', 'view_reports', 'manage_staff', 'manage_vendors'],
      Staff: ['create_sale', 'search_customer', 'view_inventory', 'view_alerts'],
      Customer: ['view_history', 'book_appointment', 'write_review'],
    };
    
    const rolePermissions = permissions[userRole] || [];
    return rolePermissions.includes(action);
  }

  /**
   * Get current user role
   * @returns {string|null} user role or null
   */
  static getCurrentRole() {
    return localStorage.getItem('userRole');
  }

  /**
   * Get accessible pages for current user
   * @returns {array} array of accessible page URLs
   */
  static getAccessiblePages() {
    const userRole = this.getCurrentRole();
    return this.ROLE_ROUTES[userRole] || [];
  }
}

// Initialize role guard on page load
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  
  // Check if current page has role restrictions
  let isAccessible = false;
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    // Not logged in - allow only public pages
    const publicPages = ['/auth/login.html', '/auth/register.html', '/index.html'];
    isAccessible = publicPages.some(page => currentPage.endsWith(page));
  } else {
    // Check if page is in user's allowed routes
    const allowedPages = RoleGuard.getAccessiblePages();
    isAccessible = allowedPages.some(page => currentPage.endsWith(page)) || 
                   currentPage.endsWith('/index.html') ||
                   currentPage.endsWith('/auth/login.html');
  }
  
  if (!isAccessible && !currentPage.endsWith('/index.html')) {
    // Redirect to appropriate dashboard
    RoleGuard.redirectToDashboard();
  }
});
