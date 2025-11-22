-- Migration 013: Add prompt & response columns to ai_feedback for Sprint 3 storage
ALTER TABLE ai_feedback
  ADD COLUMN IF NOT EXISTS prompt TEXT,
  ADD COLUMN IF NOT EXISTS response TEXT;

-- Optional index on created_at already exists; no extra required.
