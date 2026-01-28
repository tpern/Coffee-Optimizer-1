/**
 * =====================================================
 * BREW REVIEW FORM HANDLER
 * =====================================================
 * Handles form submission for brew review
 * Connects to POST /api/brew-reviews endpoint
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
 * Initialize brew review form
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('brewReviewForm');
  const grinderSelect = document.getElementById('grinderUsed');
  const ratingSlider = document.getElementById('overallRating');
  const ratingValue = document.getElementById('ratingValue');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formMessage = document.getElementById('formMessage');

  if (!form) {
    console.error('Brew review form not found');
    return;
  }

  // Populate grinder dropdown
  coffeeGrinders.forEach(grinder => {
    const option = document.createElement('option');
    option.value = grinder;
    option.textContent = grinder;
    grinderSelect.appendChild(option);
  });

  // Update rating display when slider changes
  ratingSlider.addEventListener('input', function() {
    ratingValue.textContent = parseFloat(this.value).toFixed(1);
  });

  // Form submission handler
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form data
    const formData = {
      grinderUsed: grinderSelect.value.trim(),
      coffeeOrigin: document.getElementById('coffeeOrigin').value.trim() || undefined,
      roastLevel: document.getElementById('roastLevel').value || undefined,
      grindSetting: document.getElementById('grindSetting').value.trim() || undefined,
      brewMethod: document.getElementById('brewMethod').value,
      waterTemperature: document.getElementById('waterTemperature').value ? 
        parseFloat(document.getElementById('waterTemperature').value) : undefined,
      brewTime: document.getElementById('brewTime').value || undefined,
      tasteNotes: document.getElementById('tasteNotes').value.trim() || undefined,
      overallRating: parseFloat(ratingSlider.value),
      researcherNotes: document.getElementById('researcherNotes').value.trim() || undefined
    };

    // Validate required fields
    if (!formData.grinderUsed || !formData.brewMethod || !formData.overallRating) {
      showError('Please fill in all required fields (Grinder, Brew Method, and Rating).');
      return;
    }

    // Validate rating range
    if (formData.overallRating < 1 || formData.overallRating > 10) {
      showError('Rating must be between 1 and 10.');
      return;
    }

    // Validate temperature if provided (backend expects Celsius, max 100)
    if (formData.waterTemperature !== undefined) {
      if (formData.waterTemperature < 0 || formData.waterTemperature > 100) {
        showError('Water temperature must be between 0 and 100°C.');
        return;
      }
    }

    // Convert brew time from time input to seconds if provided
    if (formData.brewTime) {
      const [minutes, seconds] = formData.brewTime.split(':').map(Number);
      formData.brewTime = minutes * 60 + seconds;
    }

    // Brew method is already in correct format from dropdown
    // No mapping needed - backend accepts: v60, chemex, french-press, espresso, aeropress, moka-pot, turkish, balance-siphon, syphon, cold-brew

    // Show loading state
    setLoadingState(true);

    try {
      // Submit to API
      const response = await fetch(`${API_BASE}/api/brew-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        showSuccess(result.message || 'Thank you! Your brew review has been received.');
        form.reset();
        ratingSlider.value = 5;
        ratingValue.textContent = '5.0';
      } else {
        // Error from server
        throw new Error(result.error || result.message || 'Failed to submit brew review');
      }
    } catch (error) {
      console.error('Brew review form submission error:', error);
      showError(error.message || 'Failed to submit brew review. Please try again later.');
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
      submitText.textContent = 'Submit Brew Review';
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
