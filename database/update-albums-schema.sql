-- Migration: Add custom link fields to albums table
-- Date: 2025-02-18
-- Description: Adds custom_link and custom_link_label columns to support additional music platform links

-- Add custom link field to albums table (if not already added)
ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_link TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_link_label TEXT DEFAULT 'Other';

-- Update existing albums to have default label if custom_link exists but label is null
UPDATE albums 
SET custom_link_label = 'Other' 
WHERE custom_link IS NOT NULL AND custom_link_label IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'albums' 
AND column_name IN ('custom_link', 'custom_link_label');
