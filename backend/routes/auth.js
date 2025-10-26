const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
// const User = require('../models/User'); // Temporarily disabled - requires MongoDB
// const { authenticateToken } = require('../middleware/auth'); // Temporarily disabled

const router = express.Router();

// Temporary in-memory user storage (replace with MongoDB when database is connected)
const users = [];

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email (in-memory storage for now)
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login time (optional) - in-memory version
    user.updated_at = new Date();

    // Return success response with tokens and user data
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Server errors - temporary debug logging
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Something went wrong during login'
    });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Validate input
    const validatedData = signupSchema.parse(req.body);
    const { email, password, firstName, lastName } = validatedData;

    // Check if user already exists (in-memory storage)
    const existingUser = users.find(u => u.email === email.toLowerCase());

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (in-memory storage)
    const newUser = {
      id: users.length + 1,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      firstName,
      lastName,
      role: 'student',
      isVerified: false,
      createdAt: new Date(),
      updated_at: new Date()
    };

    users.push(newUser);

    // Return user data (without password)
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Database errors
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Server errors
    res.status(500).json({
      error: 'Server error',
      message: 'Something went wrong during signup'
    });
  }
});

// GET /api/auth/profile - Profile route (temporarily simplified)
router.get('/profile', async (req, res) => {
  try {
    // Return mock profile for now (replace with proper auth when database is connected)
    res.json({
      message: 'Profile retrieved successfully',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        isVerified: false,
        createdAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: 'Something went wrong retrieving profile'
    });
  }
});

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token type not valid for refresh'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Something went wrong refreshing token'
    });
  }
});

module.exports = router;