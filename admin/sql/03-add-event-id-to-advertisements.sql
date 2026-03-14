-- Add event_id column to advertisements table
-- Run this in the Supabase SQL Editor

ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id) ON DELETE SET NULL;

-- Optional index for faster lookups
CREATE INDEX IF NOT EXISTS idx_advertisements_event_id ON advertisements(event_id);
