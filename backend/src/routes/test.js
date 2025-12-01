/**
 * Test routes for Sentry error tracking (Story 3.8)
 * These routes are for testing error capture in development/staging
 * Should be disabled or protected in production
 */

const express = require('express');
const router = express.Router();
const sentry = require('../config/sentry');

// Test route to trigger a synchronous error
router.get('/error/sync', (req, res, next) => {
  sentry.addBreadcrumb('test', 'Triggering synchronous error');
  
  // This will be caught by Sentry
  throw new Error('Test synchronous error for Sentry');
});

// Test route to trigger an asynchronous error
router.get('/error/async', async (req, res, next) => {
  sentry.addBreadcrumb('test', 'Triggering asynchronous error');
  
  try {
    // Simulate async operation that fails
    await Promise.reject(new Error('Test asynchronous error for Sentry'));
  } catch (error) {
    next(error);
  }
});

// Test route to capture a message
router.get('/message/:level', (req, res) => {
  const { level } = req.params;
  const message = `Test ${level} message for Sentry`;
  
  sentry.captureMessage(message, level, {
    testData: 'This is test context',
    timestamp: new Date().toISOString(),
  });
  
  res.json({
    success: true,
    message: `${level} message sent to Sentry`,
  });
});

// Test route to manually capture an exception
router.get('/exception', (req, res) => {
  const testError = new Error('Manually captured test exception');
  
  sentry.captureException(testError, {
    manual: true,
    route: '/test/exception',
  });
  
  res.json({
    success: true,
    message: 'Exception manually captured and sent to Sentry',
  });
});

// Test route with user context
router.get('/error/with-user', (req, res, next) => {
  // Set user context
  sentry.setUser({
    id: 123,
    email: 'test@example.com',
    username: 'testuser',
  });
  
  sentry.addBreadcrumb('test', 'Triggering error with user context');
  
  throw new Error('Test error with user context');
});

// Test route to clear user context
router.get('/clear-user', (req, res) => {
  sentry.clearUser();
  
  res.json({
    success: true,
    message: 'User context cleared',
  });
});

module.exports = router;
