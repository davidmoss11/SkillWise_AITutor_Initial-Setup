const db = require('../database/connection');
const bcrypt = require('bcryptjs');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await db.query(
        'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1',
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;

      // Check if email is already taken by another user
      if (email) {
        const emailCheck = await db.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId],
        );

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Email is already taken',
          });
        }
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (firstName !== undefined) {
        updates.push(`first_name = $${paramIndex}`);
        params.push(firstName);
        paramIndex++;
      }

      if (lastName !== undefined) {
        updates.push(`last_name = $${paramIndex}`);
        params.push(lastName);
        paramIndex++;
      }

      if (email !== undefined) {
        updates.push(`email = $${paramIndex}`);
        params.push(email);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      updates.push('updated_at = now()');
      params.push(userId);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, created_at, updated_at
      `;

      const result = await db.query(query, params);
      const user = result.rows[0];

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get goals statistics
      const goalsStats = await db.query(
        `SELECT 
          COUNT(*) as total_goals,
          COUNT(*) FILTER (WHERE is_completed = true) as completed_goals,
          COUNT(*) FILTER (WHERE is_completed = false) as active_goals
        FROM goals WHERE user_id = $1`,
        [userId],
      );

      // Get challenges statistics (if table exists)
      let challengesStats = { total_submissions: 0, completed_challenges: 0 };
      try {
        const challengesResult = await db.query(
          `SELECT 
            COUNT(*) as total_submissions,
            COUNT(DISTINCT challenge_id) as completed_challenges
          FROM submissions WHERE user_id = $1`,
          [userId],
        );
        challengesStats = challengesResult.rows[0];
      } catch (err) {
        // Table might not exist yet
        console.log('Challenges table not available yet');
      }

      res.json({
        success: true,
        data: {
          goals: {
            total: parseInt(goalsStats.rows[0].total_goals) || 0,
            completed: parseInt(goalsStats.rows[0].completed_goals) || 0,
            active: parseInt(goalsStats.rows[0].active_goals) || 0,
          },
          challenges: {
            totalSubmissions: parseInt(challengesStats.total_submissions) || 0,
            completed: parseInt(challengesStats.completed_challenges) || 0,
          },
        },
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required to delete account',
        });
      }

      // Verify password
      const userResult = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const isValidPassword = bcrypt.compareSync(password, userResult.rows[0].password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password',
        });
      }

      // Delete user (cascading deletes will handle related records)
      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete account',
      });
    }
  },
};

module.exports = userController;
