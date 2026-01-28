/**
 * =====================================================
 * FORM SUBMISSION HANDLER
 * =====================================================
 * Handles all public form submissions to the API
 */

const API_BASE = '/api';

/**
 * Submit contact form
 */
async function submitContact(formData) {
  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit contact form');
    }
    
    return data;
  } catch (error) {
    console.error('Contact submission error:', error);
    throw error;
  }
}

/**
 * Submit review
 */
async function submitReview(formData) {
  try {
    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit review');
    }
    
    return data;
  } catch (error) {
    console.error('Review submission error:', error);
    throw error;
  }
}

/**
 * Submit SCA feedback
 */
async function submitSCAFeedback(formData) {
  try {
    const response = await fetch(`${API_BASE}/sca-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit SCA feedback');
    }
    
    return data;
  } catch (error) {
    console.error('SCA feedback submission error:', error);
    throw error;
  }
}

/**
 * Submit brew review (MOST IMPORTANT)
 */
async function submitBrewReview(formData) {
  try {
    const response = await fetch(`${API_BASE}/brew-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit brew review');
    }
    
    return data;
  } catch (error) {
    console.error('Brew review submission error:', error);
    throw error;
  }
}

// Make functions available globally
window.submitContact = submitContact;
window.submitReview = submitReview;
window.submitSCAFeedback = submitSCAFeedback;
window.submitBrewReview = submitBrewReview;
