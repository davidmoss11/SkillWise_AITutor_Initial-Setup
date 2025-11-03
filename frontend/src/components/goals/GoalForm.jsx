import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Goal creation validation schema
const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  target_date: z.string().optional(),
  type: z.enum(['skill', 'project', 'time', 'habit']).default('skill')
});

const GoalForm = ({ onSubmit, onCancel, initialData = null, isEdit = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      target_date: '',
      type: 'skill'
    }
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert target_date to ISO string if provided
      const formattedData = {
        ...data,
        target_date: data.target_date ? new Date(data.target_date).toISOString() : null
      };
      
      await onSubmit(formattedData);
      if (!isEdit) {
        reset(); // Clear form after successful creation
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="goal-form">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Goal Title *
          </label>
          <input
            id="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Enter your learning goal..."
            {...register('title')}
          />
          {errors.title && (
            <span className="error-message">{errors.title.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe your goal in detail..."
            rows="4"
            {...register('description')}
          />
          {errors.description && (
            <span className="error-message">{errors.description.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Goal Type
          </label>
          <select
            id="type"
            className={`form-select ${errors.type ? 'error' : ''}`}
            {...register('type')}
          >
            <option value="skill">Skill Development</option>
            <option value="project">Project Completion</option>
            <option value="time">Time-based Learning</option>
            <option value="habit">Learning Habit</option>
          </select>
          {errors.type && (
            <span className="error-message">{errors.type.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="target_date" className="form-label">
            Target Date (Optional)
          </label>
          <input
            id="target_date"
            type="date"
            className={`form-input ${errors.target_date ? 'error' : ''}`}
            {...register('target_date')}
          />
          {errors.target_date && (
            <span className="error-message">{errors.target_date.message}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Goal' : 'Create Goal')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;