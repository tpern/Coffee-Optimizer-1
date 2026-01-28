/**
 * =====================================================
 * INPUT VALIDATION MIDDLEWARE
 * =====================================================
 * Validates and sanitizes user input to prevent attacks
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validation rules for contact form
 */
const validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
    .escape(),
  validate
];

/**
 * Validation rules for review submission
 */
const validateReview = [
  body('grinderName')
    .trim()
    .notEmpty().withMessage('Grinder name is required')
    .isLength({ max: 200 }).withMessage('Grinder name cannot exceed 200 characters')
    .escape(),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ max: 5000 }).withMessage('Review text cannot exceed 5000 characters')
    .escape(),
  body('reviewerName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reviewer name cannot exceed 100 characters')
    .escape(),
  validate
];

/**
 * Validation rules for SCA feedback
 */
const validateSCAFeedback = [
  body('feedbackText')
    .trim()
    .notEmpty().withMessage('Feedback text is required')
    .isLength({ max: 2000 }).withMessage('Feedback text cannot exceed 2000 characters')
    .escape(),
  body('rating')
    .isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('category')
    .optional()
    .isIn(['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'overall', 'other'])
    .withMessage('Invalid category'),
  validate
];

/**
 * Validation rules for brew review (most important)
 */
const validateBrewReview = [
  body('grinderUsed')
    .trim()
    .notEmpty().withMessage('Grinder used is required')
    .isLength({ max: 200 }).withMessage('Grinder name cannot exceed 200 characters')
    .escape(),
  body('brewMethod')
    .notEmpty().withMessage('Brew method is required')
    .isIn(['espresso', 'v60', 'chemex', 'french-press', 'aeropress', 'moka-pot', 'turkish', 'balance-siphon', 'syphon', 'cold-brew'])
    .withMessage('Invalid brew method'),
  body('waterTemperature')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Water temperature must be between 0 and 100°C'),
  body('brewTime')
    .optional()
    .isFloat({ min: 0 }).withMessage('Brew time cannot be negative'),
  body('doseGrams')
    .optional()
    .isFloat({ min: 0 }).withMessage('Dose cannot be negative'),
  body('yieldGrams')
    .optional()
    .isFloat({ min: 0 }).withMessage('Yield cannot be negative'),
  body('overallRating')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('tasteNotes')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Taste notes cannot exceed 5000 characters')
    .escape(),
  body('researcherNotes')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Researcher notes cannot exceed 5000 characters')
    .escape(),
  validate
];

module.exports = {
  validate,
  validateContact,
  validateReview,
  validateSCAFeedback,
  validateBrewReview
};
