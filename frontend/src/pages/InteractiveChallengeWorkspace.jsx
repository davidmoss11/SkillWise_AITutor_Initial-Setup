import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './InteractiveChallengeWorkspace.css';

const InteractiveChallengeWorkspace = () => {
  // State management with React hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

  // Handle code submission to AI
  useEffect(() => {
    loadChallenge();
    loadFeedbackHistory();
  }, [id]);

  const loadChallenge = async () => {
    try {
      setIsLoadingChallenge(true);
      const response = await apiService.challenges.getById(id);
      setChallenge(response.data.challenge);

      // Set starter code if available
      if (response.data.challenge.starter_code) {
        setCode(response.data.challenge.starter_code);
      }
    } catch (err) {
      console.error('Error loading challenge:', err);
      setError('Failed to load challenge');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const loadFeedbackHistory = async () => {
    try {
      const response = await apiService.ai.getFeedbackHistory(id);
      if (response.data.data && response.data.data.feedback) {
        setFeedbackHistory(response.data.data.feedback);
      }
    } catch (err) {
      console.error('Error loading feedback history:', err);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setFeedback(null);

      const response = await apiService.ai.submitForFeedback({
        submissionText: code,
        challengeId: challenge.id,
      });

      if (response.data.success) {
        setFeedback(response.data.data.feedback);
        // Reload history to show new submission
        loadFeedbackHistory();
      }
    } catch (err) {
      console.error('Error submitting code:', err);
      setError('Failed to get AI feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleReset = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCode(challenge.starter_code || '');
      setFeedback(null);
      setError('');
    }
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleLoadPreviousSubmission = (historicalFeedback) => {
    if (window.confirm('Load this previous submission?')) {
      // Note: We don't have the original submission code stored yet
      // For now, just show the feedback
      setFeedback({
        overall_assessment: historicalFeedback.overall_assessment,
        strengths: historicalFeedback.strengths,
        areas_for_improvement: historicalFeedback.areas_for_improvement,
        specific_suggestions: historicalFeedback.specific_suggestions,
        code_quality_score: historicalFeedback.code_quality_score,
        meets_requirements: historicalFeedback.meets_requirements,
        next_steps: historicalFeedback.next_steps,
      });
      setShowHistory(false);
    }
  };

  if (isLoadingChallenge) {
    return (
      <div className="workspace-loading">
        <div className="spinner"></div>
        <p>Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="workspace-error">
        <h2>Challenge not found</h2>
        <button onClick={() => navigate('/challenges')} className="btn-back">
          Back to Challenges
        </button>
      </div>
    );
  }

  return (
    <div className="interactive-workspace">
      {/* Header */}
      <div className="workspace-header">
        <button onClick={() => navigate('/challenges')} className="btn-back">
          ← Back to Challenges
        </button>
        <div className="challenge-info">
          <h1>{challenge.title}</h1>
          <div className="challenge-meta">
            <span className={`badge badge-${challenge.difficulty_level}`}>
              {challenge.difficulty_level}
            </span>
            <span className="badge badge-category">{challenge.category}</span>
            {challenge.estimated_time_minutes && (
              <span className="badge badge-time">
                ⏱ {challenge.estimated_time_minutes} min
              </span>
            )}
            {challenge.points_reward && (
              <span className="badge badge-points">
                🏆 {challenge.points_reward} pts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="workspace-content">
        {/* Left Panel - Challenge Description */}
        <div className="panel panel-description">
          <div className="panel-header">
            <h2>📋 Challenge Description</h2>
          </div>
          <div className="panel-body">
            {challenge.description && (
              <div className="section">
                <h3>Overview</h3>
                <p>{challenge.description}</p>
              </div>
            )}

            {challenge.instructions && (
              <div className="section">
                <h3>Instructions</h3>
                <div className="instructions-content">
                  {challenge.instructions}
                </div>
              </div>
            )}

            {challenge.learning_objectives &&
              challenge.learning_objectives.length > 0 && (
                <div className="section">
                  <h3>🎯 Learning Objectives</h3>
                  <ul>
                    {challenge.learning_objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

            {challenge.test_cases && challenge.test_cases.length > 0 && (
              <div className="section">
                <h3>✅ Test Cases</h3>
                <div className="test-cases">
                  {challenge.test_cases.map((testCase, idx) => (
                    <div key={idx} className="test-case">
                      <div>
                        <strong>Input:</strong> {testCase.input}
                      </div>
                      <div>
                        <strong>Expected:</strong> {testCase.expected_output}
                      </div>
                      {testCase.description && (
                        <div className="test-description">
                          {testCase.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor & Feedback */}
        <div className="panel panel-workspace">
          {/* Code Editor */}
          <div className="panel-section">
            <div className="panel-header">
              <h2>💻 Your Solution</h2>
              <div className="editor-actions">
                <button onClick={handleReset} className="btn-secondary btn-sm">
                  🔄 Reset
                </button>
                {feedbackHistory.length > 0 && (
                  <button
                    onClick={handleViewHistory}
                    className="btn-secondary btn-sm"
                  >
                    📜 History ({feedbackHistory.length})
                  </button>
                )}
              </div>
            </div>
            <div className="panel-body">
              <textarea
                className="code-editor"
                value={code}
                onChange={handleCodeChange}
                placeholder="// Write your solution here..."
                spellCheck={false}
              />
              <div className="editor-footer">
                <button
                  onClick={handleSubmitCode}
                  className="btn-primary btn-submit"
                  disabled={isSubmitting || !code.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-sm"></span>
                      Getting AI Feedback...
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      Submit for AI Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* AI Feedback */}
          {feedback && (
            <div className="panel-section feedback-section">
              <div className="panel-header">
                <h2>🤖 AI Feedback</h2>
              </div>
              <div className="panel-body">
                {/* Overall Assessment */}
                <div className="feedback-item feedback-overall">
                  <div className="feedback-header">
                    <h3>Overall Assessment</h3>
                    {feedback.code_quality_score && (
                      <div className="quality-score">
                        <span className="score-value">
                          {feedback.code_quality_score}/10
                        </span>
                        <div className="score-bar">
                          <div
                            className="score-fill"
                            style={{
                              width: `${feedback.code_quality_score * 10}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p>{feedback.overall_assessment}</p>
                  {feedback.meets_requirements !== undefined && (
                    <div
                      className={`requirements-badge ${
                        feedback.meets_requirements ? 'success' : 'warning'
                      }`}
                    >
                      {feedback.meets_requirements
                        ? '✅ Meets Requirements'
                        : '⚠️ Needs Improvement'}
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="feedback-item feedback-strengths">
                    <h3>💪 Strengths</h3>
                    <ul>
                      {feedback.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {feedback.areas_for_improvement &&
                  feedback.areas_for_improvement.length > 0 && (
                    <div className="feedback-item feedback-improvements">
                      <h3>📈 Areas for Improvement</h3>
                      <ul>
                        {feedback.areas_for_improvement.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Specific Suggestions */}
                {feedback.specific_suggestions &&
                  feedback.specific_suggestions.length > 0 && (
                    <div className="feedback-item feedback-suggestions">
                      <h3>💡 Specific Suggestions</h3>
                      <ul>
                        {feedback.specific_suggestions.map(
                          (suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Next Steps */}
                {feedback.next_steps && feedback.next_steps.length > 0 && (
                  <div className="feedback-item feedback-next-steps">
                    <h3>🎯 Next Steps</h3>
                    <ul>
                      {feedback.next_steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission History Modal */}
          {showHistory && (
            <div className="history-modal">
              <div className="history-content">
                <div className="history-header">
                  <h2>📜 Submission History</h2>
                  <button onClick={handleViewHistory} className="btn-close">
                    ×
                  </button>
                </div>
                <div className="history-list">
                  {feedbackHistory.length === 0 ? (
                    <p className="no-history">No previous submissions yet</p>
                  ) : (
                    feedbackHistory.map((item, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-item-header">
                          <span className="history-date">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                          <span className="history-score">
                            Score: {item.code_quality_score}/10
                          </span>
                        </div>
                        <p className="history-assessment">
                          {item.overall_assessment}
                        </p>
                        <button
                          onClick={() => handleLoadPreviousSubmission(item)}
                          className="btn-secondary btn-sm"
                        >
                          View Feedback
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div
                className="history-backdrop"
                onClick={handleViewHistory}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveChallengeWorkspace;
