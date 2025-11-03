// Challenge business logic
const Challenge = require('../models/Challenge');
const { z } = require('zod');

// Validation schemas
const createChallengeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.string().min(1, 'Category is required'),
  points: z.number().positive().default(10),
  estimated_time: z.number().positive().optional(),
  tags: z.array(z.string()).optional()
});

const challengeService = {
  // Get challenges with filtering
  getChallenges: async (filters = {}) => {
    try {
      let challenges;
      
      if (filters.difficulty) {
        challenges = await Challenge.findByDifficulty(filters.difficulty);
      } else {
        challenges = await Challenge.findAll();
      }

      // Apply additional filters
      if (filters.category) {
        challenges = challenges.filter(c => 
          c.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        challenges = challenges.filter(c =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        );
      }

      return challenges;
    } catch (error) {
      throw new Error(`Failed to get challenges: ${error.message}`);
    }
  },

  // Get challenge by ID
  getChallengeById: async (challengeId) => {
    try {
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      return challenge;
    } catch (error) {
      throw new Error(`Failed to get challenge: ${error.message}`);
    }
  },

  // Create new challenge (admin only)
  createChallenge: async (challengeData) => {
    try {
      const validatedData = createChallengeSchema.parse(challengeData);
      const newChallenge = await Challenge.create(validatedData);
      return newChallenge;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
  },

  // Update challenge
  updateChallenge: async (challengeId, updateData) => {
    try {
      const existingChallenge = await challengeService.getChallengeById(challengeId);
      const updatedChallenge = await Challenge.update(challengeId, updateData);
      return updatedChallenge;
    } catch (error) {
      throw new Error(`Failed to update challenge: ${error.message}`);
    }
  },

  // Delete challenge
  deleteChallenge: async (challengeId) => {
    try {
      await challengeService.getChallengeById(challengeId);
      const deletedChallenge = await Challenge.delete(challengeId);
      return deletedChallenge;
    } catch (error) {
      throw new Error(`Failed to delete challenge: ${error.message}`);
    }
  },

  // Get available categories
  getCategories: async () => {
    try {
      const categories = await Challenge.getCategories();
      return categories.length > 0 ? categories : [
        'Programming',
        'Web Development',
        'Mobile Development', 
        'Data Science',
        'DevOps',
        'Design',
        'Database'
      ];
    } catch (error) {
      // Return default categories if database query fails
      return [
        'Programming',
        'Web Development',
        'Mobile Development',
        'Data Science', 
        'DevOps',
        'Design',
        'Database'
      ];
    }
  },

  // Generate personalized challenges based on user progress
  generatePersonalizedChallenges: async (userId) => {
    try {
      // For now, return all challenges
      // TODO: Implement ML-based personalization later
      const challenges = await Challenge.findAll();
      return challenges.slice(0, 5); // Return top 5
    } catch (error) {
      throw new Error(`Failed to generate personalized challenges: ${error.message}`);
    }
  },

  // Validate challenge completion
  validateCompletion: async (challengeId, submissionData) => {
    try {
      const challenge = await challengeService.getChallengeById(challengeId);
      
      // Basic validation - check if submission has required fields
      const isValid = submissionData.submission_text && 
                     submissionData.submission_text.length > 10;
      
      const score = isValid ? Math.floor(Math.random() * 41) + 60 : 0; // 60-100 if valid
      
      return {
        isValid,
        score,
        feedback: isValid ? 'Good work!' : 'Submission needs more detail'
      };
    } catch (error) {
      throw new Error(`Failed to validate completion: ${error.message}`);
    }
  },

  // Calculate challenge difficulty
  calculateDifficulty: (challenge) => {
    if (!challenge) return 'medium';
    return challenge.difficulty || 'medium';
  }
};

module.exports = challengeService;