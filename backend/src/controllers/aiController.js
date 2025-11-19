const aiService = require('../services/aiService');
const db = require('../database/connection');

const aiController = {
  /**
   * Generate a new coding challenge using AI
   * POST /api/ai/generateChallenge
   */
  generateChallenge: async (req, res, next) => {
    try {
      const { topic, difficulty, language, skillLevel } = req.body;

      // Validate input
      if (!topic || !difficulty) {
        return res.status(400).json({
          success: false,
          message: 'Topic and difficulty are required'
        });
      }

      console.log(`[AI Controller] User ${req.user.userId} generating challenge:`, { topic, difficulty });

      // Generate challenge using AI service
      const result = await aiService.generateChallenge({
        topic,
        difficulty,
        language: language || 'JavaScript',
        skillLevel: skillLevel || 'intermediate'
      });

      // Log the prompt and response for monitoring
      console.log('[AI Controller] Challenge generated:', {
        title: result.challenge.title,
        tokensUsed: result.metadata.tokensUsed,
        model: result.metadata.model
      });

      // Optionally save challenge to database for future reference
      // This could be implemented based on your needs

      res.status(200).json({
        success: true,
        challenge: result.challenge,
        metadata: {
          model: result.metadata.model,
          tokensUsed: result.metadata.tokensUsed,
          timestamp: result.metadata.timestamp
        }
      });
    } catch (error) {
      console.error('[AI Controller] Error generating challenge:', error);
      next(error);
    }
  },

  /**
   * Submit code for AI feedback
   * POST /api/ai/submitForFeedback
   */
  submitForFeedback: async (req, res, next) => {
    try {
      const { code, challengeId, challengeTitle, requirements, language } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!code || !challengeTitle) {
        return res.status(400).json({
          success: false,
          message: 'Code and challenge title are required'
        });
      }

      console.log(`[AI Controller] User ${userId} submitting code for feedback:`, challengeTitle);

      // Check if submission exists
      let submissionId = challengeId;
      
      if (challengeId) {
        // Find existing submission
        const submission = await db.query(
          'SELECT id FROM submissions WHERE id = $1 AND user_id = $2',
          [challengeId, userId]
        );
        
        if (submission.rows.length === 0) {
          submissionId = null;
        }
      }

      // Create submission if it doesn't exist
      if (!submissionId) {
        const submissionResult = await db.query(
          `INSERT INTO submissions (user_id, challenge_id, code, status, submitted_at)
           VALUES ($1, $2, $3, 'pending', NOW())
           RETURNING id`,
          [userId, challengeId || null, code]
        );
        submissionId = submissionResult.rows[0].id;
      }

      // Get feedback from AI
      const result = await aiService.evaluateSubmission({
        code,
        challengeTitle,
        requirements: requirements || ['Code compiles', 'Meets basic requirements'],
        language: language || 'JavaScript'
      });

      // Save feedback to database
      const feedbackResult = await db.query(
        `INSERT INTO ai_feedback (submission_id, prompt, response, score, feedback_data, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [
          submissionId,
          result.metadata.prompt,
          result.metadata.response,
          result.feedback.score || 0,
          JSON.stringify(result.feedback)
        ]
      );

      console.log('[AI Controller] Feedback generated and saved:', {
        submissionId,
        feedbackId: feedbackResult.rows[0].id,
        score: result.feedback.score,
        tokensUsed: result.metadata.tokensUsed
      });

      res.status(200).json({
        success: true,
        submissionId,
        feedbackId: feedbackResult.rows[0].id,
        feedback: result.feedback,
        metadata: {
          model: result.metadata.model,
          tokensUsed: result.metadata.tokensUsed,
          timestamp: result.metadata.timestamp
        }
      });
    } catch (error) {
      console.error('[AI Controller] Error generating feedback:', error);
      next(error);
    }
  },

  /**
   * Generate a hint for a challenge
   * POST /api/ai/generateHint
   */
  generateHint: async (req, res, next) => {
    try {
      const { challengeTitle, challengeDescription, progress, skillLevel } = req.body;

      if (!challengeTitle || !challengeDescription) {
        return res.status(400).json({
          success: false,
          message: 'Challenge title and description are required'
        });
      }

      console.log(`[AI Controller] User ${req.user.userId} requesting hint:`, challengeTitle);

      const result = await aiService.generateHint({
        challengeTitle,
        challengeDescription,
        progress: progress || 'Just started',
        skillLevel: skillLevel || 'intermediate'
      });

      res.status(200).json({
        success: true,
        hint: result.hint,
        metadata: {
          model: result.metadata.model,
          tokensUsed: result.metadata.tokensUsed,
          timestamp: result.metadata.timestamp
        }
      });
    } catch (error) {
      console.error('[AI Controller] Error generating hint:', error);
      next(error);
    }
  },

  /**
   * Get feedback for a specific submission
   * GET /api/ai/feedback/:submissionId
   */
  getFeedback: async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const userId = req.user.userId;

      const result = await db.query(
        `SELECT af.id, af.submission_id, af.score, af.feedback_data, af.created_at
         FROM ai_feedback af
         JOIN submissions s ON s.id = af.submission_id
         WHERE af.submission_id = $1 AND s.user_id = $2
         ORDER BY af.created_at DESC
         LIMIT 1`,
        [submissionId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }

      const feedback = result.rows[0];

      res.status(200).json({
        success: true,
        feedback: {
          id: feedback.id,
          submissionId: feedback.submission_id,
          score: feedback.score,
          data: feedback.feedback_data,
          createdAt: feedback.created_at
        }
      });
    } catch (error) {
      console.error('[AI Controller] Error fetching feedback:', error);
      next(error);
    }
  },

  /**
   * Get all feedback for a user
   * GET /api/ai/feedback/user/:userId
   */
  getUserFeedback: async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Ensure user can only access their own feedback
      if (parseInt(userId) !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await db.query(
        `SELECT af.id, af.submission_id, af.score, af.feedback_data, af.created_at,
                s.code, s.submitted_at
         FROM ai_feedback af
         JOIN submissions s ON s.id = af.submission_id
         WHERE s.user_id = $1
         ORDER BY af.created_at DESC
         LIMIT 50`,
        [userId]
      );

      res.status(200).json({
        success: true,
        feedback: result.rows.map(row => ({
          id: row.id,
          submissionId: row.submission_id,
          score: row.score,
          data: row.feedback_data,
          createdAt: row.created_at,
          submission: {
            code: row.code,
            submittedAt: row.submitted_at
          }
        }))
      });
    } catch (error) {
      console.error('[AI Controller] Error fetching user feedback:', error);
      next(error);
    }
  }
};

module.exports = aiController;