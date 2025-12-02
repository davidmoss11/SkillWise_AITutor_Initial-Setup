/**
 * Sentry Configuration for Frontend (Story 3.8)
 * 
 * This module initializes Sentry for error tracking in the React frontend.
 * Errors and performance issues are captured and sent to Sentry for monitoring.
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for React
 * Should be called as early as possible in the application lifecycle
 */
export const initSentry = () => {
  // Only initialize Sentry if DSN is provided
  const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
  
  if (!sentryDsn || sentryDsn === 'your-sentry-dsn-url') {
    console.log('⚠️  Sentry DSN not configured - Error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    
    // Environment configuration
    environment: process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development',
    
    // Release tracking
    release: process.env.REACT_APP_VERSION || '1.0.0',
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance monitoring sample rate
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay sample rate
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Don't send errors in development unless explicitly enabled
    enabled: process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_DEBUG === 'true',
    
    // Attach stack traces
    attachStacktrace: true,
    
    // Configure which transactions to send
    beforeSend(event, hint) {
      // Don't send errors in development unless debug mode enabled
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_SENTRY_DEBUG) {
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
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // React warnings
      'Warning: ',
      // ResizeObserver errors
      'ResizeObserver loop',
    ],
    
    // Deny URLs to ignore
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.log(`✅ Sentry initialized for frontend (${process.env.NODE_ENV})`);
};

/**
 * Capture an exception manually
 */
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
};

/**
 * Capture a message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
};

/**
 * Set user context
 */
export const setUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username || user.name,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (category, message, data = {}, level = 'info') => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Error Boundary component
 * Wrap your app with this to catch React component errors
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Profiler component for performance monitoring
 */
export const Profiler = Sentry.Profiler;

/**
 * withProfiler HOC for component performance monitoring
 */
export const withProfiler = Sentry.withProfiler;

export default Sentry;
