-- =====================================================
-- ENABLE ROW LEVEL SECURITY FOR E-CELL DATABASE
-- This secures your database while keeping public read access
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES (Website Access)
-- =====================================================

-- Allow everyone to read published blogs
CREATE POLICY "Public can read published blogs" ON blogs
FOR SELECT USING (status = 'published');

-- Allow everyone to read active events
CREATE POLICY "Public can read active events" ON events
FOR SELECT USING (status IN ('upcoming', 'ongoing', 'completed'));

-- Allow everyone to read active advertisements
CREATE POLICY "Public can read active ads" ON advertisements
FOR SELECT USING (status = 'active');

-- Allow everyone to read public settings
CREATE POLICY "Public can read public settings" ON settings
FOR SELECT USING (is_public = true);

-- =====================================================
-- ADMIN POLICIES (Admin Panel Access)
-- =====================================================

-- Create a function to check if user is admin (using API key)
CREATE OR REPLACE FUNCTION is_admin_request()
RETURNS boolean AS $$
BEGIN
    -- Check if request has admin API key or service role
    RETURN auth.role() = 'service_role' OR 
           current_setting('request.jwt.claims', true)::json->>'role' = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin full access to all tables
CREATE POLICY "Admin full access to blogs" ON blogs
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to events" ON events
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to advertisements" ON advertisements
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to settings" ON settings
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to admin table" ON admin
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to sessions" ON admin_sessions
FOR ALL USING (is_admin_request());

CREATE POLICY "Admin full access to activity log" ON admin_activity_log
FOR ALL USING (is_admin_request());

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔒 Row Level Security Enabled Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Public Access:';
    RAISE NOTICE '• Published blogs - READ ONLY';
    RAISE NOTICE '• Active events - READ ONLY';
    RAISE NOTICE '• Active advertisements - READ ONLY';
    RAISE NOTICE '• Public settings - READ ONLY';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Admin Access:';
    RAISE NOTICE '• Full access with service role key';
    RAISE NOTICE '• All tables - READ/WRITE/DELETE';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT:';
    RAISE NOTICE '• Use SERVICE ROLE key in admin panel';
    RAISE NOTICE '• Use ANON key for public website';
    RAISE NOTICE '• Never expose service role key publicly';
END $$;