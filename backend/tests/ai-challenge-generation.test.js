/**
 * AI Challenge Generation Tests
 *
 * Tests for Hugging Face integration and challenge generation
 */

const aiService = require('../src/services/aiService');
const challengeService = require('../src/services/challengeService');

// Mock database connection
jest.mock('../src/database/connection', () => ({
  query: jest.fn(),
}));

describe('AI Challenge Generation', () => {
  describe('aiService.generateChallenge', () => {
    it('should generate a challenge with valid structure', async () => {
      // Note: This test requires a valid HUGGINGFACE_API_KEY
      // Skip in CI/CD or when API key is not available
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.log('Skipping test: HUGGINGFACE_API_KEY not set');
        return;
      }

      const challenge = await aiService.generateChallenge({
        category: 'programming',
        difficulty: 'easy',
        topic: 'arrays',
      });

      expect(challenge).toBeDefined();
      expect(challenge.title).toBeDefined();
      expect(challenge.description).toBeDefined();
      expect(challenge.instructions).toBeDefined();
      expect(challenge.difficulty_level).toBe('easy');
      expect(challenge.category).toBe('programming');
    }, 30000); // 30 second timeout for AI generation

    it('should handle different difficulty levels', async () => {
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.log('Skipping test: HUGGINGFACE_API_KEY not set');
        return;
      }

      const difficulties = ['easy', 'medium', 'hard'];
      
      for (const difficulty of difficulties) {
        const challenge = await aiService.generateChallenge({
          category: 'programming',
          difficulty,
        });

        expect(challenge.difficulty_level).toBe(difficulty);
      }
    }, 90000); // 90 seconds for multiple generations
  });

  describe('challengeService.calculateDifficulty', () => {
    it('should calculate difficulty score for easy challenge', () => {
      const challenge = {
        difficulty_level: 'easy',
        estimated_time_minutes: 15,
        prerequisites: [],
        test_cases: [1, 2],
      };

      const score = challengeService.calculateDifficulty(challenge);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(2);
    });

    it('should calculate difficulty score for expert challenge', () => {
      const challenge = {
        difficulty_level: 'expert',
        estimated_time_minutes: 180,
        prerequisites: ['algorithms', 'data structures', 'complexity', 'graphs'],
        test_cases: Array(10).fill({}),
      };

      const score = challengeService.calculateDifficulty(challenge);
      expect(score).toBeGreaterThanOrEqual(4);
      expect(score).toBeLessThanOrEqual(5);
    });

    it('should return default score for invalid input', () => {
      const score = challengeService.calculateDifficulty({});
      expect(score).toBe(2); // Default medium difficulty
    });
  });

  describe('challengeService.getChallenges', () => {
    it('should filter challenges by category', async () => {
      const db = require('../src/database/connection');
      db.query.mockResolvedValue({
        rows: [
          { id: 1, category: 'programming', difficulty_level: 'easy' },
        ],
      });

      const challenges = await challengeService.getChallenges({
        category: 'programming',
      });

      expect(challenges).toHaveLength(1);
      expect(challenges[0].category).toBe('programming');
    });

    it('should filter challenges by difficulty', async () => {
      const db = require('../src/database/connection');
      db.query.mockResolvedValue({
        rows: [
          { id: 1, category: 'programming', difficulty_level: 'hard' },
        ],
      });

      const challenges = await challengeService.getChallenges({
        difficulty: 'hard',
      });

      expect(challenges).toHaveLength(1);
      expect(challenges[0].difficulty_level).toBe('hard');
    });
  });

  describe('Integration Tests', () => {
    it('should generate and validate challenge structure', async () => {
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.log('Skipping test: HUGGINGFACE_API_KEY not set');
        return;
      }

      const challenge = await aiService.generateChallenge({
        category: 'algorithms',
        difficulty: 'medium',
        topic: 'sorting',
      });

      // Validate required fields
      expect(challenge).toHaveProperty('title');
      expect(challenge).toHaveProperty('description');
      expect(challenge).toHaveProperty('instructions');
      expect(challenge).toHaveProperty('category');
      expect(challenge).toHaveProperty('difficulty_level');
      
      // Validate optional fields
      expect(challenge).toHaveProperty('tags');
      expect(Array.isArray(challenge.tags)).toBe(true);
      expect(challenge).toHaveProperty('learning_objectives');
      expect(Array.isArray(challenge.learning_objectives)).toBe(true);
      
      // Calculate difficulty score
      const difficultyScore = challengeService.calculateDifficulty(challenge);
      expect(difficultyScore).toBeGreaterThanOrEqual(1);
      expect(difficultyScore).toBeLessThanOrEqual(5);
    }, 30000);
  });
});

describe('Error Handling', () => {
  it('should handle missing API key gracefully', async () => {
    const originalKey = process.env.HUGGINGFACE_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;

    try {
      await aiService.generateChallenge({
        category: 'programming',
        difficulty: 'easy',
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('Hugging Face');
    } finally {
      process.env.HUGGINGFACE_API_KEY = originalKey;
    }
  });

  it('should handle invalid difficulty level', async () => {
    const challenge = challengeService.calculateDifficulty({
      difficulty_level: 'invalid',
    });
    
    expect(challenge).toBe(2); // Should default to medium
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should complete challenge generation within timeout', async () => {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.log('Skipping test: HUGGINGFACE_API_KEY not set');
      return;
    }

    const startTime = Date.now();
    
    await aiService.generateChallenge({
      category: 'programming',
      difficulty: 'easy',
    });

    const duration = Date.now() - startTime;
    
    // Should complete within 15 seconds
    expect(duration).toBeLessThan(15000);
  }, 20000);
});
