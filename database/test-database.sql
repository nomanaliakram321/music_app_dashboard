-- Test if database is working
-- Run this in Supabase SQL Editor

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('albums', 'events', 'favorites', 'profiles', 'app_users')
ORDER BY tablename;

-- 4. Count records in each table
SELECT 'albums' as table_name, COUNT(*) as count FROM albums
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'app_users', COUNT(*) FROM app_users;

-- 5. Test inserting a sample album
INSERT INTO albums (release_date, title, artist, color)
VALUES ('2025-01-15', 'Test Album', 'Test Artist', '#FF0000')
RETURNING *;

-- 6. Test the view
SELECT * FROM albums_by_month_day WHERE month = 1 AND day = 15;

-- 7. Delete test album
DELETE FROM albums WHERE title = 'Test Album';
