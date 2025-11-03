import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', showProgress = false }) => {
  const getEmoji = () => {
    const emojis = ['🚀', '✨', '🎯', '💡', '⚡', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'loading-spinner-small';
      case 'large': return 'loading-spinner-large';
      default: return 'loading-spinner-medium';
    }
  };

  return (
    <div className={`loading-spinner ${getSizeClass()}`}>
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-emoji">{getEmoji()}</div>
        </div>
      </div>
      {message && (
        <div className="loading-content">
          <p className="loading-message">{message}</p>
          {showProgress && (
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          )}
          <p className="loading-tip">
            💡 <em>Did you know? The average person learns best when they're actively engaged!</em>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;