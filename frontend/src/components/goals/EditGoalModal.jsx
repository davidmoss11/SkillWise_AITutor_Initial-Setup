import React, { useState } from 'react';
import './EditGoalModal.css';

const EditGoalModal = ({ goal, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: goal.title || '',
    description: goal.description || '',
    category: goal.category || '',
    difficulty_level: goal.difficulty_level || 'medium',
    target_completion_date: goal.target_completion_date || '',
    progress_percentage: goal.progress_percentage || 0,
    is_completed: goal.is_completed || false,
    is_public: goal.is_public || false
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      newErrors.progress_percentage = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({
      ...formData,
      progress_percentage: value,
      is_completed: value === 100
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Goal</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-goal-form">
          <div className="form-group">
            <label htmlFor="title">
              Goal Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter goal title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your goal"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="programming">Programming</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="data-science">Data Science</option>
                <option value="machine-learning">Machine Learning</option>
                <option value="devops">DevOps</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty</label>
              <select
                id="difficulty_level"
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="target_completion_date">Target Completion Date</label>
            <input
              type="date"
              id="target_completion_date"
              name="target_completion_date"
              value={formData.target_completion_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="progress_percentage">
              Progress: {formData.progress_percentage}%
            </label>
            <input
              type="range"
              id="progress_percentage"
              name="progress_percentage"
              min="0"
              max="100"
              step="5"
              value={formData.progress_percentage}
              onChange={handleProgressChange}
              className="progress-slider"
            />
            <div className="progress-bar-preview">
              <div 
                className="progress-fill-preview" 
                style={{ width: `${formData.progress_percentage}%` }}
              />
            </div>
            {errors.progress_percentage && (
              <span className="error-text">{errors.progress_percentage}</span>
            )}
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
              />
              <span>Mark as completed</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
              />
              <span>Make this goal public</span>
            </label>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;
