import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [new BrowserTracing()],
    tracesSampleRate: parseFloat(
      process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0.1'
    ),
  });
}

export default Sentry;
