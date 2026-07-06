-- Migration: Create notification_logs table for push notification audit trail
-- Date: 2025-02-18
-- Description: Creates notification_logs table to track notification delivery metrics and history
-- Requirements: 9.1, 9.5

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'album_added',
  recipient_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for album lookups
-- Used when querying notification history for a specific album
CREATE INDEX IF NOT EXISTS idx_notification_logs_album 
ON notification_logs(album_id);

-- Create index for time-based queries
-- Used for monitoring, metrics, and log retention queries
-- Descending order for efficient recent-first queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_created 
ON notification_logs(created_at DESC);

-- Grant permissions to anon role (for public access)
GRANT ALL ON TABLE notification_logs TO anon;

-- Grant permissions to authenticated role
GRANT ALL ON TABLE notification_logs TO authenticated;

-- Verify the table was created
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notification_logs'
ORDER BY indexname;
