import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initSentry, ErrorBoundary } from './config/sentry';

// Initialize Sentry (Story 3.8)
initSentry();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Oops! Something went wrong</h1>
          <p style={{ color: '#666' }}>
            We're sorry for the inconvenience. The error has been reported to our team.
          </p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
              Error Details
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto' 
            }}>
              {error?.toString()}
            </pre>
          </details>
          <button
            onClick={resetError}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}
      onError={(error, componentStack) => {
        console.error('Error Boundary caught error:', error);
        console.error('Component stack:', componentStack);
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);