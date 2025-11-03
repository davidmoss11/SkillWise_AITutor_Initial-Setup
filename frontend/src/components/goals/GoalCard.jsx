import React, { useState } from 'react';

const GoalCard = ({ goal, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onDelete(goal.id);
    }
  };

  return (
    <div className="goal-card">
      <div className="goal-header">
        <h3>{goal?.title || 'Goal Title'}</h3>
        <div className="goal-actions">
          <button
            className="btn-icon"
            onClick={() => setShowActions(!showActions)}
          >
            ⋮
          </button>
          {showActions && (
            <div className="dropdown-menu">
              <button className="dropdown-item">Edit</button>
              <button className="dropdown-item danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="goal-content">
        <div className="goal-meta">
          <span className={`goal-type ${goal?.type || 'skill'}`}>
            {goal?.type || 'skill'}
          </span>
          <span className={`goal-status ${getStatusColor(goal?.status)}`}>
            {goal?.status || 'active'}
          </span>
        </div>
        
        <p>{goal?.description || 'No description provided'}</p>
        
        <div className="goal-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${goal?.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">{goal?.progress || 0}%</span>
        </div>
      </div>

      <div className="goal-footer">
        {goal?.target_date && (
          <span className="goal-date">
            Target: {formatDate(goal.target_date)}
          </span>
        )}
        <span className="goal-created">
          Created: {formatDate(goal?.created_at)}
        </span>
      </div>
    </div>
  );
};

export default GoalCard;