/**
 * =====================================================
 * FARMER SIGNUP MODEL
 * =====================================================
 * Stores farmer registration submissions.
 * Access via /farmer-signup page (direct URL only).
 * Code validation handled by controller before save.
 */

const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  farmLocation: {
    type: String,
    required: [true, 'Farm location is required'],
    trim: true,
    maxlength: [200, 'Farm location cannot exceed 200 characters']
  },
  accessCodeVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

farmerSchema.index({ createdAt: -1 });
farmerSchema.index({ email: 1 });

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
