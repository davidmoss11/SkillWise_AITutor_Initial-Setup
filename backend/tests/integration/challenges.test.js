const request = require('supertest');
const app = require('../../src/app');
const { testPool, clearTestData, clearGoalsAndChallenges } = require('../setup');
const bcrypt = require('bcryptjs');

describe('Challenges API Integration - Story 2.7 Testing', () => {
  let authToken;
  let testUserId;
  let testGoalId;
  let testChallengeId;

  beforeAll(async () => {
    // Clear ALL test data including users
    await clearTestData();

    // Create a test user
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    const userResult = await testPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      ['challenges.test@skillwise.com', hashedPassword, 'Challenge', 'Tester', 'student'],
    );
    testUserId = userResult.rows[0].id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'challenges.test@skillwise.com',
        password: 'Test123!',
      });

    authToken = loginResponse.body.token;

    // Create a test goal to link challenges to
    const goalResponse = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Learn React',
        description: 'Master React fundamentals',
        category: 'Programming',
      });

    testGoalId = goalResponse.body.id;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('POST /api/challenges - Create Challenge', () => {
    test('should create a new challenge linked to a goal', async () => {
      const newChallenge = {
        title: 'Build a Todo App',
        description: 'Create a React todo application with CRUD operations',
        category: 'Web Development',
        difficulty: 'intermediate',
        points: 100,
        estimated_time: '4 hours',
        goal_id: testGoalId,
        tags: ['react', 'javascript', 'crud'],
      };

      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newChallenge);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newChallenge.title);
      expect(response.body.description).toBe(newChallenge.description);
      expect(response.body.category).toBe(newChallenge.category);
      expect(response.body.difficulty).toBe(newChallenge.difficulty);
      expect(response.body.points).toBe(newChallenge.points);
      expect(response.body.goal_id).toBe(testGoalId);
      expect(response.body.status).toBe('not_started');
      expect(response.body.is_active).toBe(true);

      testChallengeId = response.body.id;
    });

    test('should create a challenge without goal_id', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Independent Challenge',
          description: 'Not linked to any goal',
          category: 'General',
          difficulty: 'beginner',
        });

      expect(response.status).toBe(201);
      expect(response.body.goal_id).toBeNull();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .send({
          title: 'Unauthorized Challenge',
          description: 'Should fail',
        });

      expect(response.status).toBe(401);
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title and category',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/challenges - Retrieve Challenges', () => {
    test('should return all challenges', async () => {
      const response = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
    });

    test('should filter challenges by goal_id', async () => {
      const response = await request(app)
        .get(`/api/challenges?goal_id=${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(challenge => {
        expect(challenge.goal_id).toBe(testGoalId);
      });
    });

    test('should filter challenges by category', async () => {
      const response = await request(app)
        .get('/api/challenges?category=Web Development')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(challenge => {
        expect(challenge.category).toBe('Web Development');
      });
    });

    test('should filter challenges by difficulty', async () => {
      const response = await request(app)
        .get('/api/challenges?difficulty=intermediate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(challenge => {
        expect(challenge.difficulty).toBe('intermediate');
      });
    });

    test('should search challenges by title', async () => {
      const response = await request(app)
        .get('/api/challenges?search=Todo')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/challenges/:id - Get Single Challenge', () => {
    test('should return a specific challenge', async () => {
      const response = await request(app)
        .get(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testChallengeId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('goal_id');
    });

    test('should return 404 for non-existent challenge', async () => {
      const response = await request(app)
        .get('/api/challenges/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/challenges/:id - Update Challenge', () => {
    test('should update challenge fields', async () => {
      const updates = {
        title: 'Advanced Todo App',
        description: 'Enhanced todo app with authentication',
        difficulty: 'advanced',
        points: 150,
      };

      const response = await request(app)
        .put(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.description).toBe(updates.description);
      expect(response.body.difficulty).toBe(updates.difficulty);
      expect(response.body.points).toBe(updates.points);
    });

    test('should update challenge status to in_progress', async () => {
      const response = await request(app)
        .put(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });

    test('should mark challenge as completed', async () => {
      const response = await request(app)
        .put(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.completed_at).toBeTruthy();
    });
  });

  describe('DELETE /api/challenges/:id - Delete Challenge', () => {
    let deleteTestChallengeId;

    beforeEach(async () => {
      // Create a challenge to delete
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge to Delete',
          description: 'Will be deleted',
          category: 'Test',
          difficulty: 'beginner',
        });
      deleteTestChallengeId = response.body.id;
    });

    test('should delete a challenge', async () => {
      const response = await request(app)
        .delete(`/api/challenges/${deleteTestChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/challenges/${deleteTestChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Challenge Workflow - Complete Flow', () => {
    test('should complete full challenge lifecycle: create → start → complete', async () => {
      // 1. Create challenge
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Workflow Challenge',
          description: 'Testing full lifecycle',
          category: 'Testing',
          difficulty: 'intermediate',
          points: 50,
          goal_id: testGoalId,
        });

      expect(createResponse.status).toBe(201);
      const challengeId = createResponse.body.id;
      expect(createResponse.body.status).toBe('not_started');

      // 2. Start the challenge
      const startResponse = await request(app)
        .put(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' });

      expect(startResponse.status).toBe(200);
      expect(startResponse.body.status).toBe('in_progress');

      // 3. Complete the challenge
      const completeResponse = await request(app)
        .put(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.status).toBe('completed');
      expect(completeResponse.body.completed_at).toBeTruthy();

      // 4. Verify completion persisted
      const getResponse = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.status).toBe('completed');
    });
  });

  describe('Goal-Challenge Integration', () => {
    test('should link challenge to goal and verify relationship', async () => {
      // Create a new goal
      const goalResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Master Node.js',
          description: 'Backend development',
          category: 'Programming',
        });

      const newGoalId = goalResponse.body.id;

      // Create challenge linked to this goal
      const challengeResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Build REST API',
          description: 'Create Express REST API',
          category: 'Backend',
          difficulty: 'intermediate',
          goal_id: newGoalId,
        });

      expect(challengeResponse.status).toBe(201);
      expect(challengeResponse.body.goal_id).toBe(newGoalId);

      // Fetch challenges for this goal
      const listResponse = await request(app)
        .get(`/api/challenges?goal_id=${newGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.length).toBeGreaterThan(0);
      expect(listResponse.body[0].goal_id).toBe(newGoalId);
    });

    test('should cascade delete challenges when goal is deleted', async () => {
      // Create a goal with a challenge
      const goalResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal to Delete',
          description: 'Will be deleted with challenges',
          category: 'Test',
        });

      const goalId = goalResponse.body.id;

      const challengeResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Challenge to Cascade',
          description: 'Will be deleted with goal',
          category: 'Test',
          difficulty: 'beginner',
          goal_id: goalId,
        });

      const challengeId = challengeResponse.body.id;

      // Delete the goal
      await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify challenge is also deleted (cascade)
      const getResponse = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});

module.exports = {};
