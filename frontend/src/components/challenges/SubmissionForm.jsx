import React, { useState } from 'react';
import './SubmissionForm.css';

const SubmissionForm = ({ 
  challengeTitle, 
  challengeId, 
  requirements = [],
  language = 'JavaScript',
  onSubmitSuccess 
}) => {
  const [submissionType, setSubmissionType] = useState('code'); // 'code' or 'file'
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.js', '.py', '.java', '.cpp', '.ts', '.jsx', '.tsx'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError(`Invalid file type. Please upload one of: ${validExtensions.join(', ')}`);
        setFile(null);
        return;
      }

      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
        setFile(selectedFile);
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setFile(null);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter your code or upload a file');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setFeedback(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/ai/submitForFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code.trim(),
          challengeId,
          challengeTitle,
          requirements,
          language
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit code');
      }

      setFeedback(data.feedback);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
    } catch (err) {
      console.error('Error submitting code:', err);
      setError(err.message || 'Failed to submit code for feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setFile(null);
    setFeedback(null);
    setError('');
    setSubmissionType('code');
  };

  return (
    <div className="submission-form">
      <div className="submission-header">
        <h3>📝 Submit Your Solution</h3>
        <p className="submission-subtitle">
          Get AI-powered feedback on your code
        </p>
      </div>

      {!feedback ? (
        <form onSubmit={handleSubmit}>
          <div className="submission-type-selector">
            <button
              type="button"
              className={`type-btn ${submissionType === 'code' ? 'active' : ''}`}
              onClick={() => setSubmissionType('code')}
            >
              💻 Write Code
            </button>
            <button
              type="button"
              className={`type-btn ${submissionType === 'file' ? 'active' : ''}`}
              onClick={() => setSubmissionType('file')}
            >
              📁 Upload File
            </button>
          </div>

          {submissionType === 'code' ? (
            <div className="form-group">
              <label htmlFor="code-input">
                Your Code <span className="required">*</span>
              </label>
              <textarea
                id="code-input"
                className="code-textarea"
                value={code}
                onChange={handleCodeChange}
                placeholder={`// Write your ${language} code here...\n\nfunction solution() {\n  // Your implementation\n}`}
                rows={15}
                disabled={isSubmitting}
                spellCheck={false}
              />
              <div className="code-info">
                <span className="language-badge">{language}</span>
                <span className="char-count">{code.length} characters</span>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="file-input">
                Upload Code File <span className="required">*</span>
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  accept=".js,.py,.java,.cpp,.ts,.jsx,.tsx"
                  disabled={isSubmitting}
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-upload-label">
                  {file ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <strong>{file.name}</strong>
                        <small>{(file.size / 1024).toFixed(2)} KB</small>
                      </div>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📤</span>
                      <span>Click to upload or drag and drop</span>
                      <small>Supported: .js, .py, .java, .cpp, .ts, .jsx, .tsx</small>
                    </div>
                  )}
                </label>
              </div>
              
              {file && code && (
                <div className="code-preview">
                  <div className="preview-header">
                    <span>Preview:</span>
                    <button
                      type="button"
                      onClick={() => setSubmissionType('code')}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </div>
                  <pre className="preview-code">
                    <code>{code.substring(0, 500)}{code.length > 500 ? '...' : ''}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="submission-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !code.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Analyzing Code...
                </>
              ) : (
                <>
                  <span>🚀</span> Submit for Feedback
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="feedback-result">
          <div className="feedback-header">
            <div className="score-display">
              <div className={`score-circle score-${getScoreClass(feedback.score)}`}>
                <span className="score-value">{feedback.score}</span>
                <span className="score-label">/100</span>
              </div>
              <div className="score-status">
                <h4>{feedback.passed ? '✅ Passed' : '❌ Needs Work'}</h4>
                <p className="code-quality">
                  Code Quality: <strong>{feedback.codeQuality}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="feedback-summary">
            <h4>📊 Summary</h4>
            <p>{feedback.summary}</p>
          </div>

          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="feedback-section strengths">
              <h4>💪 Strengths</h4>
              <ul>
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="feedback-section improvements">
              <h4>🎯 Areas for Improvement</h4>
              <ul>
                {feedback.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.bugs && feedback.bugs.length > 0 && (
            <div className="feedback-section bugs">
              <h4>🐛 Bugs Found</h4>
              <ul>
                {feedback.bugs.map((bug, index) => (
                  <li key={index}>{bug}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.bestPractices && feedback.bestPractices.length > 0 && (
            <div className="feedback-section best-practices">
              <h4>✨ Best Practices</h4>
              <ul>
                {feedback.bestPractices.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="feedback-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn-primary"
            >
              Submit Another Solution
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get score class for styling
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
};

export default SubmissionForm;
