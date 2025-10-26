const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT access tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token type not valid for this request'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password_hash');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.is_verified
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      message: 'Error verifying token'
    });
  }
};

// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not authenticated'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This endpoint requires ${role} role`
      });
    }

    next();
  };
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'User not authenticated'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Account not verified',
      message: 'Please verify your email address to access this feature'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVerified
};