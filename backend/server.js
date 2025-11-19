#!/usr/bin/env node
// Server entry point with Sentry error tracking, graceful shutdown and error handling

// Initialize Sentry FIRST before any other imports
const Sentry = require('@sentry/node');

// Only initialize Sentry in production or if DSN is explicitly provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express request tracing
      new Sentry.Integrations.Express({
        app: true,
      }),
    ],
  });
  console.log('✅ Sentry error tracking initialized');
}

const app = require('./src/app');
const logger = app.get('logger');

const PORT = process.env.PORT || 3001;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 SkillWise API Server running on port ${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/healthz`);
  logger.info(`🌐 API endpoints available at http://localhost:${PORT}/api`);
  logger.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('✅ Server closed successfully');
    
    // Close database connections, cleanup resources, etc.
    // TODO: Add database connection cleanup
    
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⏰ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;