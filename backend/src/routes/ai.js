const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// All AI routes require authentication
router.use(auth);

/**
 * @route   POST /api/ai/generateChallenge
 * @desc    Generate a new coding challenge using AI
 * @access  Private
 */
router.post('/generateChallenge', aiController.generateChallenge);

/**
 * @route   POST /api/ai/submitForFeedback
 * @desc    Submit code for AI feedback
 * @access  Private
 */
router.post('/submitForFeedback', aiController.submitForFeedback);

/**
 * @route   POST /api/ai/generateHint
 * @desc    Get an AI-generated hint for a challenge
 * @access  Private
 */
router.post('/generateHint', aiController.generateHint);

/**
 * @route   GET /api/ai/feedback/:submissionId
 * @desc    Get feedback for a specific submission
 * @access  Private
 */
router.get('/feedback/:submissionId', aiController.getFeedback);

/**
 * @route   GET /api/ai/feedback/user/:userId
 * @desc    Get all feedback for a user
 * @access  Private
 */
router.get('/feedback/user/:userId', aiController.getUserFeedback);

module.exports = router;