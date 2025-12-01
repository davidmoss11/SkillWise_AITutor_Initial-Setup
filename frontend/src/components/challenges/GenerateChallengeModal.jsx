import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './GenerateChallengeModal.css';

const GenerateChallengeModal = ({ isOpen, onClose, onChallengeGenerated }) => {
  const [formData, setFormData] = useState({
    category: 'programming',
    difficulty: 'medium',
    topic: '',
    saveToDatabase: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  const categories = [
    { value: 'programming', label: 'Programming' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Beginner-friendly' },
    { value: 'medium', label: 'Medium', description: 'Intermediate level' },
    { value: 'hard', label: 'Hard', description: 'Advanced' },
    { value: 'expert', label: 'Expert', description: 'Expert level' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);
    setGeneratedChallenge(null);

    try {
      const response = await apiService.ai.generateChallenge({
        category: formData.category,
        difficulty: formData.difficulty,
        topic: formData.topic || null,
        saveToDatabase: formData.saveToDatabase,
      });

      if (response.data.success) {
        setGeneratedChallenge(response.data.data.challenge);
        
        // Notify parent component
        if (onChallengeGenerated) {
          onChallengeGenerated(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
      setError(
        err.response?.data?.message || 
        'Failed to generate challenge. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: 'programming',
      difficulty: 'medium',
      topic: '',
      saveToDatabase: true,
    });
    setGeneratedChallenge(null);
    setError('');
    onClose();
  };

  const handleUseChallenge = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 Generate AI Challenge</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!generatedChallenge ? (
            <form onSubmit={handleGenerate} className="generate-form">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isGenerating}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  disabled={isGenerating}
                  required
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label} - {diff.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="topic">
                  Specific Topic <span className="optional">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., React Hooks, Binary Search, REST APIs..."
                  disabled={isGenerating}
                />
                <small className="form-hint">
                  Leave blank for AI to choose an appropriate topic
                </small>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="saveToDatabase"
                    checked={formData.saveToDatabase}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                  />
                  <span>Save challenge to database</span>
                </label>
                <small className="form-hint">
                  If checked, the challenge will be saved and available to all users
                </small>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generate Challenge
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="challenge-result">
              <div className="result-header">
                <span className="success-icon">✅</span>
                <h3>Challenge Generated Successfully!</h3>
              </div>

              <div className="challenge-details">
                <div className="detail-row">
                  <strong>Title:</strong>
                  <span>{generatedChallenge.title}</span>
                </div>

                <div className="detail-row">
                  <strong>Category:</strong>
                  <span className="badge">{generatedChallenge.category}</span>
                </div>

                <div className="detail-row">
                  <strong>Difficulty:</strong>
                  <span className={`badge difficulty-${generatedChallenge.difficulty_level}`}>
                    {generatedChallenge.difficulty_level}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Estimated Time:</strong>
                  <span>{generatedChallenge.estimated_time_minutes} minutes</span>
                </div>

                <div className="detail-row">
                  <strong>Points:</strong>
                  <span>⭐ {generatedChallenge.points_reward} points</span>
                </div>

                <div className="detail-section">
                  <strong>Description:</strong>
                  <p>{generatedChallenge.description}</p>
                </div>

                <div className="detail-section">
                  <strong>Instructions:</strong>
                  <p className="instructions">{generatedChallenge.instructions}</p>
                </div>

                {generatedChallenge.tags && generatedChallenge.tags.length > 0 && (
                  <div className="detail-section">
                    <strong>Tags:</strong>
                    <div className="tags-container">
                      {generatedChallenge.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {generatedChallenge.learning_objectives && generatedChallenge.learning_objectives.length > 0 && (
                  <div className="detail-section">
                    <strong>Learning Objectives:</strong>
                    <ul className="objectives-list">
                      {generatedChallenge.learning_objectives.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedChallenge.starter_code && (
                  <div className="detail-section">
                    <strong>Starter Code:</strong>
                    <pre className="code-block">
                      <code>{generatedChallenge.starter_code}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setGeneratedChallenge(null)}
                >
                  Generate Another
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUseChallenge}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateChallengeModal;
