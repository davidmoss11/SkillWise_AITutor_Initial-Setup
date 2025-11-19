import React from 'react';
import * as Sentry from '@sentry/react';
import './ErrorBoundary.css';

/**
 * Error Boundary Component using Sentry
 * Catches React errors and displays a fallback UI
 * Automatically reports errors to Sentry if configured
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send to Sentry if configured
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
    
    // Store error details in state
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry, but something unexpected happened. 
              The error has been logged and we'll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-stack">
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br /><br />
                  <strong>Component Stack:</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReload} className="btn-primary">
                Reload Page
              </button>
              <button onClick={this.handleGoHome} className="btn-secondary">
                Go to Home
              </button>
            </div>
            
            {process.env.REACT_APP_SENTRY_DSN && (
              <p className="error-note">
                This error has been automatically reported to our team.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Also export a HOC version using Sentry's error boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary;

export default ErrorBoundary;
