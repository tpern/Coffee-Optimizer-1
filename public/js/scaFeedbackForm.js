/**
 * =====================================================
 * SCA FEEDBACK FORM HANDLER
 * =====================================================
 * Handles form submission for SCA feedback
 * Connects to POST /api/sca-feedback endpoint
 */

// API endpoint
const API_BASE = window.location.origin;

/**
 * Initialize SCA feedback form
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('scaForm');
  const ratingSlider = document.getElementById('rating');
  const ratingValue = document.getElementById('ratingValue');
  const ratingText = document.getElementById('ratingText');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formMessage = document.getElementById('formMessage');

  if (!form) {
    console.error('SCA feedback form not found');
    return;
  }

  // Update rating display when slider changes
  ratingSlider.addEventListener('input', function() {
    const value = parseInt(this.value);
    ratingValue.textContent = value;
    
    // Update rating text
    const ratingLabels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Fair',
      4: 'Good',
      5: 'Good',
      6: 'Very Good',
      7: 'Very Good',
      8: 'Excellent',
      9: 'Excellent',
      10: 'Outstanding'
    };
    ratingText.textContent = ratingLabels[value] || '';
  });

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form data
    const formData = {
      feedbackText: document.getElementById('feedbackText').value.trim(),
      rating: parseInt(ratingSlider.value),
      category: document.getElementById('category').value // Already in correct format
    };

    // Validate form
    if (!formData.feedbackText || !formData.rating) {
      showError('Please fill in all required fields and select a rating.');
      return;
    }

    if (formData.rating < 1 || formData.rating > 10) {
      showError('Please select a rating between 1 and 10.');
      return;
    }

    if (formData.feedbackText.length > 2000) {
      showError('Feedback text cannot exceed 2000 characters.');
      return;
    }

    // Category is already in correct format from dropdown
    // Backend expects: aroma, flavor, aftertaste, acidity, body, balance, sweetness, overall, other

    // Show loading state
    setLoadingState(true);

    try {
      // Submit to API
      const response = await fetch(`${API_BASE}/api/sca-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        showSuccess(result.message || 'Thank you! Your feedback has been received.');
        form.reset();
        ratingSlider.value = 5;
        ratingValue.textContent = '5';
        ratingText.textContent = '';
      } else {
        // Error from server
        throw new Error(result.error || result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('SCA feedback form submission error:', error);
      showError(error.message || 'Failed to submit feedback. Please try again later.');
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
      submitText.textContent = 'Submitting...';
      submitSpinner.style.display = 'inline-block';
    } else {
      submitText.textContent = 'Submit Feedback';
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
