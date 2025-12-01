import './FeedbackDisplay.css';
import './FeedbackDisplay.css';

const FeedbackDisplay = ({ feedback, processingTime }) => {
  if (!feedback) {
    return null;
  }

  return (
    <div className="feedback-display">
      <div className="feedback-header">
        <h3>🤖 AI Feedback</h3>
        {processingTime && (
          <span className="processing-time">
            Generated in {processingTime}ms
          </span>
        )}
      </div>

      {feedback.overall_assessment && (
        <div className="feedback-section overall-assessment">
          <h4>Overall Assessment</h4>
          <p>{feedback.overall_assessment}</p>
        </div>
      )}

      {feedback.code_quality_score !== null && feedback.code_quality_score !== undefined && (
        <div className="feedback-section quality-score">
          <h4>Code Quality Score</h4>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${feedback.code_quality_score}%` }}
            >
              {feedback.code_quality_score}/100
            </div>
          </div>
        </div>
      )}

      {feedback.meets_requirements !== null && feedback.meets_requirements !== undefined && (
        <div className={`feedback-section requirements-met ${feedback.meets_requirements ? 'success' : 'warning'}`}>
          <h4>Requirements</h4>
          <p>
            {feedback.meets_requirements
              ? '✅ Meets all requirements'
              : '⚠️ Does not meet all requirements'}
          </p>
        </div>
      )}

      {feedback.strengths && feedback.strengths.length > 0 && (
        <div className="feedback-section strengths">
          <h4>✨ Strengths</h4>
          <ul>
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
        <div className="feedback-section improvements">
          <h4>📈 Areas for Improvement</h4>
          <ul>
            {feedback.areas_for_improvement.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.specific_suggestions && feedback.specific_suggestions.length > 0 && (
        <div className="feedback-section suggestions">
          <h4>💡 Specific Suggestions</h4>
          <ul>
            {feedback.specific_suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.next_steps && feedback.next_steps.length > 0 && (
        <div className="feedback-section next-steps">
          <h4>🎯 Next Steps</h4>
          <ol>
            {feedback.next_steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
