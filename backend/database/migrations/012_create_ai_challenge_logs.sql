-- Migration 012: Create AI challenge logs table for generated challenges
CREATE TABLE IF NOT EXISTS ai_challenge_logs (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_challenge_logs_created_at ON ai_challenge_logs(created_at);
