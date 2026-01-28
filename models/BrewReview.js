/**
 * =====================================================
 * BREW REVIEW MODEL (MOST IMPORTANT)
 * =====================================================
 * Stores detailed brew review data from researchers
 * This is the primary data collection model
 */

const mongoose = require('mongoose');

const brewReviewSchema = new mongoose.Schema({
  // Grinder Information
  grinderUsed: {
    type: String,
    required: [true, 'Grinder used is required'],
    trim: true,
    maxlength: [200, 'Grinder name cannot exceed 200 characters']
  },
  
  // Coffee Bean Information
  coffeeOrigin: {
    type: String,
    trim: true,
    maxlength: [100, 'Origin cannot exceed 100 characters']
  },
  coffeeAltitude: {
    type: String,
    trim: true
  },
  coffeeVarietal: {
    type: String,
    trim: true
  },
  roastLevel: {
    type: String,
    enum: ['light', 'medium', 'medium-dark', 'dark', ''],
    default: ''
  },
  roastDate: {
    type: Date,
    default: null
  },
  processingMethod: {
    type: String,
    trim: true
  },
  
  // Brew Parameters
  grindSetting: {
    type: String, // Can be number or text like "medium-fine"
    trim: true
  },
  brewMethod: {
    type: String,
    required: [true, 'Brew method is required'],
    enum: [
      'espresso', 'v60', 'chemex', 'french-press', 'aeropress', 
      'moka-pot', 'turkish', 'balance-siphon', 'syphon', 'cold-brew'
    ]
  },
  waterTemperature: {
    type: Number,
    min: [0, 'Temperature cannot be negative'],
    max: [100, 'Temperature cannot exceed 100°C']
  },
  brewTime: {
    type: Number, // In seconds
    min: [0, 'Brew time cannot be negative']
  },
  doseGrams: {
    type: Number,
    min: [0, 'Dose cannot be negative']
  },
  yieldGrams: {
    type: Number,
    min: [0, 'Yield cannot be negative']
  },
  
  // Taste and Rating
  tasteNotes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Taste notes cannot exceed 5000 characters']
  },
  overallRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  
  // Additional Information
  researcherNotes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Researcher notes cannot exceed 5000 characters']
  },
  
  // User Information (optional, for tracking)
  userType: {
    type: String,
    enum: ['home', 'cafe', ''],
    default: ''
  },
  
  // Extraction Diagnosis (from SCA analysis)
  extractionState: {
    type: String,
    enum: ['under', 'over', 'balanced', 'unknown'],
    default: 'unknown'
  },
  extractionConfidence: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for faster queries and filtering
brewReviewSchema.index({ grinderUsed: 1 });
brewReviewSchema.index({ brewMethod: 1 });
brewReviewSchema.index({ createdAt: -1 });
brewReviewSchema.index({ overallRating: -1 });
brewReviewSchema.index({ coffeeOrigin: 1 });
// Compound index for common queries
brewReviewSchema.index({ grinderUsed: 1, brewMethod: 1 });

const BrewReview = mongoose.model('BrewReview', brewReviewSchema);

module.exports = BrewReview;
