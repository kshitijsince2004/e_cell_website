-- Fix settings table RLS and ensure correct schema
-- Run this in the Supabase SQL Editor

-- 1. Fix the RLS policy (was blocking reads due to is_public column check)
DROP POLICY IF EXISTS "Public can read public settings" ON settings;

CREATE POLICY "Public can read public settings" ON settings
FOR SELECT
USING (true);

-- 2. Ensure the upsert works — setting_key must have a unique constraint
ALTER TABLE settings
ADD CONSTRAINT IF NOT EXISTS settings_setting_key_unique UNIQUE (setting_key);

-- 3. Seed default settings if they don't exist
INSERT INTO settings (setting_key, setting_value, is_public)
VALUES
    ('google_form_join_ecell', '', false),
    ('google_form_enabled', 'false', false),
    ('global_popup_enabled', 'false', true)
ON CONFLICT (setting_key) DO NOTHING;
