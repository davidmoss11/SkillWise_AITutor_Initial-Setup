const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const auth = require('../middleware/auth');

// Shared handler used by /register and optional /signup alias
async function handleRegister(req, res) {
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
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    );

    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/register
router.post('/register', handleRegister);
// POST /api/auth/signup (alias kept for compatibility across branches)
router.post('/signup', handleRegister);

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

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'dev-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    );

    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - return current user if token valid
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is set by auth middleware
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

// POST /api/auth/logout - no-op for stateless JWT, provided for client compatibility
router.post('/logout', auth, async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
