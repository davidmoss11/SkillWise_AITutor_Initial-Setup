/**
 * Error Test Page for Sentry Testing (Story 3.8)
 * This page provides buttons to test different types of errors
 * to verify Sentry integration is working correctly.
 */

import { useState } from 'react';
import { captureException, captureMessage, addBreadcrumb } from '../config/sentry';
import './ErrorTestPage.css';

const ErrorTestPage = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSyncError = () => {
    addBreadcrumb('test', 'User clicked sync error button');
    throw new Error('Test synchronous error from React component');
  };

  const handleAsyncError = async () => {
    addBreadcrumb('test', 'User clicked async error button');
    setErrorMessage('Triggering async error...');
    
    setTimeout(() => {
      try {
        throw new Error('Test asynchronous error from setTimeout');
      } catch (error) {
        captureException(error, {
          context: 'async-test',
          userAction: 'clicked async error button',
        });
        setErrorMessage(`Error captured: ${error.message}`);
      }
    }, 1000);
  };

  const handlePromiseRejection = () => {
    addBreadcrumb('test', 'User clicked promise rejection button');
    setErrorMessage('Triggering promise rejection...');
    
    Promise.reject(new Error('Test unhandled promise rejection'))
      .catch((error) => {
        captureException(error, {
          context: 'promise-rejection-test',
        });
        setErrorMessage(`Promise rejection captured: ${error.message}`);
      });
  };

  const handleCustomMessage = (level) => {
    addBreadcrumb('test', `User sent ${level} message`);
    
    const message = `Test ${level} message from frontend`;
    captureMessage(message, level, {
      testData: 'Custom message context',
      timestamp: new Date().toISOString(),
    });
    
    setErrorMessage(`${level.toUpperCase()} message sent to Sentry`);
  };

  const handleNetworkError = async () => {
    addBreadcrumb('test', 'User clicked network error button');
    setErrorMessage('Triggering network error...');
    
    try {
      // Try to fetch from non-existent endpoint
      await fetch('http://localhost:3001/api/nonexistent-endpoint-for-testing');
    } catch (error) {
      captureException(error, {
        context: 'network-error-test',
        endpoint: '/api/nonexistent-endpoint-for-testing',
      });
      setErrorMessage(`Network error captured: ${error.message}`);
    }
  };

  return (
    <div className="error-test-page">
      <div className="error-test-container">
        <h1>🧪 Sentry Error Testing</h1>
        <p className="subtitle">
          Test different types of errors to verify Sentry integration
        </p>

        <div className="test-section">
          <h2>Component Errors</h2>
          <p>These will be caught by the Error Boundary</p>
          
          <button
            className="test-button error"
            onClick={handleSyncError}
          >
            🔴 Throw Synchronous Error
          </button>
          
          <button
            className="test-button warning"
            onClick={handleAsyncError}
          >
            🟡 Trigger Async Error
          </button>
          
          <button
            className="test-button warning"
            onClick={handlePromiseRejection}
          >
            🟡 Promise Rejection
          </button>
        </div>

        <div className="test-section">
          <h2>Custom Messages</h2>
          <p>Send different severity messages to Sentry</p>
          
          <button
            className="test-button info"
            onClick={() => handleCustomMessage('info')}
          >
            ℹ️ Info Message
          </button>
          
          <button
            className="test-button warning"
            onClick={() => handleCustomMessage('warning')}
          >
            ⚠️ Warning Message
          </button>
          
          <button
            className="test-button error"
            onClick={() => handleCustomMessage('error')}
          >
            ❌ Error Message
          </button>
        </div>

        <div className="test-section">
          <h2>Network Errors</h2>
          <p>Test error handling for API failures</p>
          
          <button
            className="test-button error"
            onClick={handleNetworkError}
          >
            🌐 Trigger Network Error
          </button>
        </div>

        {errorMessage && (
          <div className="result-message">
            <strong>Result:</strong> {errorMessage}
          </div>
        )}

        <div className="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Click any button to trigger an error or message</li>
            <li>Check the browser console for local logs</li>
            <li>Check Sentry dashboard to verify events are captured</li>
            <li>In development, events are logged but not sent (unless REACT_APP_SENTRY_DEBUG=true)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestPage;
