import { useState } from 'react';
import { apiService } from '../services/api';
import './SubmissionForm.css';

const SubmissionForm = ({ challengeId, onSuccess, onCancel }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionType, setSubmissionType] = useState('code');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      setError('Please enter your submission');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiService.ai.submitForFeedback({
        challengeId,
        submissionText,
        submissionType,
      });

      if (response.data.success) {
        // Call success callback with feedback data
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to submit. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submission-form">
      <h3>Submit Your Work for AI Feedback</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="submissionType">Submission Type:</label>
          <select
            id="submissionType"
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="code">Code</option>
            <option value="text">Text</option>
            <option value="documentation">Documentation</option>
            <option value="design">Design</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="submissionText">
            Your {submissionType === 'code' ? 'Code' : 'Submission'}:
          </label>
          <textarea
            id="submissionText"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder={
              submissionType === 'code'
                ? 'Paste your code here...'
                : 'Enter your submission here...'
            }
            rows={15}
            disabled={isSubmitting}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;
