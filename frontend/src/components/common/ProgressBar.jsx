import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  current, 
  total, 
  label = 'Progress',
  showPercentage = true,
  showStats = true,
  color = 'default',
  height = 'medium',
  animated = true
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const getColorClass = () => {
    if (color !== 'default') return `progress-${color}`;
    
    // Auto color based on percentage
    if (percentage >= 75) return 'progress-success';
    if (percentage >= 50) return 'progress-info';
    if (percentage >= 25) return 'progress-warning';
    return 'progress-danger';
  };

  const getHeightClass = () => {
    const heightMap = {
      'small': 'height-small',
      'medium': 'height-medium',
      'large': 'height-large',
      'xlarge': 'height-xlarge'
    };
    return heightMap[height] || 'height-medium';
  };

  return (
    <div className="progress-bar-container">
      {(label || showStats) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showStats && (
            <span className="progress-stats">
              {current} / {total}
              {showPercentage && ` (${percentage}%)`}
            </span>
          )}
        </div>
      )}
      
      <div className={`progress-track ${getHeightClass()}`}>
        <div 
          className={`progress-fill ${getColorClass()} ${animated ? 'animated' : ''}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin="0"
          aria-valuemax={total}
          aria-label={`${label}: ${percentage}% complete`}
        >
          {height === 'large' || height === 'xlarge' ? (
            <span className="progress-text-inside">{percentage}%</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
