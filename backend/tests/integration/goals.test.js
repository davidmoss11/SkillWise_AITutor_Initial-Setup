const request = require('supertest');
const app = require('../../src/app');
const { testPool, clearTestData, clearGoalsAndChallenges } = require('../setup');
const bcrypt = require('bcryptjs');

describe('Goals API Integration - Story 2.7 Testing', () => {
  let authToken;
  let testUserId;
  let testGoalId;

  beforeAll(async () => {
    // Clear ALL test data including users
    await clearTestData();

    // Create a test user
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    const userResult = await testPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      ['goals.test@skillwise.com', hashedPassword, 'Goals', 'Tester', 'student']
    );
    testUserId = userResult.rows[0].id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'goals.test@skillwise.com',
        password: 'Test123!'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('POST /api/goals - Create Goal', () => {
    test('should create a new goal with all fields', async () => {
      const newGoal = {
        title: 'Learn JavaScript',
        description: 'Master modern JavaScript ES6+',
        category: 'Programming',
        target_date: '2024-12-31',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGoal);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newGoal.title);
      expect(response.body.description).toBe(newGoal.description);
      expect(response.body.category).toBe(newGoal.category);
      expect(response.body.priority).toBe(newGoal.priority);
      expect(response.body.status).toBe('active');
      expect(response.body.progress).toBe(0);
      expect(response.body.user_id).toBe(testUserId);

      testGoalId = response.body.id;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/goals')
        .send({
          title: 'Unauthorized Goal',
          description: 'Should fail'
        });

      expect(response.status).toBe(401);
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/goals - Retrieve Goals', () => {
    test('should return all user goals', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('progress');
    });

    test('should filter goals by status', async () => {
      const response = await request(app)
        .get('/api/goals?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(goal => {
        expect(goal.status).toBe('active');
      });
    });

    test('should fail without authentication', async () => {
      const response = await request(app).get('/api/goals');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals/:id - Get Single Goal', () => {
    test('should return a specific goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testGoalId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('progress');
    });

    test('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/goals/:id - Update Goal', () => {
    test('should update goal fields', async () => {
      const updates = {
        title: 'Master JavaScript',
        description: 'Advanced JavaScript concepts',
        priority: 'medium',
        progress: 25
      };

      const response = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.description).toBe(updates.description);
      expect(response.body.priority).toBe(updates.priority);
      expect(response.body.progress).toBe(updates.progress);
    });

    test('should mark goal as completed when progress is 100', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 100 });

      expect(response.status).toBe(200);
      expect(response.body.progress).toBe(100);
      expect(response.body.status).toBe('completed');
      expect(response.body.completed_at).toBeTruthy();
    });

    test('should fail to update another user\'s goal', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      await testPool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['other.user@skillwise.com', hashedPassword, 'Other', 'User', 'student']
      );

      // Login as other user
      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other.user@skillwise.com',
          password: 'Test123!'
        });

      const otherToken = otherLoginResponse.body.token;

      // Try to update first user's goal
      const response = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Goal' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/goals/:id - Delete Goal', () => {
    let deleteTestGoalId;

    beforeEach(async () => {
      // Create a goal to delete
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal to Delete',
          description: 'Will be deleted',
          category: 'Test'
        });
      deleteTestGoalId = response.body.id;
    });

    test('should delete a goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${deleteTestGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/goals/${deleteTestGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Goal Workflow - Complete Flow', () => {
    test('should complete full goal lifecycle: create → update → complete', async () => {
      // 1. Create goal
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Full Workflow Test',
          description: 'Testing complete lifecycle',
          category: 'Testing',
          priority: 'high'
        });

      expect(createResponse.status).toBe(201);
      const goalId = createResponse.body.id;
      expect(createResponse.body.progress).toBe(0);
      expect(createResponse.body.status).toBe('active');

      // 2. Update progress to 50%
      const updateResponse = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 50 });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.progress).toBe(50);
      expect(updateResponse.body.status).toBe('active');

      // 3. Mark as complete
      const completeResponse = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 100 });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.progress).toBe(100);
      expect(completeResponse.body.status).toBe('completed');
      expect(completeResponse.body.completed_at).toBeTruthy();

      // 4. Verify completion persisted
      const getResponse = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.status).toBe('completed');
      expect(getResponse.body.progress).toBe(100);
    });
  });
});

module.exports = {};