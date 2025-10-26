const jwt = require('jsonwebtoken');
const db = require('../database/connection');

/**
 * Simple JWT auth middleware that checks Authorization Bearer token,
 * verifies it and attaches the user record (id, email, role) to req.user.
 */
const auth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ error: 'You are not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Load user from DB
    const result = await db.query(
      'SELECT id, email, role, password_changed_at FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // If password_changed_at exists, ensure token iat is newer
    if (user.password_changed_at) {
      const pwdChangedAtSec = Math.floor(
        new Date(user.password_changed_at).getTime() / 1000
      );
      if (decoded.iat && pwdChangedAtSec > decoded.iat) {
        return res.status(401).json({
          error: 'User changed password recently. Please login again.',
        });
      }
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (err) {
    console.error('Auth middleware error', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Simple role restriction helper
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

module.exports = auth;
module.exports.restrictTo = restrictTo;
