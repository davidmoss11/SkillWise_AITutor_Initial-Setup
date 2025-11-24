import React from 'react';
import { useForm } from 'react-hook-form';
import './CreateGoalForm.css';

const CreateGoalForm = ({ onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty_level: 'medium',
      target_completion_date: '',
      is_public: false
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="create-goal-form">
      <h2>Create New Learning Goal</h2>
      
      <div className="form-group">
        <label htmlFor="title">
          Goal Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title', {
            required: 'Title is required',
            maxLength: {
              value: 255,
              message: 'Title must be less than 255 characters'
            },
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters'
            }
          })}
          className={errors.title ? 'error' : ''}
          placeholder="e.g., Master React Hooks"
          disabled={isLoading}
        />
        {errors.title && (
          <span className="field-error">{errors.title.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          className={errors.description ? 'error' : ''}
          placeholder="Describe your learning goal in detail..."
          rows="4"
          disabled={isLoading}
        />
        {errors.description && (
          <span className="field-error">{errors.description.message}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            {...register('category')}
            className={errors.category ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="">Select a category</option>
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
          {errors.category && (
            <span className="field-error">{errors.category.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="difficulty_level">Difficulty Level</label>
          <select
            id="difficulty_level"
            {...register('difficulty_level')}
            className={errors.difficulty_level ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
          {errors.difficulty_level && (
            <span className="field-error">{errors.difficulty_level.message}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="target_completion_date">Target Completion Date</label>
        <input
          type="date"
          id="target_completion_date"
          {...register('target_completion_date')}
          className={errors.target_completion_date ? 'error' : ''}
          min={new Date().toISOString().split('T')[0]}
          disabled={isLoading}
        />
        {errors.target_completion_date && (
          <span className="field-error">{errors.target_completion_date.message}</span>
        )}
      </div>

      <div className="form-group checkbox-group">
        <label htmlFor="is_public" className="checkbox-label">
          <input
            type="checkbox"
            id="is_public"
            {...register('is_public')}
            disabled={isLoading}
          />
          <span>Make this goal public (visible to other users)</span>
        </label>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
};

export default CreateGoalForm;
