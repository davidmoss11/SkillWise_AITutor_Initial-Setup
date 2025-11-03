// Challenge routes
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

// GET / - Get all challenges with optional filtering
router.get('/', challengeController.getChallenges);

// GET /categories - Get challenge categories
router.get('/categories', challengeController.getCategories);

// GET /:id - Get single challenge by ID
router.get('/:id', challengeController.getChallengeById);

// POST / - Create new challenge (admin only)
router.post('/', auth, challengeController.createChallenge);

// PUT /:id - Update challenge (admin only)
router.put('/:id', auth, challengeController.updateChallenge);

// DELETE /:id - Delete challenge (admin only)
router.delete('/:id', auth, challengeController.deleteChallenge);

// POST /:id/start - Start a challenge (authenticated users)
router.post('/:id/start', auth, challengeController.startChallenge);

module.exports = router;