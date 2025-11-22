import { useState } from 'react';
import { apiService } from '../../services/api';

const SubmissionForm = ({ onFeedback }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        submissionText,
        challengeContext: { fileName: file?.name },
      };
      const res = await apiService.ai.submitForFeedback(payload);
      onFeedback(res.data.feedback, res.data.metadata);
      setSubmissionText('');
      setFile(null);
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="submission-form"
      style={styles.form}
    >
      <h3>Submit Work for AI Feedback</h3>
      <textarea
        value={submissionText}
        onChange={(e) => setSubmissionText(e.target.value)}
        placeholder="Paste or type your solution here..."
        rows={6}
        required
        style={styles.textarea}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.file}
      />
      {error && <div style={styles.error}>{error}</div>}
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit for Feedback'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    border: '1px solid #ddd',
    padding: '1rem',
    borderRadius: '8px',
    background: '#fafafa',
  },
  textarea: { width: '100%', fontFamily: 'inherit', fontSize: '0.95rem' },
  file: {},
  error: { color: '#b00020', fontSize: '0.85rem' },
};

export default SubmissionForm;
