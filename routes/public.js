/**
 * =====================================================
 * PUBLIC API ROUTES
 * =====================================================
 * These routes are accessible to everyone (no authentication required)
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import controller
const publicController = require('../controllers/publicController');

// Import validation middleware
const {
  validateContact,
  validateReview,
  validateSCAFeedback,
  validateBrewReview
} = require('../middleware/validation');

// Rate limiting to prevent abuse
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many submissions from this IP, please try again later.'
});

// Apply rate limiting to all submission endpoints
router.use('/contact', submitLimiter);
router.use('/reviews', submitLimiter);
router.use('/sca-feedback', submitLimiter);
router.use('/brew-reviews', submitLimiter);

// Public routes
router.post('/contact', validateContact, publicController.submitContact);
router.post('/reviews', validateReview, publicController.submitReview);
router.post('/sca-feedback', validateSCAFeedback, publicController.submitSCAFeedback);
router.post('/brew-reviews', validateBrewReview, publicController.submitBrewReview);

// Get approved reviews (for public display)
router.get('/reviews', publicController.getApprovedReviews);

module.exports = router;
