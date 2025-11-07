// Goals API integration tests
const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/database/connection');

describe('Goals API Integration Tests', () => {
  let authToken;
  let userId;
  let testGoalId;

  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['goaltest%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['goaltest%@example.com']);
    
    // Register and authenticate test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Goal',
        lastName: 'Tester',
        email: 'goaltest@example.com',
        password: 'TestPass123'
      });
    
    authToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up after all tests
    await pool.query('DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['goaltest%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['goaltest%@example.com']);
  });

  describe('POST /api/goals', () => {
    test('should create new goal successfully', async () => {
      const newGoal = {
        title: 'Master React',
        description: 'Learn React from beginner to advanced',
        type: 'skill',
        target_value: 100,
        current_value: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGoal)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newGoal.title);
      expect(response.body.data.description).toBe(newGoal.description);
      expect(response.body.data.type).toBe(newGoal.type);
      expect(response.body.data.progress).toBe(0);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.user_id).toBe(userId);

      testGoalId = response.body.data.id;
    });

    test('should reject goal creation without authentication', async () => {
      const newGoal = {
        title: 'Test Goal',
        type: 'skill'
      };

      await request(app)
        .post('/api/goals')
        .send(newGoal)
        .expect(401);
    });

    test('should reject goal with invalid type', async () => {
      const invalidGoal = {
        title: 'Invalid Goal',
        type: 'invalid_type'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGoal)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/goals', () => {
    beforeEach(async () => {
      // Create test goals
      await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal 1',
          type: 'skill',
          target_value: 100
        });
      
      await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal 2',
          type: 'project',
          target_value: 100
        });
    });

    test('should return all user goals', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('type');
    });

    test('should filter goals by status', async () => {
      const response = await request(app)
        .get('/api/goals?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(goal => goal.status === 'active')).toBe(true);
    });

    test('should filter goals by type', async () => {
      const response = await request(app)
        .get('/api/goals?type=skill')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(goal => goal.type === 'skill')).toBe(true);
    });
  });

  describe('GET /api/goals/:id', () => {
    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Specific Goal',
          type: 'skill',
          target_value: 100
        });
      
      testGoalId = goalRes.body.data.id;
    });

    test('should return specific goal by ID', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testGoalId);
      expect(response.body.data.title).toBe('Specific Goal');
    });

    test('should return 404 for non-existent goal', async () => {
      await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should prevent access to other user goals', async () => {
      // Create second user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Other',
          lastName: 'User',
          email: 'goaltest-other@example.com',
          password: 'TestPass123'
        });

      const otherToken = otherUserRes.body.data.accessToken;

      // Try to access first user's goal
      await request(app)
        .get(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          type: 'skill',
          target_value: 100
        });
      
      testGoalId = goalRes.body.data.id;
    });

    test('should update goal successfully', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
    });

    test('should update goal status', async () => {
      const response = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.data.status).toBe('completed');
    });

    test('should reject invalid status update', async () => {
      await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal to Delete',
          type: 'skill'
        });
      
      testGoalId = goalRes.body.data.id;
    });

    test('should delete goal successfully', async () => {
      await request(app)
        .delete(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify goal is deleted
      await request(app)
        .get(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent goal', async () => {
      await request(app)
        .delete('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/goals/:id/challenges', () => {
    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal with Challenges',
          type: 'skill'
        });
      
      testGoalId = goalRes.body.data.id;
    });

    test('should return goal with associated challenges', async () => {
      const response = await request(app)
        .get(`/api/goals/${testGoalId}/challenges`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('goal');
      expect(response.body.data).toHaveProperty('challenges');
      expect(Array.isArray(response.body.data.challenges)).toBe(true);
      expect(response.body.data.goal.id).toBe(testGoalId);
    });
  });

  describe('POST /api/goals/:id/refresh-progress', () => {
    beforeEach(async () => {
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Progress Test Goal',
          type: 'skill'
        });
      
      testGoalId = goalRes.body.data.id;
    });

    test('should refresh goal progress from challenges', async () => {
      const response = await request(app)
        .post(`/api/goals/${testGoalId}/refresh-progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('progress');
      expect(typeof response.body.data.progress).toBe('number');
    });
  });
});

module.exports = {};