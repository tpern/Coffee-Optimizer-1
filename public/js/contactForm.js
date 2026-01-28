/**
 * =====================================================
 * CONTACT FORM HANDLER
 * =====================================================
 * Handles form submission for contact form
 * Connects to POST /api/contact endpoint
 */

// API endpoint
const API_BASE = window.location.origin; // Use current origin (works for localhost and production)

/**
 * Initialize contact form
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formMessage = document.getElementById('formMessage');

  if (!form) {
    console.error('Contact form not found');
    return;
  }

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    // Validate message length
    if (formData.message.length > 2000) {
      showError('Message cannot exceed 2000 characters.');
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      // Submit to API
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        showSuccess(result.message || 'Thank you! Your message has been received.');
        form.reset();
      } else {
        // Error from server
        throw new Error(result.error || result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      showError(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoadingState(false);
    }
  });

  /**
   * Set loading state
   */
  function setLoadingState(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitText.textContent = 'Sending...';
      submitSpinner.style.display = 'inline-block';
    } else {
      submitText.textContent = 'Send Message';
      submitSpinner.style.display = 'none';
    }
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    formMessage.className = 'form-message success';
    formMessage.textContent = message;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Show error message
   */
  function showError(message) {
    formMessage.className = 'form-message error';
    formMessage.textContent = message;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
