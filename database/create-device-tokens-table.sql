-- Migration: Create device_tokens table for push notifications
-- Date: 2025-02-18
-- Description: Creates device_tokens table to store FCM tokens for mobile push notifications
-- Requirements: 2.4, 2.6

-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  fcm_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying active tokens with notifications enabled
-- This is the primary query path for sending notifications
CREATE INDEX IF NOT EXISTS idx_device_tokens_active 
ON device_tokens(is_active, notifications_enabled) 
WHERE is_active = true AND notifications_enabled = true;

-- Create index for user lookups
-- Used when querying all tokens for a specific user
CREATE INDEX IF NOT EXISTS idx_device_tokens_user 
ON device_tokens(user_id);

-- Create index for device lookups
-- Used when registering/updating tokens for a specific device
CREATE INDEX IF NOT EXISTS idx_device_tokens_device 
ON device_tokens(device_id);

-- Grant permissions to anon role (for public access)
GRANT ALL ON TABLE device_tokens TO anon;

-- Grant permissions to authenticated role
GRANT ALL ON TABLE device_tokens TO authenticated;

-- Verify the table was created
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'device_tokens'
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'device_tokens'
ORDER BY indexname;
