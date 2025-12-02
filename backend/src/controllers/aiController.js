// AI integration controller for feedback, hints, and challenge generation
const aiService = require('../services/aiService');
const challengeService = require('../services/challengeService');
const db = require('../database/connection');

const aiController = {
  // Generate AI feedback for submission
  generateFeedback: async (req, res, next) => {
    try {
      const { submissionId, submissionText, challengeId } = req.body;

      if (!submissionText || !challengeId) {
        return res.status(400).json({
          success: false,
          message: 'Submission text and challenge ID are required',
        });
      }

      // Get challenge context
      const challengeQuery = 'SELECT * FROM challenges WHERE id = $1';
      const challengeResult = await db.query(challengeQuery, [challengeId]);
      
      if (challengeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }

      const challenge = challengeResult.rows[0];

      const feedback = await aiService.generateFeedback(
        submissionId,
        submissionText,
        {
          title: challenge.title,
          instructions: challenge.instructions,
        }
      );

      res.status(200).json({
        success: true,
        data: { feedback },
      });
    } catch (error) {
      console.error('Generate feedback error:', error);
      next(error);
    }
  },

  // Submit work for AI feedback (Story 3.4 & 3.5)
  submitForFeedback: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const {
        challengeId,
        submissionText,
        submissionType = 'code',
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      if (!submissionText || !challengeId) {
        return res.status(400).json({
          success: false,
          message: 'Challenge ID and submission text are required',
        });
      }

      // Get challenge context
      const challengeQuery = 'SELECT * FROM challenges WHERE id = $1';
      const challengeResult = await db.query(challengeQuery, [challengeId]);
      
      if (challengeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found',
        });
      }

      const challenge = challengeResult.rows[0];

      // Get next attempt number for this user/challenge
      const attemptQuery = `
        SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
        FROM submissions 
        WHERE user_id = $1 AND challenge_id = $2
      `;
      const attemptResult = await db.query(attemptQuery, [userId, challengeId]);
      const attemptNumber = attemptResult.rows[0].next_attempt;

      // Create submission record
      const submissionQuery = `
        INSERT INTO submissions 
        (challenge_id, user_id, submission_text, status, attempt_number, submitted_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;

      const submissionResult = await db.query(submissionQuery, [
        challengeId,
        userId,
        submissionText,
        'pending',
        attemptNumber,
      ]);

      const submission = submissionResult.rows[0];

      // Generate AI feedback
      const startTime = Date.now();
      const feedback = await aiService.generateFeedback(
        submission.id,
        submissionText,
        {
          title: challenge.title,
          instructions: challenge.instructions,
        }
      );
      const processingTime = Date.now() - startTime;

      // Store feedback in database (Story 3.6)
      const feedbackQuery = `
        INSERT INTO ai_feedback 
        (submission_id, challenge_id, user_id, prompt, response, feedback_type,
         overall_assessment, strengths, areas_for_improvement, specific_suggestions,
         code_quality_score, meets_requirements, next_steps, ai_model, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *
      `;

      const feedbackResult = await db.query(feedbackQuery, [
        submission.id,
        challengeId,
        userId,
        `Challenge: ${challenge.title}\n\nSubmission:\n${submissionText}`,
        JSON.stringify(feedback),
        submissionType,
        feedback.overall_assessment || null,
        feedback.strengths || [],
        feedback.areas_for_improvement || [],
        feedback.specific_suggestions || [],
        feedback.code_quality_score || null,
        feedback.meets_requirements || null,
        feedback.next_steps || [],
        process.env.COHERE_MODEL || 'command-a-03-2025',
      ]);

      const savedFeedback = feedbackResult.rows[0];

      // Update submission status
      await db.query(
        'UPDATE submissions SET status = $1 WHERE id = $2',
        ['reviewed', submission.id]
      );

      console.log(`✅ AI Feedback generated and saved for submission ${submission.id} (${processingTime}ms)`);

      res.status(200).json({
        success: true,
        message: 'Feedback generated successfully',
        data: {
          submission: {
            ...submission,
            status: 'reviewed',
          },
          feedback: {
            id: savedFeedback.id,
            ...feedback,
          },
          processingTime,
        },
      });
    } catch (error) {
      console.error('Submit for feedback error:', error);
      next(error);
    }
  },

  // Get feedback history for user (Story 3.6)
  getFeedbackHistory: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { challengeId } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      let query = `
        SELECT 
          af.*,
          s.submission_text,
          s.submitted_at,
          c.title as challenge_title,
          c.category as challenge_category
        FROM ai_feedback af
        JOIN submissions s ON af.submission_id = s.id
        JOIN challenges c ON af.challenge_id = c.id
        WHERE af.user_id = $1
      `;

      const params = [userId];

      if (challengeId) {
        query += ' AND af.challenge_id = $2';
        params.push(challengeId);
      }

      query += ' ORDER BY af.created_at DESC';

      const result = await db.query(query, params);

      res.status(200).json({
        success: true,
        data: {
          feedback: result.rows,
          count: result.rows.length,
        },
      });
    } catch (error) {
      console.error('Get feedback history error:', error);
      next(error);
    }
  },

  // Get AI hints for challenge
  getHints: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;

      // Get user's progress on this challenge
      const userProgress = { attempts: 0 }; // TODO: Fetch from submissions table

      const hints = await aiService.generateHints(challengeId, userProgress);

      res.status(200).json({
        success: true,
        data: { hints },
      });
    } catch (error) {
      console.error('Get hints error:', error);
      next(error);
    }
  },

  // Generate challenge suggestions based on user progress
  suggestChallenges: async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const suggestions = await aiService.suggestNextChallenges(userId);

      res.status(200).json({
        success: true,
        data: { suggestions },
      });
    } catch (error) {
      console.error('Suggest challenges error:', error);
      next(error);
    }
  },

  // Analyze learning progress using AI
  analyzeProgress: async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const analysis = await aiService.analyzePattern(userId, {});

      res.status(200).json({
        success: true,
        data: { analysis },
      });
    } catch (error) {
      console.error('Analyze progress error:', error);
      next(error);
    }
  },

  // Generate a new challenge using AI (Story 3.2)
  generateChallenge: async (req, res, next) => {
    try {
      const {
        category = 'programming',
        difficulty = 'medium',
        topic = null,
        saveToDatabase = false,
      } = req.body;

      const userId = req.user?.id;

      // Validate difficulty level
      const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Invalid difficulty level. Must be one of: ${validDifficulties.join(', ')}`,
        });
      }

      // Generate challenge using AI service
      const challengeData = await aiService.generateChallenge({
        category,
        difficulty,
        topic,
        userId,
      });

      // Optionally save the generated challenge to database
      let savedChallenge = null;
      if (saveToDatabase && userId) {
        try {
          // Use challengeService to save with proper structure
          const insertQuery = `
            INSERT INTO challenges 
            (title, description, instructions, category, difficulty_level, 
             estimated_time_minutes, points_reward, max_attempts, is_active, 
             created_by, tags, prerequisites, learning_objectives, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) 
            RETURNING *
          `;

          const result = await db.query(insertQuery, [
            challengeData.title,
            challengeData.description,
            challengeData.instructions,
            challengeData.category,
            challengeData.difficulty_level,
            challengeData.estimated_time_minutes || 30,
            challengeData.points_reward || 50,
            challengeData.max_attempts || 3,
            true, // is_active
            userId, // created_by
            challengeData.tags || [],
            challengeData.prerequisites || [],
            challengeData.learning_objectives || [],
          ]);

          savedChallenge = result.rows[0];

          console.log('✅ AI-generated challenge saved to database:', savedChallenge.id);
        } catch (saveError) {
          console.error('Failed to save challenge to database:', saveError);
          // Don't fail the request if saving fails, just log it
        }
      }

      res.status(200).json({
        success: true,
        message: 'Challenge generated successfully',
        data: {
          challenge: {
            ...challengeData,
            id: savedChallenge?.id || null,
          },
          saved: saveToDatabase && savedChallenge !== null,
          challengeId: savedChallenge?.id || null,
        },
      });
    } catch (error) {
      console.error('Generate challenge error:', error);
      
      // Check if it's an OpenAI API error
      if (error.message.includes('API key')) {
        return res.status(500).json({
          success: false,
          message: 'AI service configuration error. Please contact administrator.',
        });
      }

      next(error);
    }
  },

  // Get user's saved AI-generated challenges
  getMyChallenges: async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const query = `
        SELECT * FROM challenges 
        WHERE created_by = $1 
        ORDER BY created_at DESC
      `;

      const result = await db.query(query, [userId]);

      res.status(200).json({
        success: true,
        data: {
          challenges: result.rows,
          count: result.rows.length,
        },
      });
    } catch (error) {
      console.error('Get my challenges error:', error);
      next(error);
    }
  },
};

module.exports = aiController;
