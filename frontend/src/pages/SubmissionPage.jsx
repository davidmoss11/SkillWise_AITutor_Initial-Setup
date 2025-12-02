import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import SubmissionForm from '../components/SubmissionForm';
import FeedbackDisplay from '../components/FeedbackDisplay';
import './SubmissionPage.css';

const SubmissionPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  // Load user's saved challenges on mount
  useEffect(() => {
    loadChallenges();
  }, []);

  // Load feedback history when challenge is selected
  useEffect(() => {
    if (selectedChallenge) {
      loadFeedbackHistory(selectedChallenge.id);
    }
  }, [selectedChallenge]);

  const loadChallenges = async () => {
    try {
      setIsLoadingChallenges(true);
      const response = await apiService.ai.getMyChallenges();
      
      if (response.data.success) {
        setChallenges(response.data.data.challenges || []);
      }
    } catch (err) {
      setError('Failed to load challenges');
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const loadFeedbackHistory = async (challengeId) => {
    try {
      setIsLoadingHistory(true);
      const response = await apiService.ai.getFeedbackHistory(challengeId);
      
      if (response.data.success) {
        setFeedbackHistory(response.data.data.feedback || []);
      }
    } catch (err) {
      // Error loading feedback history - silently fail
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmissionForm(false);
    setFeedbackResult(null);
  };

  const handleSubmissionSuccess = (data) => {
    setFeedbackResult(data);
    setShowSubmissionForm(false);
    
    // Reload feedback history
    if (selectedChallenge) {
      loadFeedbackHistory(selectedChallenge.id);
    }
  };

  const handleNewSubmission = () => {
    setShowSubmissionForm(true);
    setFeedbackResult(null);
  };

  return (
    <div className="submission-page">
      <div className="page-header">
        <h1>Submit Your Work for AI Feedback</h1>
        <p>Select a challenge and submit your solution to receive instant AI-powered feedback</p>
      </div>

      <div className="content-layout">
        {/* Sidebar - Challenge Selection */}
        <aside className="challenges-sidebar">
          <h2>Your Challenges</h2>
          
          {isLoadingChallenges ? (
            <div className="loading">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="empty-state">
              <p>No challenges yet!</p>
              <p>Generate some challenges first.</p>
            </div>
          ) : (
            <div className="challenges-list">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`challenge-item ${
                    selectedChallenge?.id === challenge.id ? 'selected' : ''
                  }`}
                  onClick={() => handleChallengeSelect(challenge)}
                >
                  <h3>{challenge.title}</h3>
                  <div className="challenge-meta">
                    <span className={`difficulty ${challenge.difficulty}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="category">{challenge.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {!selectedChallenge ? (
            <div className="empty-state-main">
              <h2>Select a Challenge</h2>
              <p>Choose a challenge from the sidebar to get started</p>
            </div>
          ) : (
            <>
              {/* Challenge Details */}
              <div className="challenge-details">
                <h2>{selectedChallenge.title}</h2>
                <div className="challenge-info">
                  <span className={`badge ${selectedChallenge.difficulty}`}>
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="badge">{selectedChallenge.category}</span>
                  <span className="badge">{selectedChallenge.points} points</span>
                </div>
                <div className="challenge-description">
                  <h3>Instructions</h3>
                  <p>{selectedChallenge.instructions}</p>
                </div>

                {!showSubmissionForm && !feedbackResult && (
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleNewSubmission}
                  >
                    Submit Your Solution
                  </button>
                )}
              </div>

              {/* Submission Form */}
              {showSubmissionForm && (
                <SubmissionForm
                  challengeId={selectedChallenge.id}
                  onSuccess={handleSubmissionSuccess}
                  onCancel={() => setShowSubmissionForm(false)}
                />
              )}

              {/* Feedback Display */}
              {feedbackResult && (
                <>
                  <FeedbackDisplay
                    feedback={feedbackResult.feedback}
                    processingTime={feedbackResult.processingTime}
                  />
                  <div className="feedback-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleNewSubmission}
                    >
                      Submit Another Solution
                    </button>
                  </div>
                </>
              )}

              {/* Feedback History */}
              {feedbackHistory.length > 0 && !showSubmissionForm && (
                <div className="feedback-history">
                  <h3>Previous Submissions</h3>
                  {isLoadingHistory ? (
                    <div className="loading">Loading history...</div>
                  ) : (
                    <div className="history-list">
                      {feedbackHistory.map((item, index) => (
                        <div key={item.id} className="history-item">
                          <div className="history-header">
                            <span className="submission-number">
                              Submission #{feedbackHistory.length - index}
                            </span>
                            <span className="submission-date">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {item.overall_assessment && (
                            <p className="history-preview">
                              {item.overall_assessment}
                            </p>
                          )}
                          {item.code_quality_score && (
                            <div className="history-score">
                              Score: {item.code_quality_score}/100
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SubmissionPage;
