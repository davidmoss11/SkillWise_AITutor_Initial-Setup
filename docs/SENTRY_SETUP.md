# Sentry Error Tracking Setup

This document explains how to set up and use Sentry for error tracking in the SkillWise application.

## What is Sentry?

Sentry is an error tracking and performance monitoring platform that helps you identify, debug, and resolve issues in production.

## Features Implemented

### Backend (Node.js/Express)
- ✅ Automatic error capture for 500+ status codes
- ✅ Request tracing and performance monitoring
- ✅ Express.js integration
- ✅ Error context and breadcrumbs
- ✅ Environment-based configuration

### Frontend (React)
- ✅ Error Boundary component for React errors
- ✅ User-friendly fallback UI
- ✅ Browser performance monitoring
- ✅ Session replay for error reproduction
- ✅ Automatic error reporting to Sentry

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project for:
   - **Backend**: Node.js/Express
   - **Frontend**: React

### 2. Get Your DSN

After creating projects, Sentry will provide a DSN (Data Source Name) for each project. It looks like:
```
https://abc123@o123456.ingest.sentry.io/456789
```

### 3. Configure Backend

Add the Sentry DSN to your backend `.env` file:

```bash
# backend/.env
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
NODE_ENV=production
```

**Note:** Sentry is only initialized if `SENTRY_DSN` is set. It's safe to leave it empty in development.

### 4. Configure Frontend

Add the Sentry DSN to your frontend `.env` file:

```bash
# frontend/.env
REACT_APP_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
REACT_APP_SENTRY_DEBUG=false  # Set to true to enable console logging
```

**Note:** In development, errors are not sent to Sentry unless `REACT_APP_SENTRY_DEBUG=true`.

### 5. Install Dependencies

Dependencies are already in `package.json`, but if needed:

**Backend:**
```bash
cd backend
npm install @sentry/node
```

**Frontend:**
```bash
cd frontend
npm install @sentry/react
```

### 6. Restart Services

```bash
docker-compose down
docker-compose up --build
```

## Testing Sentry Integration

### Test Backend Error Tracking

Create a test endpoint to trigger an error:

```javascript
// Add to backend/src/routes/index.js (for testing only)
router.get('/test-error', (req, res) => {
  throw new Error('Test error for Sentry!');
});
```

Then visit: `http://localhost:3001/api/test-error`

### Test Frontend Error Tracking

Create a component that throws an error:

```javascript
// Add a button to any component
<button onClick={() => {
  throw new Error('Test frontend error!');
}}>
  Test Error
</button>
```

## Error Boundary Usage

The application is wrapped in an `ErrorBoundary` component that:

1. **Catches React errors** - Prevents the app from crashing
2. **Shows fallback UI** - User-friendly error screen
3. **Reports to Sentry** - Automatically sends error details
4. **Provides recovery options** - Reload or go home

### Custom Error Boundary

You can wrap specific components with additional error boundaries:

```jsx
import ErrorBoundary from './components/common/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <CriticalFeature />
    </ErrorBoundary>
  );
}
```

## Manual Error Reporting

### Backend

```javascript
const Sentry = require('@sentry/node');

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      user_id: req.user.id
    },
    extra: {
      orderDetails: orderData
    }
  });
  throw error;
}
```

### Frontend

```javascript
import * as Sentry from '@sentry/react';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      page: 'checkout',
      component: 'PaymentForm'
    },
    extra: {
      paymentAmount: amount,
      currency: 'USD'
    }
  });
  // Handle error
}
```

## Configuration Options

### Backend (server.js)

```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,  // Adjust for production (0.1 = 10%)
});
```

### Frontend (config/sentry.js)

```javascript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,  // Adjust for production
  replaysSessionSampleRate: 0.1,  // Record 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // Record 100% of sessions with errors
});
```

## Best Practices

### 1. Filter Sensitive Data

Sentry automatically scrubs sensitive data, but you can add custom filtering:

```javascript
beforeSend(event) {
  // Remove password fields
  if (event.request?.data?.password) {
    delete event.request.data.password;
  }
  return event;
}
```

### 2. Set User Context

Help identify which users experience errors:

```javascript
// Backend
Sentry.setUser({ id: user.id, email: user.email });

// Frontend
Sentry.setUser({ id: user.id, username: user.username });
```

### 3. Add Breadcrumbs

Track user actions leading to errors:

```javascript
Sentry.addBreadcrumb({
  category: 'ui',
  message: 'User clicked submit button',
  level: 'info'
});
```

### 4. Use Tags

Organize errors with tags:

```javascript
Sentry.setTag('page', 'dashboard');
Sentry.setTag('feature', 'ai-challenges');
```

## Performance Monitoring

Sentry also tracks performance metrics:

- **Backend**: API response times, database queries
- **Frontend**: Page load times, component render times, network requests

View performance data in the Sentry dashboard under "Performance".

## Sample Rates for Production

To control costs in production:

```javascript
// Backend
tracesSampleRate: 0.1,  // Track 10% of requests

// Frontend
tracesSampleRate: 0.1,
replaysSessionSampleRate: 0.05,  // Record 5% of sessions
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN** - Ensure `SENTRY_DSN` is set correctly
2. **Check environment** - Development errors may be filtered
3. **Check console** - Look for Sentry initialization message
4. **Check network** - Ensure firewall allows sentry.io requests

### Too Many Events

1. Reduce sample rates
2. Add error filtering in `beforeSend`
3. Upgrade Sentry plan or set quotas

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Node.js Integration](https://docs.sentry.io/platforms/node/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundary Guide](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)

## Sprint 3 - Story 3.8 Completion

✅ **Backend Integration**
- Sentry SDK initialized in server.js
- Request and error handlers in app.js
- Environment configuration in .env.example

✅ **Frontend Integration**
- Sentry SDK initialized in index.js
- ErrorBoundary component with fallback UI
- App wrapped with error boundary
- Environment configuration in .env.example

✅ **Documentation**
- Setup instructions
- Testing guidelines
- Best practices
- Configuration examples
