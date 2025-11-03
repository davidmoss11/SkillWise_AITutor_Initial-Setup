<<<<<<< Updated upstream
// Authentication business logic
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const pool = require('../database/connection');
const pino = require('pino');

const logger = pino({ name: 'auth-service' });

const authService = {
  // User login logic
  login: async (email, password) => {
    try {
      // Find user by email
      const userQuery = 'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1';
      const userResult = await pool.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];
      
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokenPayload = { 
        userId: user.id, 
        email: user.email,
        role: user.role || 'student'
      };
      
      const accessToken = jwt.generateToken(tokenPayload);
      const refreshToken = jwt.generateRefreshToken(tokenPayload);

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await pool.query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, user.id, expiresAt]
      );

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Return user data without password
      const { password_hash, ...userData } = user;
      
      return {
        user: userData,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  },

  // User registration
  register: async (userData) => {
    const { email, password, firstName, lastName } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const insertQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, email, first_name, last_name, is_active, created_at
      `;
      const result = await pool.query(insertQuery, [email, passwordHash, firstName, lastName]);
      
      const newUser = result.rows[0];

      // Generate tokens
      const tokenPayload = { 
        userId: newUser.id, 
        email: newUser.email,
        role: 'student'
      };
      
      const accessToken = jwt.generateToken(tokenPayload);
      const refreshToken = jwt.generateRefreshToken(tokenPayload);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
        [refreshToken, newUser.id, expiresAt]
      );

      return {
        user: newUser,
=======
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authService = {
  // User registration
  register: async (userData) => {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        throw new Error('All fields are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await User.create({
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });

      // Generate tokens
      const accessToken = jwt.generateAccessToken({ 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      });
      
      const refreshToken = jwt.generateRefreshToken({ 
        id: newUser.id 
      });

      return {
        user: newUser.toJSON(),
>>>>>>> Stashed changes
        accessToken,
        refreshToken
      };
    } catch (error) {
<<<<<<< Updated upstream
      logger.error('Registration error:', error);
=======
>>>>>>> Stashed changes
      throw error;
    }
  },

<<<<<<< Updated upstream
  // Token refresh
  refreshToken: async (refreshToken) => {
    try {
      // Verify refresh token
      const decoded = jwt.verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists and is not revoked
      const tokenQuery = `
        SELECT rt.*, u.email, u.is_active 
        FROM refresh_tokens rt 
        JOIN users u ON rt.user_id = u.id 
        WHERE rt.token = $1 AND rt.is_revoked = false AND rt.expires_at > CURRENT_TIMESTAMP
      `;
      const tokenResult = await pool.query(tokenQuery, [refreshToken]);
      
      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokenData = tokenResult.rows[0];
      
      if (!tokenData.is_active) {
        throw new Error('Account is deactivated');
      }

      // Generate new access token
      const tokenPayload = { 
        userId: tokenData.user_id, 
        email: tokenData.email,
        role: 'student'
      };
      
      const newAccessToken = jwt.generateToken(tokenPayload);

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
=======
  // User login
  login: async (email, password) => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await User.findByEmail(email.toLowerCase().trim());
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = jwt.generateAccessToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });
      
      const refreshToken = jwt.generateRefreshToken({ 
        id: user.id 
      });

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      // Verify refresh token
      const decoded = jwt.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const newAccessToken = jwt.generateAccessToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

      return {
        accessToken: newAccessToken,
        user: user.toJSON()
      };
    } catch (error) {
>>>>>>> Stashed changes
      throw error;
    }
  },

<<<<<<< Updated upstream
  // Logout (revoke refresh token)
  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await pool.query(
          'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
          [refreshToken]
        );
      }
      return true;
    } catch (error) {
      logger.error('Logout error:', error);
=======
  // Validate user by ID (for middleware)
  validateUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      return user ? user.toJSON() : null;
    } catch (error) {
>>>>>>> Stashed changes
      throw error;
    }
  },

<<<<<<< Updated upstream
  // Password reset (placeholder for future implementation)
  resetPassword: async (email) => {
    // Implementation needed for email-based password reset
    throw new Error('Password reset not implemented yet');
=======
  // Password reset (basic implementation)
  resetPassword: async (email) => {
    try {
      const user = await User.findByEmail(email.toLowerCase().trim());
      if (!user) {
        // Don't reveal if email exists for security
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // TODO: Implement password reset token generation and email sending
      // For now, just return success message
      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      throw error;
    }
>>>>>>> Stashed changes
  }
};

module.exports = authService;