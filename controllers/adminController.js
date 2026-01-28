/**
 * =====================================================
 * ADMIN API CONTROLLER
 * =====================================================
 * Handles all admin panel API endpoints
 * All routes using this controller require authentication
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const SCAFeedback = require('../models/SCAFeedback');
const BrewReview = require('../models/BrewReview');

/**
 * Admin login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find admin user
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
};

/**
 * Get dashboard statistics
 */
exports.getStats = async (req, res) => {
  try {
    // Calculate date for "this week"
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get total counts
    const [
      totalContacts,
      totalReviews,
      totalSCAFeedback,
      totalBrewReviews,
      newContacts,
      newReviews,
      newSCAFeedback,
      newBrewReviews,
      avgReviewRating,
      avgBrewRating
    ] = await Promise.all([
      Contact.countDocuments(),
      Review.countDocuments(),
      SCAFeedback.countDocuments(),
      BrewReview.countDocuments(),
      Contact.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Review.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      SCAFeedback.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      BrewReview.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      BrewReview.aggregate([{ $group: { _id: null, avg: { $avg: '$overallRating' } } }])
    ]);

    // Get most popular grinders
    const popularGrinders = await BrewReview.aggregate([
      { $group: { _id: '$grinderUsed', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get submissions over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const submissionsOverTime = await BrewReview.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          contacts: totalContacts,
          reviews: totalReviews,
          scaFeedback: totalSCAFeedback,
          brewReviews: totalBrewReviews
        },
        newThisWeek: {
          contacts: newContacts,
          reviews: newReviews,
          scaFeedback: newSCAFeedback,
          brewReviews: newBrewReviews
        },
        averages: {
          reviewRating: avgReviewRating[0]?.avg || 0,
          brewRating: avgBrewRating[0]?.avg || 0
        },
        popularGrinders: popularGrinders,
        submissionsOverTime: submissionsOverTime,
        ratingDistribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
};

/**
 * Get all contact messages
 */
exports.getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', read = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }
    if (read === 'true' || read === 'false') {
      query.read = read === 'true';
    }

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact messages',
      message: error.message
    });
  }
};

/**
 * Update contact message (mark as read/unread)
 */
exports.updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    message.read = read;
    if (read) {
      message.readAt = new Date();
    } else {
      message.readAt = null;
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message',
      message: error.message
    });
  }
};

/**
 * Delete contact message
 */
exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
      message: error.message
    });
  }
};

/**
 * Get all reviews
 */
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', grinderName = '', rating = '', approved = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { grinderName: new RegExp(search, 'i') },
        { reviewText: new RegExp(search, 'i') },
        { reviewerName: new RegExp(search, 'i') }
      ];
    }
    if (grinderName) {
      query.grinderName = new RegExp(grinderName, 'i');
    }
    if (rating) {
      query.rating = parseInt(rating);
    }
    if (approved === 'true' || approved === 'false') {
      query.approved = approved === 'true';
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

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

/**
 * Update review
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If approving, set approvedAt
    if (updateData.approved && !updateData.approvedAt) {
      updateData.approvedAt = new Date();
    }

    const review = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review',
      message: error.message
    });
  }
};

/**
 * Delete review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review',
      message: error.message
    });
  }
};

/**
 * Get all SCA feedback
 */
exports.getSCAFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', category = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.feedbackText = new RegExp(search, 'i');
    }
    if (category) {
      query.category = category;
    }

    const feedback = await SCAFeedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await SCAFeedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get SCA feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SCA feedback',
      message: error.message
    });
  }
};

/**
 * Delete SCA feedback
 */
exports.deleteSCAFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await SCAFeedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete SCA feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback',
      message: error.message
    });
  }
};

/**
 * Get all brew reviews (MOST IMPORTANT)
 */
exports.getBrewReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      grinderUsed = '', 
      brewMethod = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    
    if (search) {
      query.$or = [
        { grinderUsed: new RegExp(search, 'i') },
        { coffeeOrigin: new RegExp(search, 'i') },
        { tasteNotes: new RegExp(search, 'i') },
        { researcherNotes: new RegExp(search, 'i') }
      ];
    }
    if (grinderUsed) {
      query.grinderUsed = new RegExp(grinderUsed, 'i');
    }
    if (brewMethod) {
      query.brewMethod = brewMethod;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    const brewReviews = await BrewReview.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await BrewReview.countDocuments(query);

    res.json({
      success: true,
      data: brewReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get brew reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brew reviews',
      message: error.message
    });
  }
};

/**
 * Get single brew review by ID
 */
exports.getBrewReview = async (req, res) => {
  try {
    const { id } = req.params;

    const brewReview = await BrewReview.findById(id).select('-__v');

    if (!brewReview) {
      return res.status(404).json({
        success: false,
        error: 'Brew review not found'
      });
    }

    res.json({
      success: true,
      data: brewReview
    });
  } catch (error) {
    console.error('Get brew review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brew review',
      message: error.message
    });
  }
};

/**
 * Update brew review
 */
exports.updateBrewReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert roastDate string to Date if provided
    if (updateData.roastDate) {
      updateData.roastDate = new Date(updateData.roastDate);
    }

    const brewReview = await BrewReview.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brewReview) {
      return res.status(404).json({
        success: false,
        error: 'Brew review not found'
      });
    }

    res.json({
      success: true,
      message: 'Brew review updated successfully',
      data: brewReview
    });
  } catch (error) {
    console.error('Update brew review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update brew review',
      message: error.message
    });
  }
};

/**
 * Delete brew review
 */
exports.deleteBrewReview = async (req, res) => {
  try {
    const { id } = req.params;

    const brewReview = await BrewReview.findByIdAndDelete(id);
    if (!brewReview) {
      return res.status(404).json({
        success: false,
        error: 'Brew review not found'
      });
    }

    res.json({
      success: true,
      message: 'Brew review deleted successfully'
    });
  } catch (error) {
    console.error('Delete brew review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete brew review',
      message: error.message
    });
  }
};

/**
 * Export data as CSV
 */
exports.exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const { filters = {} } = req.query;

    let data = [];
    let headers = [];
    let filename = '';

    switch (type) {
      case 'contacts':
        data = await Contact.find(filters).select('-__v');
        headers = ['Name', 'Email', 'Message', 'Read', 'Created At'];
        filename = 'contacts';
        break;
      
      case 'reviews':
        data = await Review.find(filters).select('-__v');
        headers = ['Grinder Name', 'Rating', 'Review Text', 'Reviewer Name', 'Approved', 'Created At'];
        filename = 'reviews';
        break;
      
      case 'sca-feedback':
        data = await SCAFeedback.find(filters).select('-__v');
        headers = ['Feedback Text', 'Rating', 'Category', 'Created At'];
        filename = 'sca-feedback';
        break;
      
      case 'brew-reviews':
        data = await BrewReview.find(filters).select('-__v');
        headers = [
          'Grinder Used', 'Brew Method', 'Coffee Origin', 'Roast Level',
          'Water Temperature', 'Brew Time', 'Dose (g)', 'Yield (g)',
          'Overall Rating', 'Taste Notes', 'Created At'
        ];
        filename = 'brew-reviews';
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type'
        });
    }

    // Convert to CSV format
    let csv = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = [];
      switch (type) {
        case 'contacts':
          row.push(
            `"${item.name || ''}"`,
            `"${item.email || ''}"`,
            `"${(item.message || '').replace(/"/g, '""')}"`,
            item.read ? 'Yes' : 'No',
            item.createdAt.toISOString()
          );
          break;
        case 'reviews':
          row.push(
            `"${item.grinderName || ''}"`,
            item.rating || '',
            `"${(item.reviewText || '').replace(/"/g, '""')}"`,
            `"${item.reviewerName || ''}"`,
            item.approved ? 'Yes' : 'No',
            item.createdAt.toISOString()
          );
          break;
        case 'sca-feedback':
          row.push(
            `"${(item.feedbackText || '').replace(/"/g, '""')}"`,
            item.rating || '',
            item.category || '',
            item.createdAt.toISOString()
          );
          break;
        case 'brew-reviews':
          row.push(
            `"${item.grinderUsed || ''}"`,
            item.brewMethod || '',
            `"${item.coffeeOrigin || ''}"`,
            item.roastLevel || '',
            item.waterTemperature || '',
            item.brewTime || '',
            item.doseGrams || '',
            item.yieldGrams || '',
            item.overallRating || '',
            `"${(item.tasteNotes || '').replace(/"/g, '""')}"`,
            item.createdAt.toISOString()
          );
          break;
      }
      csv += row.join(',') + '\n';
    });

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csv);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      message: error.message
    });
  }
};
