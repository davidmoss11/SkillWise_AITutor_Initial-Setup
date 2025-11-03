// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

<<<<<<< Updated upstream
// POST /login route
router.post('/login', authController.login);

// POST /register route
=======
// TODO: Add POST /login route
router.post('/login', authController.login);

// TODO: Add POST /register route
>>>>>>> Stashed changes
router.post('/register', authController.register);

// POST /logout route
router.post('/logout', authController.logout);

// POST /refresh route  
router.post('/refresh', authController.refreshToken);

// Future routes for password reset
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;