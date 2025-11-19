import React, { useState } from 'react';
import './GenerateChallengeModal.css';

const GenerateChallengeModal = ({ isOpen, onClose, onChallengeGenerated }) => {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'intermediate',
    language: 'JavaScript',
    skillLevel: 'intermediate'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/ai/generateChallenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate challenge');
      }

      setGeneratedChallenge(data.challenge);
      
      if (onChallengeGenerated) {
        onChallengeGenerated(data.challenge);
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
      setError(err.message || 'Failed to generate challenge');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      topic: '',
      difficulty: 'intermediate',
      language: 'JavaScript',
      skillLevel: 'intermediate'
    });
    setGeneratedChallenge(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 Generate AI Challenge</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {!generatedChallenge ? (
            <div className="challenge-form">
              <div className="form-group">
                <label htmlFor="topic">
                  Topic <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Array manipulation, API integration, React hooks"
                  className="form-input"
                  disabled={isGenerating}
                />
                <small className="form-hint">
                  What programming concept would you like to practice?
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isGenerating}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isGenerating}
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skillLevel">Your Skill Level</label>
                <select
                  id="skillLevel"
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={isGenerating}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <small className="form-hint">
                  This helps tailor the challenge to your experience level
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
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
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
                      <span>✨</span> Generate Challenge
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="challenge-result">
              <div className="challenge-header">
                <h3>{generatedChallenge.title}</h3>
                <span className={`difficulty-badge ${generatedChallenge.difficulty}`}>
                  {generatedChallenge.difficulty}
                </span>
              </div>

              <div className="challenge-section">
                <h4>📝 Description</h4>
                <p>{generatedChallenge.description}</p>
              </div>

              {generatedChallenge.requirements && generatedChallenge.requirements.length > 0 && (
                <div className="challenge-section">
                  <h4>✅ Requirements</h4>
                  <ul>
                    {generatedChallenge.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedChallenge.starterCode && (
                <div className="challenge-section">
                  <h4>💻 Starter Code</h4>
                  <pre className="code-block">
                    <code>{generatedChallenge.starterCode}</code>
                  </pre>
                </div>
              )}

              {generatedChallenge.testCases && generatedChallenge.testCases.length > 0 && (
                <div className="challenge-section">
                  <h4>🧪 Test Cases</h4>
                  <div className="test-cases">
                    {generatedChallenge.testCases.slice(0, 3).map((testCase, index) => (
                      <div key={index} className="test-case">
                        <strong>Input:</strong> {JSON.stringify(testCase.input)}
                        <br />
                        <strong>Expected:</strong> {JSON.stringify(testCase.output)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedChallenge.estimatedTime && (
                <div className="challenge-meta">
                  <span className="meta-item">
                    ⏱️ Estimated time: {generatedChallenge.estimatedTime} minutes
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setGeneratedChallenge(null)}
                  className="btn-secondary"
                >
                  Generate Another
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-primary"
                >
                  Start Challenge
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
