/**
 * Story 2.7 - Smoke Test
 * Simple consolidated test proving the workflow works
 */

// Set environment variables BEFORE importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

const request = require('supertest');
const app = require('../../src/app');
const { testPool, clearTestData } = require('../setup');
const bcrypt = require('bcryptjs');

describe('Story 2.7 - Smoke Test: Login → Goal → Challenge → Complete', () => {
  
  it('should complete the full workflow successfully', async () => {
    // Clean slate
    await clearTestData();

    // 1. CREATE USER
    const hashedPassword = await bcrypt.hash('SmokeTest123!', 10);
    const userResult = await testPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
      ['smoke.test@skillwise.com', hashedPassword, 'Smoke', 'Test', 'student']
    );
    const userId = userResult.rows[0].id;
    console.log('✅ 1. Test user created:', userId);

    // 2. LOGIN
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'smoke.test@skillwise.com',
        password: 'SmokeTest123!'
      });
    
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    console.log('✅ 2. User logged in successfully');

    // 3. CREATE GOAL
    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Master TypeScript',
        description: 'Learn advanced TypeScript features',
        category: 'Programming',
        priority: 'high'
      });
    
    if (goalRes.status !== 201) {
      console.log('Goal creation failed:', goalRes.status, JSON.stringify(goalRes.body, null, 2));
      console.log('Token used:', token);
    }
    expect(goalRes.status).toBe(201);
    const goalId = goalRes.body.id;
    expect(goalRes.body.progress).toBe(0);
    expect(goalRes.body.status).toBe('active');
    console.log('✅ 3. Goal created:', goalId);

    // 4. CREATE CHALLENGE
    const challengeRes = await request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Build Type-Safe API',
        description: 'Create API with TypeScript',
        category: 'Backend',
        difficulty: 'intermediate',
        points: 100,
        goal_id: goalId
      });
    
    expect(challengeRes.status).toBe(201);
    const challengeId = challengeRes.body.id;
    expect(challengeRes.body.status).toBe('not_started');
    expect(challengeRes.body.goal_id).toBe(goalId);
    console.log('✅ 4. Challenge created:', challengeId);

    // 5. START CHALLENGE
    const startRes = await request(app)
      .put(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'in_progress' });
    
    expect(startRes.status).toBe(200);
    expect(startRes.body.status).toBe('in_progress');
    console.log('✅ 5. Challenge started');

    // 6. COMPLETE CHALLENGE
    const completeRes = await request(app)
      .put(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });
    
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('completed');
    expect(completeRes.body.completed_at).toBeTruthy();
    console.log('✅ 6. Challenge completed');

    // 7. UPDATE GOAL PROGRESS
    const updateGoalRes = await request(app)
      .put(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ progress: 100 });
    
    expect(updateGoalRes.status).toBe(200);
    expect(updateGoalRes.body.progress).toBe(100);
    expect(updateGoalRes.body.status).toBe('completed');
    expect(updateGoalRes.body.completed_at).toBeTruthy();
    console.log('✅ 7. Goal completed');

    // 8. VERIFY DATA PERSISTENCE
    const verifyGoalRes = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(verifyGoalRes.status).toBe(200);
    expect(verifyGoalRes.body.status).toBe('completed');
    
    const verifyChallengeRes = await request(app)
      .get(`/api/challenges/${challengeId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(verifyChallengeRes.status).toBe(200);
    expect(verifyChallengeRes.body.status).toBe('completed');
    console.log('✅ 8. Data verified in database');

    console.log('\n🎉 SMOKE TEST PASSED: Complete workflow successful!\n');

    // Cleanup
    await clearTestData();
  }, 15000); // 15 second timeout for the entire test

});

module.exports = {};
