-- Migration 012: Add goal link and status to challenges
ALTER TABLE IF EXISTS challenges
  ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'todo';

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_challenges_goal_id ON challenges(goal_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
