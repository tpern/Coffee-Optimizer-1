/**
 * =====================================================
 * PUBLIC API CONTROLLER
 * =====================================================
 * Handles all public-facing API endpoints
 * These don't require authentication
 */

const Contact = require('../models/Contact');
const Review = require('../models/Review');
const SCAFeedback = require('../models/SCAFeedback');
const BrewReview = require('../models/BrewReview');

/**
 * Submit contact form
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contact = new Contact({
      name,
      email,
      message
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: { id: contact._id }
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form',
      message: error.message
    });
  }
};

/**
 * Submit review
 */
exports.submitReview = async (req, res) => {
  try {
    const { grinderName, rating, reviewText, reviewerName } = req.body;

    const review = new Review({
      grinderName,
      rating,
      reviewText,
      reviewerName: reviewerName || 'Anonymous'
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will be reviewed before being published.',
      data: { id: review._id }
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review',
      message: error.message
    });
  }
};

/**
 * Submit SCA feedback
 */
exports.submitSCAFeedback = async (req, res) => {
  try {
    const { feedbackText, rating, category } = req.body;

    const feedback = new SCAFeedback({
      feedbackText,
      rating,
      category: category || 'other'
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: { id: feedback._id }
    });
  } catch (error) {
    console.error('SCA feedback submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      message: error.message
    });
  }
};

/**
 * Submit brew review (MOST IMPORTANT)
 */
exports.submitBrewReview = async (req, res) => {
  try {
    const {
      grinderUsed,
      coffeeOrigin,
      coffeeAltitude,
      coffeeVarietal,
      roastLevel,
      roastDate,
      processingMethod,
      grindSetting,
      brewMethod,
      waterTemperature,
      brewTime,
      doseGrams,
      yieldGrams,
      tasteNotes,
      overallRating,
      researcherNotes,
      userType,
      extractionState,
      extractionConfidence
    } = req.body;

    const brewReview = new BrewReview({
      grinderUsed,
      coffeeOrigin,
      coffeeAltitude,
      coffeeVarietal,
      roastLevel,
      roastDate: roastDate ? new Date(roastDate) : null,
      processingMethod,
      grindSetting,
      brewMethod,
      waterTemperature,
      brewTime,
      doseGrams,
      yieldGrams,
      tasteNotes,
      overallRating,
      researcherNotes,
      userType,
      extractionState: extractionState || 'unknown',
      extractionConfidence: extractionConfidence || 0
    });

    await brewReview.save();

    res.status(201).json({
      success: true,
      message: 'Brew review submitted successfully! Thank you for contributing to coffee research.',
      data: { id: brewReview._id }
    });
  } catch (error) {
    console.error('Brew review submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit brew review',
      message: error.message
    });
  }
};

/**
 * Validate farmer access code
 * Checks against environment variable FARMER_CODES (comma-separated) or fallback list
 */
exports.validateFarmerCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Code is required'
      });
    }

    const trimmedCode = code.trim().toUpperCase();
    const validCodes = (process.env.FARMER_CODES || 'URENA')
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);

    const valid = validCodes.includes(trimmedCode);

    res.json({
      success: true,
      valid,
      message: valid ? 'Farmer access activated' : 'Invalid farmer code'
    });
  } catch (error) {
    console.error('Farmer code validation error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Validation failed',
      message: error.message
    });
  }
};

/**
 * Get approved reviews (for public display)
 */
exports.getApprovedReviews = async (req, res) => {
  try {
    const { grinderName, limit = 50, page = 1 } = req.query;
    
    const query = { approved: true };
    if (grinderName) {
      query.grinderName = new RegExp(grinderName, 'i'); // Case-insensitive search
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v'); // Exclude version field

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
};
