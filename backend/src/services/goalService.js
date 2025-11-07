const Goal = require('../models/Goal');
const db = require('../database/connection');

module.exports = {
  async getUserGoals(userId) {
    const goals = await Goal.findByUserId(userId);
    // Attach challenges
    const ids = goals.map(g => g.id);
    if (ids.length === 0) return [];
    const result = await db.query('SELECT * FROM challenges WHERE goal_id = ANY($1)', [ids]);
    const byGoal = {};
    result.rows.forEach(ch => {
      byGoal[ch.goal_id] = byGoal[ch.goal_id] || [];
      byGoal[ch.goal_id].push(ch);
    });
    return goals.map(g => ({ ...g, challenges: byGoal[g.id] || [] }));
  },
  async createGoal(goalData, userId) {
    return Goal.create({
      title: goalData.title,
      description: goalData.description || '',
      user_id: userId,
      target_completion_date: goalData.targetDate || null,
      target_date: goalData.targetDate || null,
      category: goalData.category || null,
      difficulty_level: goalData.difficulty || 'medium'
    });
  },
  async updateProgress(goalId, progress) {
    return Goal.update(goalId, { progress_percentage: progress });
  },
  calculateCompletion(goal) {
    const total = goal.challenges?.length || 0;
    const done = goal.challenges?.filter(c => c.status === 'done').length || 0;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }
};