-- Migration 006: Create AI feedback table
-- Stores AI-generated feedback for user submissions

CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  feedback_type VARCHAR(50) DEFAULT 'general',
  overall_assessment TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  specific_suggestions TEXT[],
  code_quality_score INTEGER CHECK (code_quality_score >= 1 AND code_quality_score <= 10),
  meets_requirements BOOLEAN,
  next_steps TEXT[],
  ai_model VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add challenge_id column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'ai_feedback' AND column_name = 'challenge_id') THEN
    ALTER TABLE ai_feedback ADD COLUMN challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes (IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS idx_ai_feedback_submission_id ON ai_feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_challenge_id ON ai_feedback(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at ON ai_feedback(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_feedback_updated_at BEFORE UPDATE ON ai_feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();