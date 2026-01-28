/**
 * =====================================================
 * REVIEW MODEL
 * =====================================================
 * Stores grinder reviews and ratings from users
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  grinderName: {
    type: String,
    required: [true, 'Grinder name is required'],
    trim: true,
    maxlength: [200, 'Grinder name cannot exceed 200 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [5000, 'Review text cannot exceed 5000 characters']
  },
  reviewerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Reviewer name cannot exceed 100 characters'],
    default: 'Anonymous'
  },
  approved: {
    type: Boolean,
    default: false // Reviews need admin approval before showing publicly
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
reviewSchema.index({ grinderName: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ approved: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
