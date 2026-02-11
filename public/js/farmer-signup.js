/**
 * Farmer Signup Form Handler
 * Page: /farmer-signup (direct URL only, not linked from main site)
 * Validates access code via backend API, submits registration on success.
 */

document.getElementById('farmerSignupForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = document.getElementById('farmerSubmitBtn');
  const feedback = document.getElementById('farmerFeedback');

  const payload = {
    name: document.getElementById('farmer-name').value.trim(),
    email: document.getElementById('farmer-email').value.trim(),
    farmLocation: document.getElementById('farmer-location').value.trim(),
    accessCode: document.getElementById('farmer-code').value.trim()
  };

  feedback.style.display = 'none';
  feedback.className = 'farmer-signup-feedback';
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await fetch('/api/farmer-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    feedback.style.display = 'block';
    if (res.ok && data.success) {
      feedback.className = 'farmer-signup-feedback success';
      feedback.textContent = data.message || 'Thank you! Your registration has been submitted successfully.';
      document.getElementById('farmerSignupForm').reset();
    } else {
      feedback.className = 'farmer-signup-feedback error';
      feedback.textContent = data.message || data.error || 'Something went wrong. Please try again.';
    }
  } catch (err) {
    console.error('Farmer signup error:', err);
    feedback.style.display = 'block';
    feedback.className = 'farmer-signup-feedback error';
    feedback.textContent = 'Network error. Please check your connection and try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Registration';
  }
});
