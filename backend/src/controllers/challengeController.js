const db = require('../database/connection');

const challengeController = {
  // Get all challenges with optional filters
  getChallenges: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { category, difficulty, is_active, search } = req.query;

      let query = `
        SELECT c.*, 
               u.email as creator_email,
               u.first_name as creator_first_name,
               u.last_name as creator_last_name
        FROM challenges c
        LEFT JOIN users u ON c.created_by = u.id
      `;
      const params = [];
      let paramIndex = 1;

      // Build WHERE clause conditions
      const conditions = [];

      // Note: Show all challenges, not just user's own challenges
      // Users can see all available challenges to attempt

      // Filter by category
      if (category) {
        conditions.push(`c.category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      // Filter by difficulty
      if (difficulty) {
        conditions.push(`c.difficulty_level = $${paramIndex}`);
        params.push(difficulty.toLowerCase());
        paramIndex++;
      }

      // Filter by active status
      if (is_active !== undefined) {
        conditions.push(`c.is_active = $${paramIndex}`);
        params.push(is_active === 'true');
        paramIndex++;
      }

      // Search by title or description
      if (search) {
        conditions.push(
          `(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`
        );
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY c.created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        challenges: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch challenges',
      });
    }
  },

  // Get single challenge by ID
  // eslint-disable-next-line no-unused-vars
  getChallengeById: async (req, res, next) => {
    try {
      const challengeId = req.params.id;

      const result = await db.query(
        `SELECT c.*, 
                u.email as creator_email,
                u.first_name as creator_first_name,
                u.last_name as creator_last_name
         FROM challenges c
         LEFT JOIN users u ON c.created_by = u.id
         WHERE c.id = $1`,
        [challengeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Challenge not found',
        });
      }

      res.json({
        success: true,
        challenge: result.rows[0],
      });
    } catch (error) {
      console.error('Get challenge by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch challenge',
      });
    }
  },

  // Create new challenge
  // eslint-disable-next-line no-unused-vars
  createChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const {
        title,
        description,
        instructions,
        category,
        difficulty_level,
        estimated_time_minutes,
        points_reward,
        max_attempts,
        requires_peer_review,
        is_active,
        tags,
        prerequisites,
        learning_objectives,
      } = req.body;

      // Validation
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Title is required',
        });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Description is required',
        });
      }

      if (!instructions || instructions.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Instructions are required',
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      // Insert challenge
      const result = await db.query(
        `INSERT INTO challenges 
        (title, description, instructions, category, difficulty_level, estimated_time_minutes, 
         points_reward, max_attempts, requires_peer_review, is_active, created_by,
         tags, prerequisites, learning_objectives, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now()) 
        RETURNING *`,
        [
          title.trim(),
          description.trim(),
          instructions.trim(),
          category.trim(),
          difficulty_level ? difficulty_level.toLowerCase() : 'medium',
          estimated_time_minutes || null,
          points_reward || 10,
          max_attempts || 3,
          requires_peer_review || false,
          is_active !== undefined ? is_active : true,
          userId,
          tags || [],
          prerequisites || [],
          learning_objectives || [],
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        challenge: result.rows[0],
      });
    } catch (error) {
      console.error('Create challenge error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create challenge',
      });
    }
  },

  // Update existing challenge
  // eslint-disable-next-line no-unused-vars
  updateChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;
      const {
        title,
        description,
        instructions,
        category,
        difficulty_level,
        estimated_time_minutes,
        points_reward,
        max_attempts,
        requires_peer_review,
        is_active,
        tags,
        prerequisites,
        learning_objectives,
      } = req.body;

      // Check if challenge exists and user has permission
      const existing = await db.query(
        'SELECT * FROM challenges WHERE id = $1',
        [challengeId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Challenge not found',
        });
      }

      const challenge = existing.rows[0];

      // User can only update if they created it
      if (challenge.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this challenge',
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
        if (!description || description.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Description cannot be empty',
          });
        }
        updates.push(`description = $${paramIndex}`);
        params.push(description.trim());
        paramIndex++;
      }

      if (instructions !== undefined) {
        if (!instructions || instructions.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Instructions cannot be empty',
          });
        }
        updates.push(`instructions = $${paramIndex}`);
        params.push(instructions.trim());
        paramIndex++;
      }

      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        params.push(category.trim());
        paramIndex++;
      }

      if (difficulty_level !== undefined) {
        const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
        if (!validDifficulties.includes(difficulty_level.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error:
              'Invalid difficulty level. Must be: easy, medium, hard, or expert',
          });
        }
        updates.push(`difficulty_level = $${paramIndex}`);
        params.push(difficulty_level.toLowerCase());
        paramIndex++;
      }

      if (estimated_time_minutes !== undefined) {
        updates.push(`estimated_time_minutes = $${paramIndex}`);
        params.push(estimated_time_minutes);
        paramIndex++;
      }

      if (points_reward !== undefined) {
        updates.push(`points_reward = $${paramIndex}`);
        params.push(points_reward);
        paramIndex++;
      }

      if (max_attempts !== undefined) {
        updates.push(`max_attempts = $${paramIndex}`);
        params.push(max_attempts);
        paramIndex++;
      }

      if (requires_peer_review !== undefined) {
        updates.push(`requires_peer_review = $${paramIndex}`);
        params.push(requires_peer_review);
        paramIndex++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        params.push(is_active);
        paramIndex++;
      }

      if (tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        params.push(tags);
        paramIndex++;
      }

      if (prerequisites !== undefined) {
        updates.push(`prerequisites = $${paramIndex}`);
        params.push(prerequisites);
        paramIndex++;
      }

      if (learning_objectives !== undefined) {
        updates.push(`learning_objectives = $${paramIndex}`);
        params.push(learning_objectives);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = now()');

      // Add challengeId as final parameter
      params.push(challengeId);

      const query = `
        UPDATE challenges 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, params);

      res.json({
        success: true,
        message: 'Challenge updated successfully',
        challenge: result.rows[0],
      });
    } catch (error) {
      console.error('Update challenge error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update challenge',
      });
    }
  },

  // Delete challenge
  // eslint-disable-next-line no-unused-vars
  deleteChallenge: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;

      // Check if challenge exists and user has permission
      const existing = await db.query(
        'SELECT * FROM challenges WHERE id = $1',
        [challengeId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Challenge not found',
        });
      }

      const challenge = existing.rows[0];

      // User can only delete if they created it
      if (challenge.created_by !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to delete this challenge',
        });
      }

      await db.query('DELETE FROM challenges WHERE id = $1', [challengeId]);

      res.json({
        success: true,
        message: 'Challenge deleted successfully',
      });
    } catch (error) {
      console.error('Delete challenge error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete challenge',
      });
    }
  },
};

module.exports = challengeController;
