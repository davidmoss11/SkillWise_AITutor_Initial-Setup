// TODO: Implement peer review and collaboration features
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import './PeerReviewPage.css';

const PeerReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review-others');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    strengths: '',
    improvements: '',
    specificFeedback: '',
    codeQuality: 5,
    creativity: 5,
    documentation: 5,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  // Mock data - TODO: Replace with API calls
  useEffect(() => {
    const mockReviews = [
      {
        id: 1,
        submissionId: 'sub_001',
        title: 'React Component Optimization',
        author: 'Sarah Kim',
        authorAvatar: '👩‍🎨',
        category: 'React',
        difficulty: 'Intermediate',
        submittedAt: '2024-01-15T10:00:00Z',
        description: 'Created a custom hook for data fetching with caching',
        codeSnippet: 'const useDataFetch = (url) => { ... }',
        needsReview: true,
        reviewsCount: 2,
        maxReviews: 3,
      },
      {
        id: 2,
        submissionId: 'sub_002',
        title: 'Algorithm Implementation',
        author: 'Mike Chen',
        authorAvatar: '👨‍🔬',
        category: 'Algorithms',
        difficulty: 'Advanced',
        submittedAt: '2024-01-14T15:30:00Z',
        description: 'Implemented merge sort with performance optimizations',
        codeSnippet: 'function mergeSort(arr) { ... }',
        needsReview: true,
        reviewsCount: 1,
        maxReviews: 3,
      },
      {
        id: 3,
        submissionId: 'sub_003',
        title: 'Database Design Pattern',
        author: 'Emma Rodriguez',
        authorAvatar: '👩‍💼',
        category: 'Database',
        difficulty: 'Intermediate',
        submittedAt: '2024-01-13T09:15:00Z',
        description: 'Repository pattern implementation with TypeORM',
        codeSnippet: 'class UserRepository extends Repository { ... }',
        needsReview: false,
        reviewsCount: 3,
        maxReviews: 3,
      },
    ];

    const mockMySubmissions = [
      {
        id: 1,
        submissionId: 'my_sub_001',
        title: 'CSS Grid Layout Challenge',
        category: 'CSS',
        difficulty: 'Beginner',
        submittedAt: '2024-01-12T14:20:00Z',
        status: 'under-review',
        reviewsReceived: 2,
        maxReviews: 3,
        averageRating: 4.5,
        feedback: 'Great responsive design approach!',
      },
      {
        id: 2,
        submissionId: 'my_sub_002',
        title: 'API Integration Pattern',
        category: 'JavaScript',
        difficulty: 'Intermediate',
        submittedAt: '2024-01-10T11:45:00Z',
        status: 'completed',
        reviewsReceived: 3,
        maxReviews: 3,
        averageRating: 4.7,
        feedback: 'Excellent error handling and clean code structure',
      },
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setMySubmissions(mockMySubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter(
    (review) =>
      selectedCategory === 'all' ||
      review.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      'under-review': { text: 'Under Review', className: 'status-pending' },
      completed: { text: 'Completed', className: 'status-completed' },
      'needs-revision': { text: 'Needs Revision', className: 'status-warning' },
    };
    const config = statusConfig[status] || {
      text: status,
      className: 'status-default',
    };
    return (
      <span className={`status-badge ${config.className}`}>{config.text}</span>
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: '#4CAF50',
      Intermediate: '#FF9800',
      Advanced: '#F44336',
    };
    return colors[difficulty] || '#757575';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleStartReview = (review) => {
    setReviewingSubmission(review);
    setReviewForm({
      rating: 5,
      strengths: '',
      improvements: '',
      specificFeedback: '',
      codeQuality: 5,
      creativity: 5,
      documentation: 5,
    });
  };

  const handleReviewFormChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitReview = async () => {
    if (
      !reviewForm.strengths ||
      !reviewForm.improvements ||
      !reviewForm.specificFeedback
    ) {
      alert('Please fill in all required feedback fields');
      return;
    }

    setIsSubmittingReview(true);

    // Simulate API call
    setTimeout(() => {
      // Update the reviews list to mark this submission as having one more review
      setReviews(
        reviews.map((r) =>
          r.id === reviewingSubmission.id
            ? {
                ...r,
                reviewsCount: r.reviewsCount + 1,
                needsReview: r.reviewsCount + 1 < r.maxReviews,
              }
            : r
        )
      );

      setIsSubmittingReview(false);
      setReviewingSubmission(null);
      alert(
        'Review submitted successfully! Thank you for helping your peer improve.'
      );
    }, 1500);
  };

  const handleCloseReviewModal = () => {
    if (
      window.confirm(
        'Are you sure you want to close? Your review will not be saved.'
      )
    ) {
      setReviewingSubmission(null);
    }
  };

  return (
    <div className="peer-review-page">
      <div className="page-header">
        <h1>Peer Review</h1>
        <p>Collaborate with fellow learners and improve together</p>
      </div>

      <div className="review-tabs">
        <button
          className={`tab-button ${
            activeTab === 'review-others' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('review-others')}
        >
          Review Others ({reviews.filter((r) => r.needsReview).length})
        </button>
        <button
          className={`tab-button ${
            activeTab === 'my-submissions' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('my-submissions')}
        >
          My Submissions ({mySubmissions.length})
        </button>
      </div>

      {activeTab === 'review-others' && (
        <div className="review-others-section">
          <div className="section-header">
            <h2>Help Others Improve</h2>
            <div className="filters">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="react">React</option>
                <option value="javascript">JavaScript</option>
                <option value="algorithms">Algorithms</option>
                <option value="css">CSS</option>
                <option value="database">Database</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading submissions for review..." />
          ) : (
            <div className="reviews-grid">
              {filteredReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="author-info">
                      <span className="author-avatar">
                        {review.authorAvatar}
                      </span>
                      <div>
                        <h4>{review.title}</h4>
                        <p>by {review.author}</p>
                      </div>
                    </div>
                    <div className="review-meta">
                      <span
                        className="difficulty-badge"
                        style={{
                          backgroundColor: getDifficultyColor(
                            review.difficulty
                          ),
                        }}
                      >
                        {review.difficulty}
                      </span>
                      <span className="category-badge">{review.category}</span>
                    </div>
                  </div>

                  <div className="review-content">
                    <p>{review.description}</p>
                    <div className="code-preview">
                      <code>{review.codeSnippet}</code>
                    </div>
                  </div>

                  <div className="review-footer">
                    <div className="review-stats">
                      <span className="time-ago">
                        {formatTimeAgo(review.submittedAt)}
                      </span>
                      <span className="reviews-count">
                        {review.reviewsCount}/{review.maxReviews} reviews
                      </span>
                    </div>

                    {review.needsReview ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleStartReview(review)}
                      >
                        Start Review
                      </button>
                    ) : (
                      <button className="btn-secondary" disabled>
                        Review Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No submissions available</h3>
                  <p>Check back later for new submissions to review!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-submissions' && (
        <div className="my-submissions-section">
          <div className="section-header">
            <h2>Your Submissions</h2>
            <button className="btn-primary">Submit New Work</button>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your submissions..." />
          ) : (
            <div className="submissions-list">
              {mySubmissions.map((submission) => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-header">
                    <div className="submission-info">
                      <h4>{submission.title}</h4>
                      <div className="submission-meta">
                        <span className="category-badge">
                          {submission.category}
                        </span>
                        <span
                          className="difficulty-badge"
                          style={{
                            backgroundColor: getDifficultyColor(
                              submission.difficulty
                            ),
                          }}
                        >
                          {submission.difficulty}
                        </span>
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                    <div className="submission-actions">
                      <button className="btn-secondary">View Details</button>
                    </div>
                  </div>

                  <div className="submission-stats">
                    <div className="stat-item">
                      <strong>{submission.reviewsReceived}</strong>
                      <span>Reviews Received</span>
                    </div>
                    <div className="stat-item">
                      <strong>{submission.averageRating}</strong>
                      <span>Average Rating</span>
                    </div>
                    <div className="stat-item">
                      <strong>{formatTimeAgo(submission.submittedAt)}</strong>
                      <span>Submitted</span>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="latest-feedback">
                      <h5>Latest Feedback:</h5>
                      <p>"{submission.feedback}"</p>
                    </div>
                  )}

                  <div className="progress-bar">
                    <div className="progress-label">
                      Review Progress: {submission.reviewsReceived}/
                      {submission.maxReviews}
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            (submission.reviewsReceived /
                              submission.maxReviews) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              {mySubmissions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📤</div>
                  <h3>No submissions yet</h3>
                  <p>
                    Submit your first piece of work to get feedback from peers!
                  </p>
                  <button className="btn-primary">Submit Your Work</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="review-tips">
        <h3>💡 Review Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Be Constructive</h4>
            <p>
              Focus on specific improvements and provide actionable feedback
            </p>
          </div>
          <div className="tip-card">
            <h4>Be Respectful</h4>
            <p>
              Remember there's a person behind the code. Be kind and encouraging
            </p>
          </div>
          <div className="tip-card">
            <h4>Be Specific</h4>
            <p>Point out exactly what works well and what could be improved</p>
          </div>
        </div>
      </div>

      {reviewingSubmission && (
        <div className="review-modal-overlay" onClick={handleCloseReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>Review Submission</h2>
              <button className="close-button" onClick={handleCloseReviewModal}>
                ×
              </button>
            </div>

            <div className="review-modal-content">
              <div className="submission-details">
                <div className="author-info">
                  <span className="author-avatar">
                    {reviewingSubmission.authorAvatar}
                  </span>
                  <div>
                    <h3>{reviewingSubmission.title}</h3>
                    <p>by {reviewingSubmission.author}</p>
                  </div>
                </div>
                <p className="submission-description">
                  {reviewingSubmission.description}
                </p>
                <div className="code-block">
                  <h4>Code Preview:</h4>
                  <pre>
                    <code>{reviewingSubmission.codeSnippet}</code>
                  </pre>
                </div>
              </div>

              <div className="review-form">
                <h3>Your Review</h3>

                <div className="rating-section">
                  <h4>Overall Rating</h4>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star ${
                          reviewForm.rating >= star ? 'active' : ''
                        }`}
                        onClick={() => handleReviewFormChange('rating', star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-text">{reviewForm.rating}/5</span>
                  </div>
                </div>

                <div className="detailed-ratings">
                  <h4>Detailed Assessment</h4>

                  <div className="rating-item">
                    <label>Code Quality</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={reviewForm.codeQuality}
                      onChange={(e) =>
                        handleReviewFormChange(
                          'codeQuality',
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <span>{reviewForm.codeQuality}/5</span>
                  </div>

                  <div className="rating-item">
                    <label>Creativity</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={reviewForm.creativity}
                      onChange={(e) =>
                        handleReviewFormChange(
                          'creativity',
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <span>{reviewForm.creativity}/5</span>
                  </div>

                  <div className="rating-item">
                    <label>Documentation</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={reviewForm.documentation}
                      onChange={(e) =>
                        handleReviewFormChange(
                          'documentation',
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <span>{reviewForm.documentation}/5</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>What are the strengths of this submission? *</label>
                  <textarea
                    rows="3"
                    placeholder="Highlight what the author did well..."
                    value={reviewForm.strengths}
                    onChange={(e) =>
                      handleReviewFormChange('strengths', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>What could be improved? *</label>
                  <textarea
                    rows="3"
                    placeholder="Provide constructive feedback for improvement..."
                    value={reviewForm.improvements}
                    onChange={(e) =>
                      handleReviewFormChange('improvements', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specific Technical Feedback *</label>
                  <textarea
                    rows="4"
                    placeholder="Point out specific code improvements, best practices, or alternative approaches..."
                    value={reviewForm.specificFeedback}
                    onChange={(e) =>
                      handleReviewFormChange('specificFeedback', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="review-guidelines">
                  <p>
                    <strong>Remember:</strong> Your feedback helps others grow.
                    Be specific, constructive, and kind.
                  </p>
                </div>
              </div>
            </div>

            <div className="review-modal-footer">
              <button
                className="btn-secondary"
                onClick={handleCloseReviewModal}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerReviewPage;
