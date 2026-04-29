/**
 * Authentication Handler - Manages login/register with role-based redirection
 */

class AuthHandler {
  static async login(email, password) {
    try {
      const response = await api.login(email, password);
      const { token, user } = response.data;

      // Store auth data
      setAuthToken(token);
      setUserRole(user.role);
      setUserId(user.id);
      setUserEmail(user.email);
      setUserFullName(user.fullName);

      // Redirect based on role
      this.redirectToDashboard(user.role);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(email, password, fullName, phone, address) {
    try {
      const response = await api.register(email, password, fullName, phone, address);
      const { token, user } = response.data;

      if (token && user) {
        setAuthToken(token);
        setUserRole(user.role || 'Customer');
        setUserId(user.id);
        setUserEmail(user.email);
        setUserFullName(user.fullName);

        this.redirectToDashboard(user.role || 'Customer');
      } else {
        window.location.href = '/auth/login.html';
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static redirectToDashboard(role) {
    const dashboards = {
      Admin: '/admin/dashboard.html',
      Staff: '/staff/dashboard.html',
      Customer: '/customer/dashboard.html',
    };

    const dashboard = dashboards[role] || '/auth/login.html';
    window.location.href = dashboard;
  }

  static logout() {
    AuthGuard.logout();
  }

  static showError(message, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    } else {
      console.error(message);
    }
  }

  static clearError(elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: 'Password is valid' };
  }
}