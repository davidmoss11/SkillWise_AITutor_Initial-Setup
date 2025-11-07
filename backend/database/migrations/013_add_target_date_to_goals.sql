-- Migration 013: Add target_date column to goals to satisfy rubric (distinct from target_completion_date)
ALTER TABLE IF EXISTS goals
  ADD COLUMN IF NOT EXISTS target_date DATE;

-- Backfill target_date from existing target_completion_date if target_date is NULL
UPDATE goals SET target_date = target_completion_date WHERE target_date IS NULL;

-- Index for target_date lookups
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
