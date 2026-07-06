-- Debug queries to check what's wrong
-- Run these one by one in Supabase SQL Editor

-- 1. Check if albums exist
SELECT COUNT(*) as total_albums FROM albums;
SELECT * FROM albums LIMIT 5;

-- 2. Check if views work
SELECT COUNT(*) as total_in_view FROM albums_by_month_day;
SELECT * FROM albums_by_month_day LIMIT 5;

-- 3. Check specific month query (January)
SELECT * FROM albums_by_month_day WHERE month = 1 ORDER BY day;

-- 4. Check if events exist
SELECT COUNT(*) as total_events FROM events;
SELECT * FROM events LIMIT 5;

-- 5. Check RLS status (should all be false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('albums', 'events', 'favorites', 'profiles', 'app_users');

-- 6. Test the exact query the Albums page uses
SELECT * FROM albums 
ORDER BY release_date 
LIMIT 20 OFFSET 0;

-- 7. Test the exact query the Calendar page uses (January)
SELECT * FROM albums_by_month_day 
WHERE month = 1 
ORDER BY artist;

-- 8. Check for any NULL release_dates
SELECT COUNT(*) as albums_with_null_date 
FROM albums 
WHERE release_date IS NULL;

-- 9. Check date format
SELECT id, title, artist, release_date, 
       EXTRACT(MONTH FROM release_date) as month,
       EXTRACT(DAY FROM release_date) as day
FROM albums 
LIMIT 5;
