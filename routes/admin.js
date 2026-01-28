/**
 * =====================================================
 * ADMIN API ROUTES
 * =====================================================
 * These routes require admin authentication (JWT token)
 */

const express = require('express');
const router = express.Router();

// Import controller
const adminController = require('../controllers/adminController');

// Import authentication middleware
const authenticateToken = require('../middleware/auth');

// Public admin route (login doesn't need authentication)
router.post('/login', adminController.login);

// All routes below require authentication
router.use(authenticateToken);

// Dashboard
router.get('/stats', adminController.getStats);

// Contact Messages
router.get('/contact-messages', adminController.getContactMessages);
router.put('/contact-messages/:id', adminController.updateContactMessage);
router.delete('/contact-messages/:id', adminController.deleteContactMessage);

// Reviews
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id', adminController.updateReview);
router.delete('/reviews/:id', adminController.deleteReview);

// SCA Feedback
router.get('/sca-feedback', adminController.getSCAFeedback);
router.delete('/sca-feedback/:id', adminController.deleteSCAFeedback);

// Brew Reviews (MOST IMPORTANT)
router.get('/brew-reviews', adminController.getBrewReviews);
router.get('/brew-reviews/:id', adminController.getBrewReview);
router.put('/brew-reviews/:id', adminController.updateBrewReview);
router.delete('/brew-reviews/:id', adminController.deleteBrewReview);

// Export
router.get('/export/:type', adminController.exportData);

module.exports = router;
