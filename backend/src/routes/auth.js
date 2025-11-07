const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

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
      [email, hashed, firstName, lastName]
    );
    const user = insert.rows[0];

    // Issue access token
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    );

    return res
      .status(201)
      .json({ 
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at
        }, 
        accessToken 
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
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    );

    // Fetch full user details
    const userDetails = await db.query(
      'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1',
      [user.id]
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
        updatedAt: fullUser.updated_at
      } 
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    // For now, return 401 as we don't have refresh token implementation
    // This will cause the frontend to redirect to login
    return res.status(401).json({ error: 'Refresh token not implemented yet' });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ error: 'Refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    // For now, just return success
    // In a full implementation, we would clear refresh tokens from database
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
