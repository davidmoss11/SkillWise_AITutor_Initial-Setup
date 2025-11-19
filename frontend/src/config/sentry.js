import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking for the frontend
 * Only initializes if REACT_APP_SENTRY_DSN is set in environment
 */
export const initSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // In production, consider lowering this value to reduce costs
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Set sample rate for profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      integrations: [
        new Sentry.BrowserTracing({
          // Set sampling rate for navigation transactions
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/yourserver\.io\/api/,
            /^http:\/\/localhost:3001\/api/,
          ],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Session Replay sample rate
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Before sending errors, you can filter or modify them
      beforeSend(event, hint) {
        // Don't send errors in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_SENTRY_DEBUG) {
          return null;
        }
        return event;
      },
    });
    
    console.log('✅ Sentry error tracking initialized');
  } else {
    console.log('ℹ️ Sentry not initialized - REACT_APP_SENTRY_DSN not set');
  }
};

export default Sentry;
