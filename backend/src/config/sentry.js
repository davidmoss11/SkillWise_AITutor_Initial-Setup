/**
 * Sentry Configuration for Backend (Story 3.8)
 * 
 * This module initializes Sentry for error tracking and performance monitoring.
 * Errors captured in production are sent to Sentry for analysis and alerting.
 */

const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 * Should be called as early as possible in the application lifecycle
 */
const initSentry = () => {
  // Only initialize Sentry if DSN is provided
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not configured - Error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    
    // Environment configuration
    environment: process.env.NODE_ENV || 'development',
    
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // Enable profiling
      nodeProfilingIntegration(),
    ],
    
    // Don't send errors in test environment
    enabled: process.env.NODE_ENV !== 'test',
    
    // Attach stack traces to pure capture message calls
    attachStacktrace: true,
    
    // Configure which transactions to send
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
        console.log('🔍 Sentry Event (not sent in dev):', {
          message: event.message || hint.originalException?.message,
          level: event.level,
        });
        return null;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Ignore known benign errors
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Network request failed',
    ],
  });

  console.log(`✅ Sentry initialized (${process.env.NODE_ENV})`);
};

/**
 * Capture an exception in Sentry
 */
const captureException = (error, context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } else {
    console.error('❌ Error (Sentry not configured):', error);
  }
};

/**
 * Capture a message in Sentry
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context,
      },
    });
  } else {
    console.log(`📝 Message (Sentry not configured): [${level}] ${message}`);
  }
};

/**
 * Set user context for error tracking
 */
const setUser = (user) => {
  if (process.env.SENTRY_DSN && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
};

/**
 * Clear user context
 */
const clearUser = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
const addBreadcrumb = (category, message, data = {}, level = 'info') => {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level,
      timestamp: Date.now() / 1000,
    });
  }
};

/**
 * Express error handler middleware
 * Should be added after all routes and other error handlers
 */
const errorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors
      return true;
    },
  });
};

/**
 * Express request handler middleware
 * Should be added before all routes
 */
const requestHandler = () => {
  return Sentry.Handlers.requestHandler({
    // Include user info in events
    user: ['id', 'email', 'username'],
    // Include request body in events (sanitize sensitive data)
    request: true,
    // Include transaction name
    transaction: 'methodPath',
  });
};

/**
 * Express tracing handler middleware
 * Should be added before all routes, after requestHandler
 */
const tracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

module.exports = {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  errorHandler,
  requestHandler,
  tracingHandler,
  Sentry, // Export Sentry instance for advanced usage
};
