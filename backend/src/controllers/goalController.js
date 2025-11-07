const Goal = require('../models/Goal');
const db = require('../database/connection');

// Helper to attach challenges to goals
async function attachChallenges(goals) {
  if (!goals.length) return goals;
  const ids = goals.map(g => g.id);
  const result = await db.query('SELECT * FROM challenges WHERE goal_id = ANY($1)', [ids]);
  const byGoal = {};
  result.rows.forEach(ch => {
    byGoal[ch.goal_id] = byGoal[ch.goal_id] || [];
    byGoal[ch.goal_id].push(ch);
  });
  return goals.map(g => ({ ...g, challenges: byGoal[g.id] || [] }));
}

module.exports = {
  // Get all goals for current user including challenges
  getGoals: async (req, res) => {
    try {
      const goals = await Goal.findByUserId(req.user.id);
      const enriched = await attachChallenges(goals);
      return res.json(enriched);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load goals' });
    }
  },
  // Get single goal
  getGoalById: async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal || goal.user_id !== req.user.id) return res.status(404).json({ error: 'Goal not found' });
      const enriched = await attachChallenges([goal]);
      return res.json(enriched[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load goal' });
    }
  },
  // Create goal
  createGoal: async (req, res) => {
    try {
      const { title, description, targetDate } = req.body;
      if (!title) return res.status(400).json({ error: 'Title required' });
      const created = await Goal.create({
        title,
        description: description || '',
        user_id: req.user.id,
        target_completion_date: targetDate || null,
        target_date: targetDate || null,
        category: null,
        difficulty_level: 'medium'
      });
      return res.status(201).json(created);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create goal' });
    }
  },
  // Update goal
  updateGoal: async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal || goal.user_id !== req.user.id) return res.status(404).json({ error: 'Goal not found' });
      const updated = await Goal.update(goal.id, {
        title: req.body.title,
        description: req.body.description,
        target_completion_date: req.body.targetDate,
        target_date: req.body.targetDate,
        progress_percentage: typeof req.body.progress === 'number' ? req.body.progress : undefined,
        is_completed: typeof req.body.status === 'string' ? req.body.status === 'done' : undefined,
        category: req.body.category,
        difficulty_level: req.body.difficulty
      });
      return res.json(updated);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update goal' });
    }
  },
  // Delete goal
  deleteGoal: async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal || goal.user_id !== req.user.id) return res.status(404).json({ error: 'Goal not found' });
      await Goal.delete(goal.id);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete goal' });
    }
  }
};