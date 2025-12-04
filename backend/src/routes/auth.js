const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ error: 'First name and last name are required' });
    }

    // Check if user already exists
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    if (exists.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'User with that email already exists' });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const hashed = bcrypt.hashSync(password, rounds);

    const insert = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, now(), now()) RETURNING id, email, first_name, last_name, created_at',
      [email, hashed, firstName, lastName],
    );
    const user = insert.rows[0];

    // Generate tokens
    const accessToken = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    await db.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [refreshToken, user.id, expiresAt]
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return res
      .status(201)
      .json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
        },
        accessToken,
      });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    await db.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [refreshToken, user.id, expiresAt]
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Fetch full user details
    const userDetails = await db.query(
      'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1',
      [user.id],
    );
    const fullUser = userDetails.rows[0];

    return res.json({
      accessToken,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        firstName: fullUser.first_name,
        lastName: fullUser.last_name,
        createdAt: fullUser.created_at,
        updatedAt: fullUser.updated_at,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error('Invalid refresh token:', err.message);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token exists in database and is not revoked or expired
    const tokenResult = await db.query(
      'SELECT id, user_id, expires_at, is_revoked FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );

    if (tokenResult.rowCount === 0) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const tokenData = tokenResult.rows[0];

    if (tokenData.is_revoked) {
      return res.status(401).json({ error: 'Refresh token has been revoked' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token has expired' });
    }

    // Generate new access token
    const accessToken = generateToken({ id: tokenData.user_id });

    // Optionally rotate refresh token (recommended for security)
    const newRefreshToken = generateRefreshToken({ id: tokenData.user_id });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Revoke old token and create new one
    await db.query('UPDATE refresh_tokens SET is_revoked = true WHERE id = $1', [tokenData.id]);
    await db.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [newRefreshToken, tokenData.user_id, expiresAt]
    );

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token in database
      await db.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1',
        [refreshToken]
      );
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
