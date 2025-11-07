import React, { useState } from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onDelete, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDifficultyClass = (difficulty) => {
    const diffMap = {
      'easy': 'difficulty-easy',
      'medium': 'difficulty-medium',
      'hard': 'difficulty-hard',
      'expert': 'difficulty-expert'
    };
    return diffMap[difficulty?.toLowerCase()] || 'difficulty-medium';
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'General';
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(goal.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(goal);
    }
  };

  return (
    <div className={`goal-card ${goal.is_completed ? 'completed' : ''}`}>
      <div className="goal-header">
        <div className="goal-title-section">
          <h3>{goal.title}</h3>
          {goal.is_completed && (
            <span className="completed-badge">✓ Completed</span>
          )}
        </div>
        {goal.category && (
          <span className="goal-category">{getCategoryLabel(goal.category)}</span>
        )}
      </div>
      
      <div className="goal-content">
        {goal.description && (
          <p className="goal-description">{goal.description}</p>
        )}
        
        <div className="goal-progress">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-text">{goal.progress_percentage || 0}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${goal.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="goal-footer">
        <div className="goal-meta">
          <span className={`goal-difficulty ${getDifficultyClass(goal.difficulty_level)}`}>
            {goal.difficulty_level?.charAt(0).toUpperCase() + goal.difficulty_level?.slice(1) || 'Medium'}
          </span>
          {goal.target_completion_date && (
            <span className="goal-date">
              🎯 {formatDate(goal.target_completion_date)}
            </span>
          )}
        </div>
        
        <div className="goal-actions">
          <button 
            className="btn-action btn-edit" 
            onClick={handleEdit}
            title="Edit goal"
          >
            ✏️
          </button>
          <button 
            className="btn-action btn-delete" 
            onClick={handleDelete}
            title="Delete goal"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;