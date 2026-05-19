/**
 * Authentication Handler - Manages login/register with role-based redirection
 */

class AuthHandler {
  static resolveCustomerId(responseData, user, token) {
    // Priority: user.customerId (integer) > user.id (for backward compat)
    let resolved = user?.customerId ?? user?.id ?? null;
    
    const final = resolved !== null && resolved !== undefined && String(resolved).trim() !== ''
      ? String(resolved).trim()
      : null;
    console.log('[AuthHandler] resolveCustomerId -> final:', final, '| from user.customerId:', user?.customerId, '| from user.id:', user?.id);
    return final;
  }

  static async login(email, password) {
    try {
      const response = await api.login(email, password);
      console.log('[AuthHandler] Full login response:', response.data);
      console.log('[AuthHandler] Response keys:', Object.keys(response.data));
      const { token, user } = response.data;
      console.log('[AuthHandler] User object keys:', user ? Object.keys(user) : 'no user');
      console.log('[AuthHandler] User object:', user);
      
      // Decode and log JWT payload
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length >= 2) {
            const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
            const json = decodeURIComponent(atob(padded).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            const payload = JSON.parse(json);
            console.log('[AuthHandler] JWT payload:', payload);
            console.log('[AuthHandler] JWT claim names:', Object.keys(payload));
          }
        } catch (e) {
          console.error('[AuthHandler] Failed to decode JWT:', e.message);
        }
      }

      // Store auth data
      setAuthToken(token);
      setUserRole(user.role);
      setUserId(user.id); // Auth user ID
      const resolvedCustomerId = this.resolveCustomerId(response.data, user, token);
      if (resolvedCustomerId) {
        setCustomerId(resolvedCustomerId);
        console.log('[AuthHandler] Stored customerId:', resolvedCustomerId);
      } else {
        console.warn('[AuthHandler] No customerId resolved, removing from storage');
        localStorage.removeItem('customerId');
      }
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
        const resolvedCustomerId = this.resolveCustomerId(response.data, user, token);
        if (resolvedCustomerId) {
          setCustomerId(resolvedCustomerId);
          console.log('[AuthHandler] Stored customerId on register:', resolvedCustomerId);
        } else {
          console.warn('[AuthHandler] No customerId resolved on register, removing from storage');
          localStorage.removeItem('customerId');
        }
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
      errorElement.classList.remove('d-none');
      errorElement.classList.add('show');
      errorElement.style.display = '';
    } else {
      console.error(message);
    }
  }

  static clearError(elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('d-none');
      errorElement.classList.remove('show');
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