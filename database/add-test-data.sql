-- Add test data to verify database is working
-- Run this in Supabase SQL Editor

-- Insert test albums
INSERT INTO albums (release_date, title, artist, dob, age, color, image, ranking, certification, streams)
VALUES 
  ('2025-01-15', 'The Chronic', 'Dr. Dre', 'December 15, 1992', '32', '#948C80', 'https://i.scdn.co/image/ab67616d0000b273db8c3f2f0a5e2c6c5e5c5e5c', '#1', '3× Platinum', '500M'),
  ('2025-01-15', 'Illmatic', 'Nas', 'April 19, 1994', '30', '#C77ACA', 'https://i.scdn.co/image/ab67616d0000b273f7f7f7f7f7f7f7f7f7f7f7f7', '#1', 'Platinum', '300M'),
  ('2025-01-20', 'Ready to Die', 'The Notorious B.I.G.', 'September 13, 1994', '30', '#007EE6', 'https://i.scdn.co/image/ab67616d0000b273a1a1a1a1a1a1a1a1a1a1a1a1', '#1', '4× Platinum', '600M'),
  ('2025-02-10', 'All Eyez on Me', '2Pac', 'February 13, 1996', '29', '#004294', 'https://i.scdn.co/image/ab67616d0000b273b2b2b2b2b2b2b2b2b2b2b2b2', '#1', 'Diamond', '1B'),
  ('2025-03-05', 'The Blueprint', 'Jay-Z', 'September 11, 2001', '24', '#FF6D27', 'https://i.scdn.co/image/ab67616d0000b273c3c3c3c3c3c3c3c3c3c3c3c3', '#1', '2× Platinum', '400M');

-- Verify albums were inserted
SELECT COUNT(*) as total_albums FROM albums;

-- Check the view
SELECT * FROM albums_by_month_day ORDER BY month, day;

-- Generate events for these albums
-- January 15
INSERT INTO events (event_date, name, txt_color, color)
VALUES 
  ('2025-01-15', 'Dr. Dre...', '#FFFFFF', '#948C80'),
  ('2025-01-15', 'Nas...', '#FFFFFF', '#C77ACA');

-- January 20
INSERT INTO events (event_date, name, txt_color, color)
VALUES 
  ('2025-01-20', 'The Notorious B.I.G....', '#FFFFFF', '#007EE6');

-- February 10
INSERT INTO events (event_date, name, txt_color, color)
VALUES 
  ('2025-02-10', '2Pac...', '#FFFFFF', '#004294');

-- March 5
INSERT INTO events (event_date, name, txt_color, color)
VALUES 
  ('2025-03-05', 'Jay-Z...', '#FFFFFF', '#FF6D27');

-- Verify events
SELECT COUNT(*) as total_events FROM events;
SELECT * FROM events ORDER BY event_date;

-- Check events view
SELECT * FROM events_by_month_day ORDER BY month, day;
