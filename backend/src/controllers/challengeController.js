const db = require('../database/connection');

module.exports = {
  // List challenges (optionally filter by goal_id)
  getChallenges: async (req, res) => {
    try {
      const { goalId } = req.query;
      let result;
      if (goalId) {
        result = await db.query('SELECT * FROM challenges WHERE goal_id = $1 ORDER BY created_at DESC', [goalId]);
      } else {
        result = await db.query('SELECT * FROM challenges ORDER BY created_at DESC');
      }
      return res.json(result.rows);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load challenges' });
    }
  },
  // Get by id
  getChallengeById: async (req, res) => {
    try {
      const r = await db.query('SELECT * FROM challenges WHERE id = $1', [req.params.id]);
      const ch = r.rows[0];
      if (!ch) return res.status(404).json({ error: 'Not found' });
      return res.json(ch);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load challenge' });
    }
  },
  // Create (basic)
  createChallenge: async (req, res) => {
    try {
      const { title, description, goalId } = req.body;
      if (!title) return res.status(400).json({ error: 'Title required' });
      const r = await db.query(
        `INSERT INTO challenges (
           title,
           description,
           instructions,
           category,
           goal_id,
           status,
           difficulty_level,
           created_at,
           updated_at
         )
         VALUES ($1,$2,$3,$4,$5,'todo','medium', now(), now()) RETURNING *`,
        [
          title,
          description || '',
          description || 'Follow the challenge instructions.',
          'general',
          goalId || null
        ]
      );
      return res.status(201).json(r.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create challenge' });
    }
  },
  // Update (status or fields)
  updateChallenge: async (req, res) => {
    try {
      const { status, title, description } = req.body;
      const r = await db.query(
        `UPDATE challenges SET 
          status = COALESCE($2, status),
          title = COALESCE($3, title),
          description = COALESCE($4, description),
          updated_at = now()
         WHERE id = $1 RETURNING *`,
        [req.params.id, status, title, description]
      );
      if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
      const updated = r.rows[0];
      // If challenge linked to goal, recalc goal progress
      if (updated.goal_id) {
        try {
          const progress = await db.query(
            `SELECT 
               COUNT(*) FILTER (WHERE status = 'done') AS completed,
               COUNT(*) AS total
             FROM challenges WHERE goal_id = $1`,
            [updated.goal_id]
          );
          const { completed, total } = progress.rows[0];
          const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
          await db.query(
            `UPDATE goals SET 
               progress_percentage = $2,
               is_completed = CASE WHEN $2 >= 100 THEN true ELSE false END,
               updated_at = now()
             WHERE id = $1`,
            [updated.goal_id, pct]
          );
        } catch (err) {
          // Log but don't fail response
          console.error('Failed to update goal progress:', err.message);
        }
      }
      return res.json(updated);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update challenge' });
    }
  },
  // Delete
  deleteChallenge: async (req, res) => {
    try {
      const r = await db.query('DELETE FROM challenges WHERE id = $1 RETURNING id', [req.params.id]);
      if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete challenge' });
    }
  }
};