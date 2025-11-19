/**
 * @jest-environment node
 */

// Mock environment variables FIRST
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.OPENAI_MODEL = 'gpt-4';
process.env.OPENAI_MAX_TOKENS = '2000';
process.env.OPENAI_TEMPERATURE = '0.7';

// Mock the OpenAI module before any imports
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }));
});

// NOW we can safely import aiService
const aiService = require('../../src/services/aiService');

describe('AI Service - Snapshot Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('generateChallenge', () => {
    it('should generate a challenge response that matches snapshot', async () => {
      const mockChallenge = {
        title: 'Array Sum Calculator',
        description: 'Write a function that calculates the sum of all numbers in an array.',
        difficulty: 'beginner',
        requirements: [
          'Function should accept an array of numbers',
          'Return the sum of all elements',
          'Handle empty arrays'
        ],
        testCases: [
          { input: [1, 2, 3], output: 6 },
          { input: [], output: 0 },
          { input: [-1, 1], output: 0 }
        ],
        starterCode: 'function sumArray(arr) {\n  // Your code here\n}',
        hints: ['Consider using array methods', 'Think about edge cases'],
        estimatedTime: 15
      };

      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockChallenge)
          }
        }],
        model: 'gpt-4',
        usage: { total_tokens: 350 }
      });

      const result = await aiService.generateChallenge({
        topic: 'Arrays',
        difficulty: 'beginner',
        language: 'JavaScript',
        skillLevel: 'beginner'
      });

      // Snapshot test for challenge structure
      expect(result.challenge).toMatchSnapshot();
      
      // Verify challenge has required fields
      expect(result.challenge).toHaveProperty('title');
      expect(result.challenge).toHaveProperty('description');
      expect(result.challenge).toHaveProperty('difficulty');
      expect(result.challenge).toHaveProperty('requirements');
      expect(result.challenge).toHaveProperty('testCases');
    });

    it('should generate intermediate difficulty challenge that matches snapshot', async () => {
      const mockChallenge = {
        title: 'Binary Search Implementation',
        description: 'Implement a binary search algorithm to find an element in a sorted array.',
        difficulty: 'intermediate',
        requirements: [
          'Implement binary search algorithm',
          'Return index of found element',
          'Return -1 if element not found',
          'Handle edge cases'
        ],
        testCases: [
          { input: [[1, 2, 3, 4, 5], 3], output: 2 },
          { input: [[1, 2, 3, 4, 5], 6], output: -1 }
        ],
        starterCode: 'function binarySearch(arr, target) {\n  // Your code here\n}',
        estimatedTime: 30
      };

      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockChallenge)
          }
        }],
        model: 'gpt-4',
        usage: { total_tokens: 450 }
      });

      const result = await aiService.generateChallenge({
        topic: 'Binary Search',
        difficulty: 'intermediate',
        language: 'JavaScript',
        skillLevel: 'intermediate'
      });

      expect(result.challenge).toMatchSnapshot();
    });
  });

  describe('evaluateSubmission', () => {
    it('should generate feedback response that matches snapshot', async () => {
      const mockFeedback = {
        score: 85,
        passed: true,
        strengths: [
          'Clean and readable code',
          'Proper error handling',
          'Good variable naming'
        ],
        improvements: [
          'Could add more comments',
          'Consider edge case for very large arrays'
        ],
        codeQuality: 'good',
        bestPractices: [
          'Use const/let instead of var',
          'Add JSDoc comments'
        ],
        bugs: [],
        summary: 'Well-written solution with good practices. Minor improvements needed for edge cases.'
      };

      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockFeedback)
          }
        }],
        model: 'gpt-4',
        usage: { total_tokens: 300 }
      });

      const result = await aiService.evaluateSubmission({
        code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        challengeTitle: 'Array Sum',
        requirements: ['Calculate sum of array'],
        language: 'JavaScript'
      });

      // Snapshot test for feedback structure
      expect(result.feedback).toMatchSnapshot();
      
      // Verify feedback has required fields
      expect(result.feedback).toHaveProperty('score');
      expect(result.feedback).toHaveProperty('passed');
      expect(result.feedback).toHaveProperty('strengths');
      expect(result.feedback).toHaveProperty('improvements');
      expect(result.feedback).toHaveProperty('codeQuality');
    });

    it('should generate failing feedback that matches snapshot', async () => {
      const mockFeedback = {
        score: 45,
        passed: false,
        strengths: [
          'Attempted to solve the problem'
        ],
        improvements: [
          'Logic errors in implementation',
          'Missing error handling',
          'Inefficient algorithm'
        ],
        codeQuality: 'poor',
        bestPractices: [
          'Add input validation',
          'Use meaningful variable names',
          'Break down complex logic'
        ],
        bugs: [
          'Infinite loop on empty array',
          'Incorrect return value for negative numbers'
        ],
        summary: 'The solution has several bugs and logic errors. Review the requirements and test cases carefully.'
      };

      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockFeedback)
          }
        }],
        model: 'gpt-4',
        usage: { total_tokens: 350 }
      });

      const result = await aiService.evaluateSubmission({
        code: 'function sum(arr) { let i = 0; while(true) { i++; } }',
        challengeTitle: 'Array Sum',
        requirements: ['Calculate sum correctly'],
        language: 'JavaScript'
      });

      expect(result.feedback).toMatchSnapshot();
    });
  });

  describe('generateHint', () => {
    it('should generate hint response that matches snapshot', async () => {
      const mockHint = {
        hint: 'Think about using the reduce() method to accumulate values. Start with an initial value of 0.',
        difficulty: 'low'
      };

      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockHint)
          }
        }],
        model: 'gpt-3.5-turbo',
        usage: { total_tokens: 150 }
      });

      const result = await aiService.generateHint({
        challengeTitle: 'Array Sum Calculator',
        challengeDescription: 'Calculate the sum of array elements',
        progress: 'Struggling with iteration',
        skillLevel: 'beginner'
      });

      // Snapshot test for hint structure
      expect(result.hint).toMatchSnapshot();
      
      // Verify hint has required fields
      expect(result.hint).toHaveProperty('hint');
      expect(result.hint).toHaveProperty('difficulty');
    });
  });

  describe('Prompt Templates', () => {
    it('should have consistent challenge generation template', () => {
      const template = aiService.PROMPT_TEMPLATES.GENERATE_CHALLENGE;
      
      expect(template).toMatchSnapshot();
      expect(template).toHaveProperty('system');
      expect(template).toHaveProperty('user');
    });

    it('should have consistent evaluation template', () => {
      const template = aiService.PROMPT_TEMPLATES.EVALUATE_SUBMISSION;
      
      expect(template).toMatchSnapshot();
      expect(template).toHaveProperty('system');
      expect(template).toHaveProperty('user');
    });

    it('should have consistent hint template', () => {
      const template = aiService.PROMPT_TEMPLATES.PROVIDE_HINT;
      
      expect(template).toMatchSnapshot();
      expect(template).toHaveProperty('system');
      expect(template).toHaveProperty('user');
    });
  });

  describe('Metadata Consistency', () => {
    it('should include consistent metadata in challenge generation', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({ title: 'Test', description: 'Test', difficulty: 'beginner' })
          }
        }],
        model: 'gpt-4',
        usage: { total_tokens: 250 }
      });

      const result = await aiService.generateChallenge({
        topic: 'Test',
        difficulty: 'beginner'
      });

      expect(result.metadata).toMatchSnapshot({
        timestamp: expect.any(String)
      });
      
      expect(result.metadata).toHaveProperty('model');
      expect(result.metadata).toHaveProperty('tokensUsed');
      expect(result.metadata).toHaveProperty('prompt');
      expect(result.metadata).toHaveProperty('response');
    });
  });
});
