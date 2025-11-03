// Goal routes
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

// GET / - Get all goals for user
router.get('/', auth, goalController.getGoals);

// GET /:id - Get single goal by ID
router.get('/:id', auth, goalController.getGoalById);

// POST / - Create new goal
router.post('/', auth, goalController.createGoal);

// PUT /:id - Update existing goal
router.put('/:id', auth, goalController.updateGoal);

// DELETE /:id - Delete goal
router.delete('/:id', auth, goalController.deleteGoal);

// PUT /:id/progress - Update goal progress
router.put('/:id/progress', auth, goalController.updateProgress);

// GET /:id/progress - Get goal progress details
router.get('/:id/progress', auth, goalController.getProgress);

module.exports = router;