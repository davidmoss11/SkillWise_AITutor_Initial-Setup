// Authentication flow integration tests
const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/database/connection');

describe('Authentication Integration Tests', () => {
  let testUser;
  let userToken;
  let refreshToken;

  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['test%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    
    testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPass123'
    };
  });

  afterAll(async () => {
    // Clean up after all tests
    await pool.query('DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['test%@example.com']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.firstName).toBe(testUser.firstName);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.password_hash).toBeUndefined();
    });

    test('should reject registration with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    test('should reject duplicate email registration', async () => {
      // Register user first time
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('should login registered user successfully', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
      
      userToken = response.body.data.accessToken;
    });

    test('should reject login with invalid credentials', async () => {
      const invalidLogin = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login with non-existent email', async () => {
      const invalidLogin = {
        email: 'nonexistent@example.com',
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Register and login a user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      userToken = loginResponse.body.data.accessToken;
      
      // Extract refresh token from cookies
      const cookies = loginResponse.headers['set-cookie'];
      refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken='));
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', refreshToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    test('should logout even without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Register and login a user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      userToken = loginResponse.body.data.accessToken;
      
      // Extract refresh token from cookies
      const cookies = loginResponse.headers['set-cookie'];
      refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken='));
    });

    test('should refresh valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(userToken);
    });

    test('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token not provided');
    });

    test('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Route Access', () => {
    beforeEach(async () => {
      // Register and login a user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      userToken = loginResponse.body.data.accessToken;
    });

    test('should access protected route with valid token', async () => {
      // This assumes there's a protected route that uses the auth middleware
      // You may need to create a test route or use an actual protected route
      const response = await request(app)
        .get('/api/users/profile') // assuming this route exists and is protected
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});