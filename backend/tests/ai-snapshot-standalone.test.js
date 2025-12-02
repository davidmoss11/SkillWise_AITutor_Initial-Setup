/**
 * AI Service Snapshot Tests - Standalone (Story 3.7)
 * 
 * These tests ensure AI responses remain consistent across changes.
 * Snapshots capture the structure and format of AI-generated content.
 * 
 * Run with: npm test -- --testPathPattern=ai-snapshot-standalone
 */

// Mock environment variables before requiring anything else
process.env.COHERE_API_KEY = 'test-key';
process.env.COHERE_MODEL = 'command-a-03-2025';

// Mock axios to prevent actual API calls
jest.mock('axios', () => ({
  post: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
  })),
}));

// Mock database connection module
jest.mock('../src/database/connection', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  end: jest.fn(),
}));

const axios = require('axios');
const aiService = require('../src/services/aiService');

describe('AI Service - Snapshot Tests (Standalone)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateChallenge', () => {
    it('should match snapshot for easy challenge structure', async () => {
      const mockResponse = {
        title: 'Create a Simple Calculator',
        instructions: 'Build a calculator function that can add and subtract two numbers.',
        category: 'JavaScript',
        difficulty: 'easy',
        points: 10,
        estimatedTime: 15,
        skills: ['Functions', 'Arithmetic'],
        testCases: [
          { input: 'add(2, 3)', expected: '5' },
          { input: 'subtract(5, 2)', expected: '3' }
        ]
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockResponse)
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'JavaScript basics',
        difficulty: 'easy',
        category: 'JavaScript'
      });

      // Snapshot with property matchers for flexibility
      expect(result).toMatchSnapshot({
        title: expect.any(String),
        instructions: expect.any(String),
        category: expect.any(String),
        difficulty: 'easy',
        points: expect.any(Number),
        estimatedTime: expect.any(Number),
        skills: expect.any(Array),
        testCases: expect.any(Array)
      });

      // Verify structure
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('instructions');
      expect(result.difficulty).toBe('easy');
    });

    it('should match snapshot for medium challenge structure', async () => {
      const mockResponse = {
        title: 'Build a Todo List Manager',
        instructions: 'Create a class that manages a list of todo items with CRUD operations.',
        category: 'JavaScript',
        difficulty: 'medium',
        points: 25,
        estimatedTime: 45,
        skills: ['OOP', 'Classes', 'CRUD'],
        testCases: []
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockResponse)
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'Object-Oriented Programming',
        difficulty: 'medium',
        category: 'JavaScript'
      });

      expect(result).toMatchSnapshot({
        title: expect.any(String),
        instructions: expect.any(String),
        difficulty: 'medium',
        points: expect.any(Number)
      });
    });
  });

  describe('generateFeedback', () => {
    it('should match snapshot for feedback structure', async () => {
      const mockFeedback = {
        overall_assessment: 'Your code demonstrates a solid understanding of the fundamentals.',
        code_quality_score: 85,
        meets_requirements: true,
        strengths: [
          'Clear variable names',
          'Good code structure'
        ],
        areas_for_improvement: [
          'Could add more comments',
          'Consider edge cases'
        ],
        specific_suggestions: [
          'Add input validation',
          'Use const instead of let'
        ],
        next_steps: [
          'Test with larger datasets',
          'Add unit tests'
        ]
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockFeedback)
        }
      });

      const result = await aiService.generateFeedback(
        1,
        'function add(a, b) { return a + b; }',
        { title: 'Calculator', instructions: 'Create an add function' }
      );

      expect(result).toMatchSnapshot({
        overall_assessment: expect.any(String),
        code_quality_score: expect.any(Number),
        meets_requirements: expect.any(Boolean),
        strengths: expect.any(Array),
        areas_for_improvement: expect.any(Array),
        specific_suggestions: expect.any(Array),
        next_steps: expect.any(Array)
      });

      // Validate structure
      expect(result.code_quality_score).toBeGreaterThanOrEqual(0);
      expect(result.code_quality_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.strengths)).toBe(true);
    });

    it('should match snapshot for low-quality code feedback', async () => {
      const mockFeedback = {
        overall_assessment: 'The code needs significant improvement.',
        code_quality_score: 45,
        meets_requirements: false,
        strengths: ['Basic structure is present'],
        areas_for_improvement: [
          'Lacks error handling',
          'Poor variable naming'
        ],
        specific_suggestions: [
          'Add try-catch blocks',
          'Use descriptive names'
        ],
        next_steps: [
          'Review best practices'
        ]
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockFeedback)
        }
      });

      const result = await aiService.generateFeedback(
        2,
        'function x(a,b){return a+b}',
        { title: 'Calculator', instructions: 'Create a calculator' }
      );

      expect(result).toMatchSnapshot({
        overall_assessment: expect.any(String),
        code_quality_score: expect.any(Number),
        meets_requirements: false
      });

      expect(result.meets_requirements).toBe(false);
      expect(result.code_quality_score).toBeLessThan(60);
    });
  });

  describe('Response Format Validation', () => {
    it('validates all required challenge fields are present', async () => {
      const mockChallenge = {
        title: 'Test Challenge',
        instructions: 'Test instructions',
        category: 'JavaScript',
        difficulty: 'easy',
        points: 10
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockChallenge)
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'Test',
        difficulty: 'easy'
      });

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('difficulty');
      expect(typeof result.title).toBe('string');
      expect(typeof result.instructions).toBe('string');
    });

    it('validates all required feedback fields are present', async () => {
      const mockFeedback = {
        overall_assessment: 'Good work',
        code_quality_score: 80,
        meets_requirements: true,
        strengths: ['Clean code'],
        areas_for_improvement: ['Add tests']
      };

      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify(mockFeedback)
        }
      });

      const result = await aiService.generateFeedback(
        1,
        'code',
        { title: 'Test', instructions: 'Test' }
      );

      expect(result).toHaveProperty('overall_assessment');
      expect(result).toHaveProperty('code_quality_score');
      expect(typeof result.overall_assessment).toBe('string');
      expect(typeof result.code_quality_score).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        aiService.generateChallenge({
          topic: 'Test',
          difficulty: 'easy'
        })
      ).rejects.toThrow();
    });

    it('handles invalid JSON responses', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: 'Invalid JSON {'
        }
      });

      await expect(
        aiService.generateChallenge({
          topic: 'Test',
          difficulty: 'easy'
        })
      ).rejects.toThrow();
    });
  });
});
