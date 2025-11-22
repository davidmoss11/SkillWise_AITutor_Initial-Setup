// AI routes implementation
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Sprint 3: Generate AI challenge
router.get('/generateChallenge', auth, aiController.generateChallenge);

// Sprint 3: Submit for AI feedback (explicit story requirement)
router.post('/submitForFeedback', auth, aiController.submitForFeedback);

// Existing TODO placeholders (not implemented this sprint)
router.post('/feedback', auth, aiController.generateFeedback); // legacy path placeholder
router.get('/hints/:challengeId', auth, aiController.getHints);
router.get('/suggestions', auth, aiController.suggestChallenges);
router.get('/analysis', auth, aiController.analyzeProgress);

module.exports = router;
