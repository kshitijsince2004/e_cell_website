-- MINIMAL RLS FIX - JUST THE ESSENTIALS

-- Disable RLS on main tables
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Drop the problematic function
DROP FUNCTION IF EXISTS is_admin_request() CASCADE;

-- That's it! Your admin panel should now work.