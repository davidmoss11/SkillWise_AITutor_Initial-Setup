const db = require('../database/connection');

const goalController = {
  // Get all goals for user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { category, difficulty, is_completed } = req.query;

      let query = 'SELECT * FROM goals WHERE user_id = $1';
      const params = [userId];
      let paramIndex = 2;

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (difficulty) {
        query += ` AND difficulty_level = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      if (is_completed !== undefined) {
        query += ` AND is_completed = $${paramIndex}`;
        params.push(is_completed === 'true');
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        count: result.rows.length,
        goals: result.rows,
      });
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch goals',
      });
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;

      const result = await db.query(
        'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
        [goalId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found',
        });
      }

      res.json({
        success: true,
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Get goal by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch goal',
      });
    }
  },

  // Create new goal
  createGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const {
        title,
        description,
        category,
        difficulty_level,
        target_completion_date,
        is_public,
      } = req.body;

      // Validation
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Title is required',
        });
      }

      if (title.length > 255) {
        return res.status(400).json({
          success: false,
          error: 'Title must be less than 255 characters',
        });
      }

      // Valid difficulty levels
      const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
      if (difficulty_level && !validDifficulties.includes(difficulty_level.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid difficulty level. Must be: easy, medium, hard, or expert',
        });
      }

      const result = await db.query(
        `INSERT INTO goals 
        (user_id, title, description, category, difficulty_level, target_completion_date, is_public, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now()) 
        RETURNING *`,
        [
          userId,
          title.trim(),
          description || null,
          category || null,
          difficulty_level ? difficulty_level.toLowerCase() : 'medium',
          target_completion_date || null,
          is_public || false,
        ],
      );

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create goal',
      });
    }
  },

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      const {
        title,
        description,
        category,
        difficulty_level,
        target_completion_date,
        is_completed,
        progress_percentage,
        is_public,
      } = req.body;

      // Check if goal exists and belongs to user
      const existing = await db.query(
        'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
        [goalId, userId],
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found',
        });
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (title !== undefined) {
        if (!title || title.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Title cannot be empty',
          });
        }
        updates.push(`title = $${paramIndex}`);
        params.push(title.trim());
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }

      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (difficulty_level !== undefined) {
        const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
        if (!validDifficulties.includes(difficulty_level.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid difficulty level',
          });
        }
        updates.push(`difficulty_level = $${paramIndex}`);
        params.push(difficulty_level.toLowerCase());
        paramIndex++;
      }

      if (target_completion_date !== undefined) {
        updates.push(`target_completion_date = $${paramIndex}`);
        params.push(target_completion_date);
        paramIndex++;
      }

      if (is_completed !== undefined) {
        updates.push(`is_completed = $${paramIndex}`);
        params.push(is_completed);
        paramIndex++;

        // Set completion date if marking as completed
        if (is_completed) {
          updates.push('completion_date = now()');
          updates.push('progress_percentage = 100');
        }
      }

      if (progress_percentage !== undefined) {
        if (progress_percentage < 0 || progress_percentage > 100) {
          return res.status(400).json({
            success: false,
            error: 'Progress percentage must be between 0 and 100',
          });
        }
        updates.push(`progress_percentage = $${paramIndex}`);
        params.push(progress_percentage);
        paramIndex++;
      }

      if (is_public !== undefined) {
        updates.push(`is_public = $${paramIndex}`);
        params.push(is_public);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      updates.push('updated_at = now()');
      params.push(goalId);
      params.push(userId);

      const query = `
        UPDATE goals 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING *
      `;

      const result = await db.query(query, params);

      res.json({
        success: true,
        message: 'Goal updated successfully',
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update goal',
      });
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;

      const result = await db.query(
        'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
        [goalId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found',
        });
      }

      res.json({
        success: true,
        message: 'Goal deleted successfully',
      });
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete goal',
      });
    }
  },
};

module.exports = goalController;
