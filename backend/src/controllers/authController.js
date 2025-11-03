<<<<<<< Updated upstream
// Authentication controller with login, register, logout, refresh token endpoints
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
      
=======
  // User registration
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
          errors: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null,
            firstName: !firstName ? 'First name is required' : null,
            lastName: !lastName ? 'Last name is required' : null
          }
        });
      }

      // Additional validation
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
          errors: { email: 'Please enter a valid email address' }
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
          errors: { password: 'Password must be at least 8 characters long' }
        });
      }

      // Create user
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

>>>>>>> Stashed changes
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
<<<<<<< Updated upstream
      
      // Return user data and access token
      res.status(201).json({
        success: true,
        message: 'Registration successful',
=======

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
>>>>>>> Stashed changes
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
<<<<<<< Updated upstream
      
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
=======
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          errors: { email: error.message }
        });
      }

      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
>>>>>>> Stashed changes
      });
    }
  },

<<<<<<< Updated upstream
  // Logout endpoint
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      // Revoke refresh token
      await authService.logout(refreshToken);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
=======
  // User login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          errors: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null
          }
        });
      }

      // Authenticate user
      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          errors: { credentials: 'Invalid email or password' }
        });
      }

      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  },

  // User logout
  logout: async (req, res, next) => {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

>>>>>>> Stashed changes
      res.json({
        success: true,
        message: 'Logout successful'
      });
<<<<<<< Updated upstream
      
    } catch (error) {
      logger.error('Logout controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Logout failed'
=======
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
>>>>>>> Stashed changes
      });
    }
  },

<<<<<<< Updated upstream
  // Refresh token endpoint
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
=======
  // Refresh access token
  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;

>>>>>>> Stashed changes
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided'
        });
      }
<<<<<<< Updated upstream
      
      // Generate new access token
      const result = await authService.refreshToken(refreshToken);
      
=======

      const result = await authService.refreshToken(refreshToken);

>>>>>>> Stashed changes
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
<<<<<<< Updated upstream
          accessToken: result.accessToken
        }
      });
      
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed'
=======
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh'
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res, next) => {
    try {
      // User is attached to req by auth middleware
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
>>>>>>> Stashed changes
      });
    }
  }
};

module.exports = authController;