-- FIX ALL PERMISSION ISSUES
-- Run this NOW in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon role (for public access)
GRANT ALL ON TABLE albums TO anon;
GRANT ALL ON TABLE events TO anon;
GRANT ALL ON TABLE favorites TO anon;
GRANT ALL ON TABLE profiles TO anon;
GRANT ALL ON TABLE app_users TO anon;

-- Grant all permissions to authenticated role
GRANT ALL ON TABLE albums TO authenticated;
GRANT ALL ON TABLE events TO authenticated;
GRANT ALL ON TABLE favorites TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE app_users TO authenticated;

-- Grant permissions on views
GRANT SELECT ON albums_by_month_day TO anon;
GRANT SELECT ON albums_by_month_day TO authenticated;
GRANT SELECT ON events_by_month_day TO anon;
GRANT SELECT ON events_by_month_day TO authenticated;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('albums', 'events', 'favorites', 'profiles', 'app_users');

-- Should all show: rowsecurity = false
