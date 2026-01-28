/**
 * =====================================================
 * AUTHENTICATION MIDDLEWARE
 * =====================================================
 * Verifies JWT tokens for protected admin routes
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Use this on any route that requires admin authentication
 */
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided. Please log in.' 
    });
  }

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    // Continue to next middleware/route
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        message: 'Your session has expired. Please log in again.' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token verification failed. Please log in again.' 
    });
  }
};

module.exports = authenticateToken;
