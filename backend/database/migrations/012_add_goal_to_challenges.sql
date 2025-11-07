-- Migration 012: Add goal_id to challenges table to link challenges with goals
-- This establishes the relationship where challenges can be associated with specific learning goals

-- Add goal_id column to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_challenges_goal_id ON challenges(goal_id);

-- Add comment for documentation
COMMENT ON COLUMN challenges.goal_id IS 'Links challenge to a specific user goal for progress tracking';
