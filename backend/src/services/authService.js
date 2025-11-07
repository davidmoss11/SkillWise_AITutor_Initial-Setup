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
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  },

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
      throw error;
    }
  },

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
      throw error;
    }
  },

  // Password reset (placeholder for future implementation)
  resetPassword: async (email) => {
    // Implementation needed for email-based password reset
    throw new Error('Password reset not implemented yet');
  }
};

module.exports = authService;