/**
 * AI Service Snapshot Tests (Story 3.7)
 * 
 * These tests ensure AI responses remain consistent across changes.
 * Snapshots capture the structure and format of AI-generated content.
 * 
 * Note: Since AI responses can vary, we focus on testing the structure
 * and format rather than exact content matching.
 */

// Mock axios to prevent actual API calls
jest.mock('axios');
const axios = require('axios');

// Mock database connection module to prevent DB connection attempts
jest.mock('../../src/database/connection', () => ({
  query: jest.fn(),
}));

const aiService = require('../../src/services/aiService');

describe('AI Service - Snapshot Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateChallenge', () => {
    it('should generate challenge with consistent structure for easy difficulty', async () => {
      // Mock Cohere API response
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
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
          })
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'JavaScript basics',
        difficulty: 'easy',
        category: 'JavaScript'
      });

      // Snapshot the structure
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

      // Verify structure requirements
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('difficulty');
      expect(result.difficulty).toBe('easy');
      expect(Array.isArray(result.skills)).toBe(true);
    });

    it('should generate challenge with consistent structure for medium difficulty', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            title: 'Build a Todo List Manager',
            instructions: 'Create a class that manages a list of todo items with CRUD operations.',
            category: 'JavaScript',
            difficulty: 'medium',
            points: 25,
            estimatedTime: 45,
            skills: ['OOP', 'Classes', 'CRUD'],
            testCases: [
              { input: 'addTodo("Task 1")', expected: 'Todo added' },
              { input: 'getTodos()', expected: '["Task 1"]' }
            ]
          })
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
        category: expect.any(String),
        difficulty: 'medium',
        points: expect.any(Number),
        estimatedTime: expect.any(Number),
        skills: expect.any(Array),
        testCases: expect.any(Array)
      });

      expect(result.difficulty).toBe('medium');
      expect(result.points).toBeGreaterThan(15);
    });

    it('should generate challenge with consistent structure for hard difficulty', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            title: 'Implement a Binary Search Tree',
            instructions: 'Build a complete BST with insertion, deletion, and traversal methods.',
            category: 'Data Structures',
            difficulty: 'hard',
            points: 50,
            estimatedTime: 90,
            skills: ['Trees', 'Recursion', 'Algorithms'],
            testCases: [
              { input: 'insert(5)', expected: 'Node inserted' },
              { input: 'search(5)', expected: 'true' }
            ]
          })
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'Binary Search Trees',
        difficulty: 'hard',
        category: 'Data Structures'
      });

      expect(result).toMatchSnapshot({
        title: expect.any(String),
        instructions: expect.any(String),
        category: expect.any(String),
        difficulty: 'hard',
        points: expect.any(Number),
        estimatedTime: expect.any(Number),
        skills: expect.any(Array),
        testCases: expect.any(Array)
      });

      expect(result.difficulty).toBe('hard');
      expect(result.points).toBeGreaterThan(30);
    });
  });

  describe('generateFeedback', () => {
    it('should generate feedback with consistent structure', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            overall_assessment: 'Your code demonstrates a solid understanding of the fundamentals.',
            code_quality_score: 85,
            meets_requirements: true,
            strengths: [
              'Clear variable names',
              'Good code structure',
              'Proper error handling'
            ],
            areas_for_improvement: [
              'Could add more comments',
              'Consider edge cases',
              'Optimize the algorithm'
            ],
            specific_suggestions: [
              'Add input validation for null values',
              'Use const instead of let where possible',
              'Consider using async/await for promises'
            ],
            next_steps: [
              'Test with larger datasets',
              'Add unit tests',
              'Refactor for better performance'
            ]
          })
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

      // Verify structure requirements
      expect(result).toHaveProperty('overall_assessment');
      expect(result).toHaveProperty('code_quality_score');
      expect(result.code_quality_score).toBeGreaterThanOrEqual(0);
      expect(result.code_quality_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.areas_for_improvement)).toBe(true);
    });

    it('should generate feedback for poor quality code', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            overall_assessment: 'The code needs significant improvement in several areas.',
            code_quality_score: 45,
            meets_requirements: false,
            strengths: [
              'Basic structure is present'
            ],
            areas_for_improvement: [
              'Lacks error handling',
              'Poor variable naming',
              'Missing input validation',
              'No documentation'
            ],
            specific_suggestions: [
              'Add try-catch blocks',
              'Use descriptive variable names',
              'Validate inputs before processing',
              'Add JSDoc comments'
            ],
            next_steps: [
              'Review code quality best practices',
              'Add comprehensive error handling',
              'Refactor variable names'
            ]
          })
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
        meets_requirements: false,
        strengths: expect.any(Array),
        areas_for_improvement: expect.any(Array),
        specific_suggestions: expect.any(Array),
        next_steps: expect.any(Array)
      });

      expect(result.meets_requirements).toBe(false);
      expect(result.code_quality_score).toBeLessThan(60);
    });
  });

  describe('generateHints', () => {
    it('should generate hints with consistent structure', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            hints: [
              'Start by defining the function signature',
              'Consider what data structure to use',
              'Think about edge cases like empty inputs',
              'Break the problem into smaller steps'
            ]
          })
        }
      });

      const result = await aiService.generateHints(1, {
        title: 'Array Manipulation',
        instructions: 'Sort an array without using built-in sort'
      });

      expect(result).toMatchSnapshot({
        hints: expect.arrayContaining([expect.any(String)])
      });

      expect(Array.isArray(result.hints)).toBe(true);
      expect(result.hints.length).toBeGreaterThan(0);
    });
  });

  describe('analyzePattern', () => {
    it('should analyze learning patterns with consistent structure', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            patterns: [
              'Strong in basic concepts',
              'Needs work on advanced algorithms',
              'Consistent progress over time'
            ],
            strengths: ['Problem-solving', 'Code organization'],
            weaknesses: ['Algorithm optimization', 'Time complexity'],
            recommendations: [
              'Focus on algorithm complexity analysis',
              'Practice more advanced data structures',
              'Review Big O notation'
            ]
          })
        }
      });

      const result = await aiService.analyzePattern(1, [
        { challenge: 'Calculator', score: 90 },
        { challenge: 'Todo List', score: 85 },
        { challenge: 'Binary Search', score: 60 }
      ]);

      expect(result).toMatchSnapshot({
        patterns: expect.any(Array),
        strengths: expect.any(Array),
        weaknesses: expect.any(Array),
        recommendations: expect.any(Array)
      });

      expect(Array.isArray(result.patterns)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('suggestNextChallenges', () => {
    it('should suggest challenges with consistent structure', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            suggestions: [
              {
                title: 'Linked List Implementation',
                reason: 'Build on your array manipulation skills',
                difficulty: 'medium',
                category: 'Data Structures'
              },
              {
                title: 'Hash Table Basics',
                reason: 'Learn efficient data lookup',
                difficulty: 'medium',
                category: 'Data Structures'
              }
            ]
          })
        }
      });

      const result = await aiService.suggestNextChallenges(1, {
        completedChallenges: ['Array Sorting', 'String Manipulation'],
        skills: ['Arrays', 'Strings'],
        difficulty: 'medium'
      });

      expect(result).toMatchSnapshot({
        suggestions: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            reason: expect.any(String),
            difficulty: expect.any(String),
            category: expect.any(String)
          })
        ])
      });

      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        aiService.generateChallenge({
          topic: 'Test',
          difficulty: 'easy'
        })
      ).rejects.toThrow();
    });

    it('should handle invalid JSON responses', async () => {
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

  describe('Response Format Validation', () => {
    it('should validate challenge response has all required fields', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            title: 'Test Challenge',
            instructions: 'Test instructions',
            category: 'JavaScript',
            difficulty: 'easy',
            points: 10
          })
        }
      });

      const result = await aiService.generateChallenge({
        topic: 'Test',
        difficulty: 'easy'
      });

      // Required fields
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('difficulty');
      expect(typeof result.title).toBe('string');
      expect(typeof result.instructions).toBe('string');
    });

    it('should validate feedback response has all required fields', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          text: JSON.stringify({
            overall_assessment: 'Good work',
            code_quality_score: 80,
            meets_requirements: true,
            strengths: ['Clean code'],
            areas_for_improvement: ['Add tests']
          })
        }
      });

      const result = await aiService.generateFeedback(
        1,
        'code',
        { title: 'Test', instructions: 'Test' }
      );

      // Required fields
      expect(result).toHaveProperty('overall_assessment');
      expect(result).toHaveProperty('code_quality_score');
      expect(typeof result.overall_assessment).toBe('string');
      expect(typeof result.code_quality_score).toBe('number');
    });
  });
});
