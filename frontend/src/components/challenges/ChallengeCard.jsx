import React from 'react';
import './ChallengeCard.css';

const ChallengeCard = ({ challenge, onView, onEdit, onDelete }) => {
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

  const getStatusBadge = () => {
    if (!challenge.is_active) {
      return <span className="status-badge inactive">Inactive</span>;
    }
    return <span className="status-badge active">Active</span>;
  };

  const handleView = () => {
    if (onView) {
      onView(challenge);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(challenge);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(challenge.id);
    }
  };

  return (
    <div className={`challenge-card ${!challenge.is_active ? 'inactive' : ''}`}>
      <div className="challenge-header">
        <div className="challenge-title-section">
          <h3>{challenge.title}</h3>
          {getStatusBadge()}
        </div>
        <div className="challenge-meta-top">
          {challenge.category && (
            <span className="challenge-category">{getCategoryLabel(challenge.category)}</span>
          )}
          <span className={`challenge-difficulty ${getDifficultyClass(challenge.difficulty_level)}`}>
            {challenge.difficulty_level?.charAt(0).toUpperCase() + challenge.difficulty_level?.slice(1) || 'Medium'}
          </span>
        </div>
      </div>
      
      <div className="challenge-content">
        {challenge.description && (
          <p className="challenge-description">{challenge.description}</p>
        )}

        {challenge.goal_title && (
          <div className="challenge-goal-link">
            <span className="goal-icon">🎯</span>
            <span className="goal-text">Linked to: <strong>{challenge.goal_title}</strong></span>
          </div>
        )}

        <div className="challenge-details">
          {challenge.estimated_time_minutes && (
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span className="detail-text">{challenge.estimated_time_minutes} min</span>
            </div>
          )}
          {challenge.points_reward !== undefined && (
            <div className="detail-item">
              <span className="detail-icon">⭐</span>
              <span className="detail-text">{challenge.points_reward} pts</span>
            </div>
          )}
          {challenge.max_attempts !== undefined && (
            <div className="detail-item">
              <span className="detail-icon">🔄</span>
              <span className="detail-text">{challenge.max_attempts} attempts</span>
            </div>
          )}
        </div>

        {challenge.tags && challenge.tags.length > 0 && (
          <div className="challenge-tags">
            {challenge.tags.slice(0, 5).map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
            {challenge.tags.length > 5 && (
              <span className="tag more">+{challenge.tags.length - 5}</span>
            )}
          </div>
        )}

        {challenge.requires_peer_review && (
          <div className="peer-review-badge">
            <span className="review-icon">👥</span>
            <span>Requires Peer Review</span>
          </div>
        )}
      </div>

      <div className="challenge-footer">
        <div className="challenge-date">
          {challenge.created_at && (
            <span className="created-date">
              Created {formatDate(challenge.created_at)}
            </span>
          )}
        </div>
        
        <div className="challenge-actions">
          <button 
            className="btn-action btn-view" 
            onClick={handleView}
            title="View challenge details"
          >
            👁️
          </button>
          <button 
            className="btn-action btn-edit" 
            onClick={handleEdit}
            title="Edit challenge"
          >
            ✏️
          </button>
          <button 
            className="btn-action btn-delete" 
            onClick={handleDelete}
            title="Delete challenge"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;