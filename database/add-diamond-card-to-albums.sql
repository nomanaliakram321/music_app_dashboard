-- Migration: Add generated diamond album card support
-- Run this in the Supabase SQL Editor before using the Diamond Album checkbox.

ALTER TABLE albums
ADD COLUMN IF NOT EXISTS diamond_card BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE VIEW albums_by_month_day AS
SELECT
  albums.*,
  EXTRACT(MONTH FROM release_date)::integer AS month,
  EXTRACT(DAY FROM release_date)::integer AS day
FROM albums
WHERE release_date IS NOT NULL;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'albums'
  AND column_name = 'diamond_card';
