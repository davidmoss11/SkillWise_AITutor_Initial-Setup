// AI routes for challenge generation, feedback, hints, and analysis
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// POST /api/ai/generateChallenge - Generate a new challenge using AI (Story 3.2)
router.post('/generateChallenge', auth, aiController.generateChallenge);

// GET /api/ai/myChallenges - Get user's saved AI-generated challenges
router.get('/myChallenges', auth, aiController.getMyChallenges);

// POST /api/ai/feedback - Generate AI feedback for a submission
router.post('/feedback', auth, aiController.generateFeedback);

// POST /api/ai/submitForFeedback - Submit work for AI feedback (Story 3.4 & 3.5)
router.post('/submitForFeedback', auth, aiController.submitForFeedback);

// GET /api/ai/feedbackHistory - Get user's feedback history (Story 3.6)
router.get('/feedbackHistory', auth, aiController.getFeedbackHistory);

// GET /api/ai/hints/:challengeId - Get AI-generated hints for a challenge
router.get('/hints/:challengeId', auth, aiController.getHints);

// GET /api/ai/suggestions - Get AI-generated challenge suggestions
router.get('/suggestions', auth, aiController.suggestChallenges);

// GET /api/ai/analysis - Get AI analysis of user's learning progress
router.get('/analysis', auth, aiController.analyzeProgress);

module.exports = router;
