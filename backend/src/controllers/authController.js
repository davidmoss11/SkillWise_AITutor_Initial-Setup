// Authentication controller with login, register, logout, refresh token endpoints
const authService = require('../services/authService');
const { z } = require('zod');
const pino = require('pino');

const logger = pino({ name: 'auth-controller' });

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long')
});

const authController = {
  // Login endpoint
  login: async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // Authenticate user
      const result = await authService.login(validatedData.email, validatedData.password);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data and access token
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
      
    } catch (error) {
      logger.error('Login controller error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      const statusCode = error.message === 'Invalid credentials' || 
                        error.message === 'Account is deactivated' ? 401 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  },

  // Register endpoint  
  register: async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Register user
      const result = await authService.register(validatedData);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Return user data and access token
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
      
    } catch (error) {
      logger.error('Register controller error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      const statusCode = error.message === 'User already exists with this email' ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  },

  // Logout endpoint
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      // Revoke refresh token
      await authService.logout(refreshToken);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      logger.error('Logout controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  // Refresh token endpoint
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided'
        });
      }
      
      // Generate new access token
      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken
        }
      });
      
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed'
      });
    }
  }
};

module.exports = authController;