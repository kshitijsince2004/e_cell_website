-- =====================================================
-- ENABLE ROW LEVEL SECURITY FOR E-CELL DATABASE
-- This secures your database with proper authentication
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read published blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can manage blogs" ON blogs;
DROP POLICY IF EXISTS "Public can read active events" ON events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON events;
DROP POLICY IF EXISTS "Public can read active ads" ON advertisements;
DROP POLICY IF EXISTS "Authenticated users can manage ads" ON advertisements;
DROP POLICY IF EXISTS "Public can read public settings" ON settings;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON settings;

-- =====================================================
-- BLOGS POLICIES
-- =====================================================

-- Public: Read published blogs only
CREATE POLICY "Public can read published blogs" ON blogs
FOR SELECT
USING (status = 'published');

-- Authenticated: Full access to all blogs if they have an active admin profile
CREATE POLICY "Authenticated users can manage blogs" ON blogs
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'));

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

-- Public: Read active events only
CREATE POLICY "Public can read active events" ON events
FOR SELECT
USING (status IN ('upcoming', 'ongoing', 'completed'));

-- Authenticated: Full access to all events if they have an active admin profile
CREATE POLICY "Authenticated users can manage events" ON events
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'));

-- =====================================================
-- ADVERTISEMENTS POLICIES
-- =====================================================

-- Public: Read active advertisements only
CREATE POLICY "Public can read active ads" ON advertisements
FOR SELECT
USING (status = 'active');

-- Authenticated: Full access to all advertisements if they have an active admin profile
CREATE POLICY "Authenticated users can manage ads" ON advertisements
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'));

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================

-- Public: Read all settings (key-value table, no sensitive data)
CREATE POLICY "Public can read public settings" ON settings
FOR SELECT
USING (true);

-- Authenticated: Full access to all settings if they have an active admin profile
CREATE POLICY "Authenticated users can manage settings" ON settings
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND status = 'active'));

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔒 Row Level Security Enabled Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Public Access (ANON key):';
    RAISE NOTICE '• Published blogs - READ ONLY';
    RAISE NOTICE '• Active events - READ ONLY';
    RAISE NOTICE '• Active advertisements - READ ONLY';
    RAISE NOTICE '• Public settings - READ ONLY';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Authenticated Access:';
    RAISE NOTICE '• All tables - FULL READ/WRITE/DELETE';
    RAISE NOTICE '• Must be logged in via Supabase Auth';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NEXT STEPS:';
    RAISE NOTICE '1. Create admin users in Supabase Auth dashboard';
    RAISE NOTICE '2. Use email/password authentication';
    RAISE NOTICE '3. Never expose service role key in client code';
END $$;
