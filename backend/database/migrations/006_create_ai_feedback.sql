-- Migration 006: Create AI feedback table for AI-generated responses
-- Stores AI feedback for code submissions including prompts, responses, and metadata

CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,  -- The AI prompt sent
  response TEXT NOT NULL,  -- The full AI response (JSON)
  score INTEGER CHECK (score >= 0 AND score <= 100),  -- Overall score (0-100)
  feedback_data JSONB,  -- Structured feedback (strengths, improvements, bugs, etc.)
  ai_model VARCHAR(50),  -- Model used (e.g., 'gpt-4', 'gpt-3.5-turbo')
  tokens_used INTEGER,  -- Number of tokens consumed
  processing_time_ms INTEGER,  -- Processing time in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_ai_feedback_submission_id ON ai_feedback(submission_id);
CREATE INDEX idx_ai_feedback_score ON ai_feedback(score);
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at DESC);
CREATE INDEX idx_ai_feedback_data ON ai_feedback USING GIN (feedback_data);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_feedback_updated_at BEFORE UPDATE ON ai_feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE ai_feedback IS 'Stores AI-generated feedback for code submissions';