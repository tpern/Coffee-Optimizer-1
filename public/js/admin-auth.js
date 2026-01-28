/**
 * =====================================================
 * ADMIN AUTHENTICATION
 * =====================================================
 * Handles admin login and token management
 */

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('adminToken');
  if (token && window.location.pathname.includes('/admin/login')) {
    // Already logged in, redirect to dashboard
    window.location.href = '/admin/dashboard';
  }
});

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginBtnSpinner = document.getElementById('loginBtnSpinner');
  const errorMessage = document.getElementById('errorMessage');
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtnText.style.display = 'none';
  loginBtnSpinner.style.display = 'inline-block';
  errorMessage.style.display = 'none';
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store token
      if (rememberMe) {
        localStorage.setItem('adminToken', data.token);
      } else {
        sessionStorage.setItem('adminToken', data.token);
      }
      
      // Redirect to dashboard
      window.location.href = '/admin/dashboard';
    } else {
      // Show error
      errorMessage.textContent = data.error || 'Login failed. Please check your credentials.';
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.textContent = 'Network error. Please try again.';
    errorMessage.style.display = 'block';
  } finally {
    // Reset button state
    loginBtn.disabled = false;
    loginBtnText.style.display = 'inline';
    loginBtnSpinner.style.display = 'none';
  }
});

/**
 * Get admin token from storage
 */
function getAdminToken() {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getAdminToken();
}

/**
 * Logout function
 */
function logout() {
  localStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
}

// Make functions available globally
window.getAdminToken = getAdminToken;
window.isAuthenticated = isAuthenticated;
window.logout = logout;
