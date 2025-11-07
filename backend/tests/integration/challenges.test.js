// Challenges API integration tests
const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/database/connection');

describe('Challenges API Integration Tests', () => {
  let authToken;
  let userId;
  let testGoalId;
  let testChallengeId;

  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM challenges WHERE id IN (SELECT id FROM challenges WHERE title LIKE $1)', ['Challenge Test%']);
    await pool.query('DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['challengetest%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['challengetest%@example.com']);
    
    // Register and authenticate test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Challenge',
        lastName: 'Tester',
        email: 'challengetest@example.com',
        password: 'TestPass123'
      });
    
    authToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    // Create a test goal for challenges
    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Goal for Challenges',
        type: 'skill',
        target_value: 100
      });
    
    testGoalId = goalRes.body.data.id;
  });

  afterAll(async () => {
    // Clean up after all tests
    await pool.query('DELETE FROM challenges WHERE title LIKE $1', ['Challenge Test%']);
    await pool.query('DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['challengetest%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['challengetest%@example.com']);
  });

  describe('GET /api/challenges', () => {
    beforeEach(async () => {
      // Create test challenges
      await pool.query(
        `INSERT INTO challenges (title, description, difficulty_level, category, instructions, points_reward, goal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Challenge Test 1', 'Description 1', 'beginner', 'react', 'Do something', 10, testGoalId]
      );
      
      await pool.query(
        `INSERT INTO challenges (title, description, difficulty_level, category, instructions, points_reward, goal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Challenge Test 2', 'Description 2', 'intermediate', 'javascript', 'Do something else', 20, testGoalId]
      );
    });

    test('should return all available challenges', async () => {
      const response = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter challenges by difficulty', async () => {
      const response = await request(app)
        .get('/api/challenges?difficulty=beginner')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.difficulty_level === 'beginner')).toBe(true);
    });

    test('should filter challenges by category', async () => {
      const response = await request(app)
        .get('/api/challenges?category=react')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.category === 'react')).toBe(true);
    });

    test('should filter challenges by goal', async () => {
      const response = await request(app)
        .get(`/api/challenges?goalId=${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.goal_id === testGoalId)).toBe(true);
    });
  });

  describe('GET /api/challenges/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO challenges (title, description, difficulty_level, category, instructions, points_reward, goal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['Challenge Test Specific', 'Detailed description', 'advanced', 'node', 'Step by step', 30, testGoalId]
      );
      
      testChallengeId = result.rows[0].id;
    });

    test('should return specific challenge by ID', async () => {
      const response = await request(app)
        .get(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testChallengeId);
      expect(response.body.data.title).toBe('Challenge Test Specific');
      expect(response.body.data.difficulty_level).toBe('advanced');
      expect(response.body.data.points_reward).toBe(30);
    });

    test('should return 404 for non-existent challenge', async () => {
      await request(app)
        .get('/api/challenges/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/challenges', () => {
    test('should create new challenge successfully', async () => {
      const newChallenge = {
        title: 'Challenge Test Create',
        description: 'A new challenge to test creation',
        difficulty_level: 'intermediate',
        category: 'react',
        instructions: 'Follow these steps...',
        points_reward: 25,
        estimated_time_minutes: 60,
        goal_id: testGoalId
      };

      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newChallenge)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newChallenge.title);
      expect(response.body.data.difficulty_level).toBe(newChallenge.difficulty_level);
      expect(response.body.data.category).toBe(newChallenge.category);
      expect(response.body.data.goal_id).toBe(testGoalId);

      testChallengeId = response.body.data.id;
    });

    test('should reject challenge without required fields', async () => {
      const invalidChallenge = {
        title: 'Incomplete Challenge'
        // Missing required fields
      };

      await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidChallenge)
        .expect(400);
    });

    test('should reject challenge with invalid difficulty level', async () => {
      const invalidChallenge = {
        title: 'Invalid Difficulty',
        description: 'Test',
        difficulty_level: 'super_hard', // Invalid
        category: 'react',
        instructions: 'Test',
        points_reward: 10
      };

      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidChallenge)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/challenges/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO challenges (title, description, difficulty_level, category, instructions, points_reward, goal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['Challenge Test Update', 'Original description', 'beginner', 'javascript', 'Original instructions', 15, testGoalId]
      );
      
      testChallengeId = result.rows[0].id;
    });

    test('should update challenge successfully', async () => {
      const updates = {
        title: 'Challenge Test Updated',
        description: 'Updated description',
        difficulty_level: 'intermediate'
      };

      const response = await request(app)
        .put(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.difficulty_level).toBe(updates.difficulty_level);
    });

    test('should return 404 when updating non-existent challenge', async () => {
      await request(app)
        .put('/api/challenges/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/challenges/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO challenges (title, description, difficulty_level, category, instructions, points_reward, goal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['Challenge Test Delete', 'To be deleted', 'beginner', 'react', 'Instructions', 10, testGoalId]
      );
      
      testChallengeId = result.rows[0].id;
    });

    test('should delete challenge successfully', async () => {
      await request(app)
        .delete(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify challenge is deleted
      await request(app)
        .get(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent challenge', async () => {
      await request(app)
        .delete('/api/challenges/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Complete Workflow: Create Goal → Add Challenge → Submit → Verify Progress', () => {
    test('should complete full workflow and update goal progress dynamically', async () => {
      // 1. Create a fresh goal
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Workflow Goal',
          description: 'Goal to test complete workflow',
          type: 'skill',
          target_value: 100
        })
        .expect(201);

      const workflowGoalId = goalRes.body.data.id;
      expect(goalRes.body.data.progress).toBe(0); // Initial progress should be 0

      // 2. Add a challenge to this goal
      const challengeRes = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Workflow Challenge',
          description: 'Test challenge for workflow',
          difficulty_level: 'intermediate',
          category: 'javascript',
          instructions: 'Complete this challenge',
          points_reward: 50,
          goal_id: workflowGoalId
        })
        .expect(201);

      const workflowChallengeId = challengeRes.body.data.id;

      // 3. Submit work for the challenge
      const submissionRes = await request(app)
        .post(`/api/challenges/${workflowChallengeId}/submissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          submission_text: 'This is my solution to the challenge. It includes detailed implementation and explanations.'
        })
        .expect(201);

      const submissionId = submissionRes.body.data.id;
      expect(submissionRes.body.data.status).toBe('pending');

      // 4. Mark submission as completed (simulating grading/review)
      await request(app)
        .put(`/api/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          score: 85
        })
        .expect(200);

      // 5. Verify goal progress was updated automatically
      const updatedGoalRes = await request(app)
        .get(`/api/goals/${workflowGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Progress should be > 0 now that a challenge is completed
      expect(updatedGoalRes.body.data.progress).toBeGreaterThan(0);
      
      // If 1 out of 1 challenge is completed, progress should be 100
      expect(updatedGoalRes.body.data.progress).toBe(100);
    });

    test('should calculate partial progress correctly with multiple challenges', async () => {
      // 1. Create goal
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Multi-Challenge Goal',
          type: 'skill'
        });

      const multiGoalId = goalRes.body.data.id;

      // 2. Add 3 challenges
      const challenge1 = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Multi 1',
          description: 'First challenge',
          difficulty_level: 'beginner',
          category: 'react',
          instructions: 'Do task 1',
          points_reward: 10,
          goal_id: multiGoalId
        });

      const challenge2 = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Multi 2',
          description: 'Second challenge',
          difficulty_level: 'intermediate',
          category: 'react',
          instructions: 'Do task 2',
          points_reward: 20,
          goal_id: multiGoalId
        });

      const challenge3 = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge Test Multi 3',
          description: 'Third challenge',
          difficulty_level: 'advanced',
          category: 'react',
          instructions: 'Do task 3',
          points_reward: 30,
          goal_id: multiGoalId
        });

      // 3. Complete only 1 out of 3 challenges
      const sub1 = await request(app)
        .post(`/api/challenges/${challenge1.body.data.id}/submissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ submission_text: 'Solution 1' });

      await request(app)
        .put(`/api/submissions/${sub1.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed', score: 90 });

      // 4. Check progress (should be ~33% for 1/3 completed)
      const progressRes = await request(app)
        .get(`/api/goals/${multiGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(progressRes.body.data.progress).toBeCloseTo(33.33, 1);

      // 5. Complete second challenge
      const sub2 = await request(app)
        .post(`/api/challenges/${challenge2.body.data.id}/submissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ submission_text: 'Solution 2' });

      await request(app)
        .put(`/api/submissions/${sub2.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed', score: 85 });

      // 6. Progress should now be ~67% (2/3)
      const finalProgressRes = await request(app)
        .get(`/api/goals/${multiGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalProgressRes.body.data.progress).toBeCloseTo(66.67, 1);
    });
  });
});

module.exports = {};