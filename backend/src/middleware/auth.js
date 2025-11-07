// JWT authentication middleware
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');
const { AppError } = require('./errorHandler');
const pino = require('pino');

const logger = pino({ name: 'auth-middleware' });

const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in! Please log in to get access.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const userQuery = 'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token does no longer exist.',
        code: 'USER_NOT_FOUND'
      });
    }

    const currentUser = userResult.rows[0];
    
    if (!currentUser.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Grant access to protected route
    req.user = {
      userId: currentUser.id,
      email: currentUser.email,
      firstName: currentUser.first_name,
      lastName: currentUser.last_name,
      role: currentUser.role || 'student'
    };
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired! Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
};

module.exports = auth;
