import React, { useState, useEffect } from 'react';
import goalService from '../../services/goals';

const ProgressChart = ({ goalId, showDetails = true }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (goalId) {
      loadProgress();
    }
  }, [goalId]);

  const loadProgress = async () => {
    try {
      const response = await goalService.getProgress(goalId);
      setProgress(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return '#4caf50';
    if (percentage >= 50) return '#ff9800';
    if (percentage >= 25) return '#2196f3';
    return '#f44336';
  };

  if (loading) return <div className="progress-loading">Loading progress...</div>;
  if (!progress) return <div className="progress-error">Unable to load progress</div>;

  return (
    <div className="progress-chart">
      <div className="progress-circle">
        <svg viewBox="0 0 36 36" className="circular-chart">
          <path 
            className="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <path 
            className="circle"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={getProgressColor(progress.progress)}
            strokeWidth="3"
            strokeDasharray={`${progress.progress}, 100`}
          />
        </svg>
        <div className="percentage">{progress.progress}%</div>
      </div>
      
      {showDetails && (
        <div className="progress-details">
          <div className="progress-status">
            <span className={`status ${progress.status}`}>
              {progress.status.toUpperCase()}
            </span>
          </div>
          {progress.target_date && (
            <div className="progress-date">
              <span>Target: {new Date(progress.target_date).toLocaleDateString()}</span>
              {progress.is_overdue && <span className="overdue">OVERDUE</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProgressBar = ({ progress = 0, height = 8, showLabel = true, animated = true }) => {
  const progressColor = progress >= 75 ? '#4caf50' : 
                       progress >= 50 ? '#ff9800' : 
                       progress >= 25 ? '#2196f3' : '#f44336';

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar" 
        style={{ height: `${height}px`, backgroundColor: '#eee', borderRadius: '4px' }}
      >
        <div 
          className={`progress-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: '4px',
            transition: animated ? 'width 0.3s ease' : 'none'
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-label" style={{ fontSize: '12px', color: '#666' }}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

const ProgressDashboard = ({ goals = [] }) => {
  const calculateOverallProgress = () => {
    if (!goals.length) return 0;
    const total = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(total / goals.length);
  };

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.status === 'completed').length;
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'active').length;
  };

  return (
    <div className="progress-dashboard">
      <div className="progress-summary">
        <div className="summary-card">
          <h3>Overall Progress</h3>
          <ProgressBar progress={calculateOverallProgress()} height={12} />
        </div>
        
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{getCompletedGoals()}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{getActiveGoals()}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-value">{goals.length}</span>
            <span className="stat-label">Total Goals</span>
          </div>
        </div>
      </div>

      <div className="goals-progress">
        {goals.map(goal => (
          <div key={goal.id} className="goal-progress-item">
            <div className="goal-info">
              <h4>{goal.title}</h4>
              <span className="goal-type">{goal.type}</span>
            </div>
            <ProgressBar progress={goal.progress || 0} height={6} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProgressChart, ProgressBar, ProgressDashboard };