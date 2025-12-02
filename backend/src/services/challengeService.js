// Challenge business logic with AI integration
const Challenge = require('../models/Challenge');
const db = require('../database/connection');
const aiService = require('./aiService');

const challengeService = {
  // Get challenges with difficulty filtering
  getChallenges: async (filters = {}) => {
    try {
      const {
        category,
        difficulty,
        isActive = true,
        limit = 50,
        offset = 0,
        searchTerm,
        tags,
      } = filters;

      let query = 'SELECT * FROM challenges WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (difficulty) {
        query += ` AND difficulty_level = $${paramIndex}`;
        params.push(difficulty.toLowerCase());
        paramIndex++;
      }

      if (isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(isActive);
        paramIndex++;
      }

      if (searchTerm) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }

      if (tags && Array.isArray(tags) && tags.length > 0) {
        query += ` AND tags && $${paramIndex}`;
        params.push(tags);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Get challenges error:', error);
      throw new Error(`Failed to get challenges: ${error.message}`);
    }
  },

  // Generate personalized AI challenges for a user
  generatePersonalizedChallenges: async (userId, options = {}) => {
    try {
      const {
        count = 3,
        category = 'programming',
        adaptToDifficulty = true,
      } = options;

      // Get user statistics to determine appropriate difficulty
      let difficulty = 'medium';
      
      if (adaptToDifficulty) {
        const statsQuery = 'SELECT * FROM user_statistics WHERE user_id = $1';
        const statsResult = await db.query(statsQuery, [userId]);
        
        if (statsResult.rows.length > 0) {
          const stats = statsResult.rows[0];
          const avgScore = stats.average_score || 0;
          const completedCount = stats.challenges_completed || 0;

          // Determine difficulty based on performance
          if (completedCount < 5 || avgScore < 50) {
            difficulty = 'easy';
          } else if (avgScore >= 50 && avgScore < 75) {
            difficulty = 'medium';
          } else if (avgScore >= 75 && avgScore < 90) {
            difficulty = 'hard';
          } else {
            difficulty = 'expert';
          }
        }
      }

      // Get user's completed topics to suggest variety
      const completedTopicsQuery = `
        SELECT DISTINCT c.category, c.tags
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1 AND s.status = 'approved'
        ORDER BY s.submitted_at DESC
        LIMIT 10
      `;
      const completedTopicsResult = await db.query(completedTopicsQuery, [userId]);
      
      const challenges = [];
      const difficulties = ['easy', 'medium', 'hard'];
      
      // Generate multiple challenges
      for (let i = 0; i < count; i++) {
        const challengeDifficulty = adaptToDifficulty 
          ? difficulty 
          : difficulties[i % difficulties.length];

        const challenge = await aiService.generateChallenge({
          category,
          difficulty: challengeDifficulty,
          topic: null,
          userId,
        });

        challenges.push({
          ...challenge,
          personalized: true,
          recommended_for_user: userId,
        });
      }

      return challenges;
    } catch (error) {
      console.error('Generate personalized challenges error:', error);
      throw new Error(`Failed to generate personalized challenges: ${error.message}`);
    }
  },

  // Validate challenge completion based on test cases
  validateCompletion: async (challengeId, submissionData) => {
    try {
      const { code, testCases } = submissionData;

      // Get challenge details
      const challengeQuery = 'SELECT * FROM challenges WHERE id = $1';
      const challengeResult = await db.query(challengeQuery, [challengeId]);

      if (challengeResult.rows.length === 0) {
        throw new Error('Challenge not found');
      }

      const challenge = challengeResult.rows[0];

      // Parse test cases from challenge or submission
      let tests = testCases;
      if (!tests && challenge.test_cases) {
        tests = Array.isArray(challenge.test_cases) 
          ? challenge.test_cases 
          : JSON.parse(challenge.test_cases);
      }

      // Basic validation structure
      const validation = {
        isValid: false,
        passedTests: 0,
        totalTests: tests ? tests.length : 0,
        score: 0,
        feedback: [],
      };

      // TODO: Implement actual code execution and testing
      // For now, this is a placeholder that would need a sandboxed execution environment
      console.log('⚠️  Validation requires code execution environment');

      // Use AI to provide code review feedback
      if (code) {
        try {
          const feedback = await aiService.generateFeedback(
            null,
            code,
            {
              title: challenge.title,
              instructions: challenge.instructions,
            }
          );
          validation.feedback.push(feedback);
        } catch (feedbackError) {
          console.error('Failed to generate AI feedback:', feedbackError);
        }
      }

      return validation;
    } catch (error) {
      console.error('Validate completion error:', error);
      throw new Error(`Failed to validate completion: ${error.message}`);
    }
  },

  // Calculate challenge difficulty score
  calculateDifficulty: (challenge) => {
    try {
      const {
        difficulty_level,
        estimated_time_minutes,
        prerequisites,
        test_cases,
      } = challenge;

      // Base difficulty score
      const difficultyMap = {
        easy: 1,
        medium: 2,
        hard: 3,
        expert: 4,
      };

      let score = difficultyMap[difficulty_level] || 2;

      // Adjust based on time estimate
      if (estimated_time_minutes) {
        if (estimated_time_minutes > 120) score += 1;
        else if (estimated_time_minutes > 60) score += 0.5;
      }

      // Adjust based on prerequisites
      if (prerequisites && prerequisites.length > 3) {
        score += 0.5;
      }

      // Adjust based on test cases
      if (test_cases && test_cases.length > 5) {
        score += 0.5;
      }

      // Normalize to 1-5 scale
      return Math.min(5, Math.max(1, Math.round(score)));
    } catch (error) {
      console.error('Calculate difficulty error:', error);
      return 2; // Default to medium
    }
  },

  // Generate multiple AI challenges with variety
  generateBulkChallenges: async (options = {}) => {
    try {
      const {
        count = 5,
        categories = ['programming', 'algorithms', 'data-structures'],
        difficulties = ['easy', 'medium', 'hard'],
        userId = null,
      } = options;

      const challenges = [];

      for (let i = 0; i < count; i++) {
        const category = categories[i % categories.length];
        const difficulty = difficulties[i % difficulties.length];

        try {
          const challenge = await aiService.generateChallenge({
            category,
            difficulty,
            topic: null,
            userId,
          });

          challenges.push(challenge);

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to generate challenge ${i + 1}:`, error);
          // Continue with other challenges
        }
      }

      return challenges;
    } catch (error) {
      console.error('Generate bulk challenges error:', error);
      throw new Error(`Failed to generate bulk challenges: ${error.message}`);
    }
  },

  // Save AI-generated challenge to database
  saveAIChallenge: async (challengeData, userId = null) => {
    try {
      const {
        title,
        description,
        instructions,
        category,
        difficulty_level,
        estimated_time_minutes,
        points_reward,
        max_attempts,
        tags,
        prerequisites,
        learning_objectives,
        starter_code,
        test_cases,
        solution_approach,
      } = challengeData;

      const result = await db.query(
        `INSERT INTO challenges 
        (title, description, instructions, category, difficulty_level, 
         estimated_time_minutes, points_reward, max_attempts, is_active, 
         created_by, tags, prerequisites, learning_objectives, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) 
        RETURNING *`,
        [
          title,
          description,
          instructions,
          category,
          difficulty_level,
          estimated_time_minutes,
          points_reward,
          max_attempts || 3,
          true, // is_active
          userId,
          tags || [],
          prerequisites || [],
          learning_objectives || [],
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Save AI challenge error:', error);
      throw new Error(`Failed to save AI challenge: ${error.message}`);
    }
  },
};

module.exports = challengeService;
