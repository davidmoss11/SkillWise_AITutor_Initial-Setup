import React from 'react';

const ChallengeCard = ({ challenge, onStart }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStart = () => {
    if (onStart) {
      onStart(challenge.id);
    }
  };

  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <h3>{challenge?.title || 'Challenge Title'}</h3>
        <div className="challenge-meta">
          <span className={`difficulty ${getDifficultyColor(challenge?.difficulty)}`}>
            {(challenge?.difficulty || 'Medium').toUpperCase()}
          </span>
          <span className="points">+{challenge?.points || 10} pts</span>
        </div>
      </div>
      
      <div className="challenge-content">
        <p>{challenge?.description || 'Challenge description goes here...'}</p>
        
        <div className="challenge-details">
          <div className="estimated-time">
            <span>⏱️ {formatTime(challenge?.estimated_time || challenge?.estimatedTime)}</span>
          </div>
          
          {challenge?.category && (
            <div className="challenge-category">
              <span>📁 {challenge.category}</span>
            </div>
          )}
        </div>
        
        {challenge?.tags && challenge.tags.length > 0 && (
          <div className="challenge-tags">
            {challenge.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="challenge-footer">
        <div className="challenge-stats">
          <span className="status">{challenge?.status || 'Available'}</span>
        </div>
        <button 
          className="btn-primary"
          onClick={handleStart}
          disabled={challenge?.status === 'locked'}
        >
          {challenge?.status === 'locked' ? 'Locked' : 'Start Challenge'}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;