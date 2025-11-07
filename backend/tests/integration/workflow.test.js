/**
 * Story 2.7 - Simple Workflow Integration Test
 * 
 * This simplified test demonstrates the complete workflow:
 * Login → Create Goal → Add Challenge → Mark Complete
 * 
 * Note: This test uses the actual API endpoints through supertest
 */

const request = require('supertest');
const app = require('../../src/app');
const { testPool, clearTestData } = require('../setup');
const bcrypt = require('bcryptjs');

describe('Story 2.7 - Complete Workflow Integration', () => {
  let testUser;
  let authToken;
  let createdGoal;
  let createdChallenge;

  beforeAll(async () => {
    // Clear all test data
    await clearTestData();

    // Create a fresh test user
    const hashedPassword = await bcrypt.hash('WorkflowTest123!', 10);
    const userResult = await testPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      ['workflow.test@skillwise.com', hashedPassword, 'Workflow', 'Tester', 'student']
    );
    testUser = userResult.rows[0];
  });

  afterAll(async () => {
    // Clean up after all tests
    await clearTestData();
  });

  describe('Complete User Workflow', () => {
    test('Step 1: User can login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'workflow.test@skillwise.com',
          password: 'WorkflowTest123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('workflow.test@skillwise.com');

      // Store token for subsequent requests
      authToken = response.body.token;

      console.log('✅ Step 1 Complete: User logged in');
    });

    test('Step 2: User can create a learning goal', async () => {
      const goalData = {
        title: 'Learn Full Stack Development',
        description: 'Master React, Node.js, and PostgreSQL',
        category: 'Programming',
        priority: 'high',
        target_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(goalData.title);
      expect(response.body.description).toBe(goalData.description);
      expect(response.body.status).toBe('active');
      expect(response.body.progress).toBe(0);
      expect(response.body.user_id).toBe(testUser.id);

      // Store goal for next steps
      createdGoal = response.body;

      console.log(`✅ Step 2 Complete: Goal created with ID ${createdGoal.id}`);
    });

    test('Step 3: User can add a challenge linked to the goal', async () => {
      const challengeData = {
        title: 'Build a REST API',
        description: 'Create a RESTful API with Express and PostgreSQL',
        category: 'Backend Development',
        difficulty: 'intermediate',
        points: 100,
        estimated_time: '6 hours',
        goal_id: createdGoal.id,
        tags: ['express', 'postgresql', 'rest', 'api']
      };

      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(challengeData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(challengeData.title);
      expect(response.body.description).toBe(challengeData.description);
      expect(response.body.goal_id).toBe(createdGoal.id);
      expect(response.body.status).toBe('not_started');
      expect(response.body.difficulty).toBe('intermediate');
      expect(response.body.points).toBe(100);

      // Store challenge for next steps
      createdChallenge = response.body;

      console.log(`✅ Step 3 Complete: Challenge created with ID ${createdChallenge.id}`);
    });

    test('Step 4: User can start the challenge', async () => {
      const response = await request(app)
        .put(`/api/challenges/${createdChallenge.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
      expect(response.body.id).toBe(createdChallenge.id);

      console.log('✅ Step 4 Complete: Challenge marked as in_progress');
    });

    test('Step 5: User can mark the challenge as complete', async () => {
      const response = await request(app)
        .put(`/api/challenges/${createdChallenge.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.completed_at).toBeTruthy();
      expect(response.body.id).toBe(createdChallenge.id);

      console.log('✅ Step 5 Complete: Challenge marked as completed');
    });

    test('Step 6: Goal progress can be updated', async () => {
      // Update goal progress to reflect challenge completion
      const response = await request(app)
        .put(`/api/goals/${createdGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 50 });

      expect(response.status).toBe(200);
      expect(response.body.progress).toBe(50);
      expect(response.body.status).toBe('active');
      expect(response.body.id).toBe(createdGoal.id);

      console.log('✅ Step 6 Complete: Goal progress updated to 50%');
    });

    test('Step 7: User can complete the goal', async () => {
      // Mark goal as 100% complete
      const response = await request(app)
        .put(`/api/goals/${createdGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ progress: 100 });

      expect(response.status).toBe(200);
      expect(response.body.progress).toBe(100);
      expect(response.body.status).toBe('completed');
      expect(response.body.completed_at).toBeTruthy();
      expect(response.body.id).toBe(createdGoal.id);

      console.log('✅ Step 7 Complete: Goal marked as completed');
    });

    test('Step 8: User can view all their goals', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Find our completed goal
      const ourGoal = response.body.find(g => g.id === createdGoal.id);
      expect(ourGoal).toBeDefined();
      expect(ourGoal.status).toBe('completed');
      expect(ourGoal.progress).toBe(100);

      console.log('✅ Step 8 Complete: Retrieved all goals successfully');
    });

    test('Step 9: User can view challenges linked to their goal', async () => {
      const response = await request(app)
        .get(`/api/challenges?goal_id=${createdGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Find our completed challenge
      const ourChallenge = response.body.find(c => c.id === createdChallenge.id);
      expect(ourChallenge).toBeDefined();
      expect(ourChallenge.status).toBe('completed');
      expect(ourChallenge.goal_id).toBe(createdGoal.id);

      console.log('✅ Step 9 Complete: Retrieved challenges for goal');
    });
  });

  describe('Verification Tests', () => {
    test('Challenge is linked to goal in database', async () => {
      const result = await testPool.query(
        'SELECT * FROM challenges WHERE id = $1',
        [createdChallenge.id]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].goal_id).toBe(createdGoal.id);
      expect(result.rows[0].status).toBe('completed');
    });

    test('Goal has correct completion status in database', async () => {
      const result = await testPool.query(
        'SELECT * FROM goals WHERE id = $1',
        [createdGoal.id]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].progress).toBe(100);
      expect(result.rows[0].status).toBe('completed');
      expect(result.rows[0].completed_at).toBeTruthy();
    });
  });
});

// Export for other tests
module.exports = {};
