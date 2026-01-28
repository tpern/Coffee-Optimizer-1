/**
 * =====================================================
 * SCA FEEDBACK MODEL
 * =====================================================
 * Stores SCA (Specialty Coffee Association) feedback submissions
 */

const mongoose = require('mongoose');

const scaFeedbackSchema = new mongoose.Schema({
  feedbackText: {
    type: String,
    required: [true, 'Feedback text is required'],
    trim: true,
    maxlength: [2000, 'Feedback text cannot exceed 2000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'overall', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Create indexes
scaFeedbackSchema.index({ category: 1 });
scaFeedbackSchema.index({ rating: -1 });
scaFeedbackSchema.index({ createdAt: -1 });

const SCAFeedback = mongoose.model('SCAFeedback', scaFeedbackSchema);

module.exports = SCAFeedback;
