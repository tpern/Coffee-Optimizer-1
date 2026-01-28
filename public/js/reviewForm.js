/**
 * =====================================================
 * GRINDER REVIEW FORM HANDLER
 * =====================================================
 * Handles form submission for grinder review
 * Connects to POST /api/reviews endpoint
 */

// API endpoint
const API_BASE = window.location.origin;

// Coffee grinders array
const coffeeGrinders = [
  "Niche Zero",
  "Fellow Opus",
  "Baratza Sette 270",
  "DF64 Gen 2",
  "Timemore Sculptor 064s",
  "DF54",
  "Eureka Mignon Specialita",
  "Mahlkönig X64 SD",
  "Breville Smart Grinder Pro",
  "Baratza Encore ESP",
  "Baratza Virtuoso+",
  "Baratza Vario",
  "OXO Brew Conical Burr",
  "Wilfa Svart",
  "Sage/Breville Dose Control Pro",
  "Baratza Encore",
  "Cuisinart DBM-8 Supreme Grind",
  "KRUPS Precision Burr",
  "SHARDOR Conical Burr",
  "Capresso Infinity",
  "1Zpresso K-Ultra",
  "Comandante C40",
  "1Zpresso Q Air",
  "Timemore C2",
  "JavaPresse Manual Burr",
  "Hario Skerton Pro",
  "Porlex Mini",
  "Eureka Single Dose Pro",
  "Varia VS3",
  "Hamilton Beach Fresh Grind",
  "Aromaster Burr Grinder"
];

/**
 * Initialize review form
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('reviewForm');
  const grinderSelect = document.getElementById('grinderName');
  const starRating = document.getElementById('starRating');
  const ratingInput = document.getElementById('rating');
  const ratingText = document.getElementById('ratingText');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formMessage = document.getElementById('formMessage');

  if (!form) {
    console.error('Review form not found');
    return;
  }

  // Populate grinder dropdown
  coffeeGrinders.forEach(grinder => {
    const option = document.createElement('option');
    option.value = grinder;
    option.textContent = grinder;
    grinderSelect.appendChild(option);
  });

  // Add "Other" option
  const otherOption = document.createElement('option');
  otherOption.value = 'other';
  otherOption.textContent = 'Other (specify below)';
  grinderSelect.appendChild(otherOption);

  // Add text input for "Other" option
  let otherInput = null;
  grinderSelect.addEventListener('change', function() {
    if (this.value === 'other') {
      if (!otherInput) {
        otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.id = 'grinderOther';
        otherInput.name = 'grinderOther';
        otherInput.placeholder = 'Enter grinder name';
        otherInput.style.marginTop = '0.5rem';
        otherInput.style.width = '100%';
        otherInput.style.padding = '0.875rem 1rem';
        otherInput.style.border = '2px solid #e5e7eb';
        otherInput.style.borderRadius = '8px';
        grinderSelect.parentElement.appendChild(otherInput);
      }
      otherInput.style.display = 'block';
      otherInput.required = true;
    } else {
      if (otherInput) {
        otherInput.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
      }
    }
  });

  // Star rating functionality
  const stars = starRating.querySelectorAll('.star');
  const ratings = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  stars.forEach((star, index) => {
    star.addEventListener('click', function() {
      const rating = index + 1;
      ratingInput.value = rating;

      // Update star display
      stars.forEach((s, i) => {
        if (i < rating) {
          s.textContent = '★';
          s.classList.add('active');
        } else {
          s.textContent = '☆';
          s.classList.remove('active');
        }
      });

      // Update rating text
      ratingText.textContent = ratings[rating];
    });

    // Hover effect
    star.addEventListener('mouseenter', function() {
      const hoverRating = index + 1;
      stars.forEach((s, i) => {
        if (i < hoverRating) {
          s.textContent = '★';
        } else {
          s.textContent = '☆';
        }
      });
    });
  });

  // Reset stars on mouse leave
  starRating.addEventListener('mouseleave', function() {
    const currentRating = parseInt(ratingInput.value) || 0;
    stars.forEach((s, i) => {
      if (i < currentRating) {
        s.textContent = '★';
      } else {
        s.textContent = '☆';
      }
    });
  });

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form data
    let grinderName = grinderSelect.value;
    if (grinderName === 'other' && otherInput) {
      grinderName = otherInput.value.trim();
    }

    const formData = {
      grinderName: grinderName,
      rating: parseInt(ratingInput.value),
      reviewText: document.getElementById('reviewText').value.trim(),
      reviewerName: document.getElementById('reviewerName').value.trim() || undefined
    };

    // Validate form
    if (!formData.grinderName || !formData.rating || !formData.reviewText) {
      showError('Please fill in all required fields and select a rating.');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      showError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (formData.reviewText.length > 5000) {
      showError('Review text cannot exceed 5000 characters.');
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      // Submit to API
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        showSuccess(result.message || 'Thank you! Your review has been received and will be reviewed before being published.');
        form.reset();
        ratingInput.value = '';
        ratingText.textContent = '';
        stars.forEach(s => {
          s.textContent = '☆';
          s.classList.remove('active');
        });
        if (otherInput) {
          otherInput.style.display = 'none';
        }
      } else {
        // Error from server
        throw new Error(result.error || result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review form submission error:', error);
      showError(error.message || 'Failed to submit review. Please try again later.');
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
      submitText.textContent = 'Submit Review';
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
