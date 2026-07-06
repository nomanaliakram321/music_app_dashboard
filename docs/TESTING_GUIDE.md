# Push Notifications Testing Guide

## ✅ Firebase Configuration Complete!

Your Firebase Cloud Messaging is now properly configured and ready to use.

## Configuration Summary

- **Project ID**: music-app-10f66
- **Client Email**: firebase-adminsdk-fbsvc@music-app-10f66.iam.gserviceaccount.com
- **Private Key**: ✅ Configured (1704 characters)
- **Firebase Admin SDK**: ✅ Initialized successfully

## How to Test the System

### Option 1: Test Through Your UI (Recommended)

1. **Start your development server**:

   ```cmd
   npm run dev
   ```

2. **Create an album** using either:
   - Single upload: Navigate to the Upload page and create an album
   - Batch upload: Use the CSV Upload feature

3. **Check the database** to verify notifications were logged:

   ```sql
   SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5;
   ```

4. **Verify device tokens** (if you have any registered):
   ```sql
   SELECT * FROM device_tokens WHERE is_active = true;
   ```

### Option 2: Manual Database Testing

1. **Insert a test device token**:

   ```sql
   INSERT INTO device_tokens (device_id, fcm_token, platform, is_active, notifications_enabled)
   VALUES ('test-device-001', 'fake-fcm-token-for-testing', 'ios', true, true);
   ```

2. **Create an album** through your UI

3. **Check notification logs**:
   ```sql
   SELECT
     nl.notification_type,
     nl.recipient_count,
     nl.success_count,
     nl.failure_count,
     a.title,
     a.artist
   FROM notification_logs nl
   JOIN albums a ON nl.album_id = a.id
   ORDER BY nl.created_at DESC;
   ```

### Option 3: Test Firebase Configuration Only

Run the configuration test script:

```cmd
npx tsx test-firebase-config.ts
```

This validates your Firebase credentials without requiring database access.

## What Happens When You Create an Album

1. **Album is created** in the database
2. **Notification service is triggered** automatically (non-blocking)
3. **Active device tokens are queried** from the database
4. **FCM notifications are sent** to all active, opted-in devices
5. **Results are logged** in the `notification_logs` table
6. **Invalid tokens are marked inactive** automatically

## Expected Behavior

### With No Device Tokens

- Album creation succeeds ✅
- Notification log shows 0 recipients ✅
- No errors occur ✅

### With Test/Fake Tokens

- Album creation succeeds ✅
- Notification attempt is made ✅
- FCM returns "invalid token" error ✅
- Tokens are marked as inactive ✅
- Notification log shows failures ✅

### With Real FCM Tokens (from mobile app)

- Album creation succeeds ✅
- Notifications are sent successfully ✅
- Mobile devices receive push notifications ✅
- Notification log shows successes ✅

## Monitoring Notifications

### Check Recent Notifications

```sql
SELECT
  created_at,
  notification_type,
  recipient_count,
  success_count,
  failure_count,
  payload->>'notification'->>'title' as title
FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Check Success Rate

```sql
SELECT
  COUNT(*) as total_notifications,
  SUM(success_count) as total_successes,
  SUM(failure_count) as total_failures,
  ROUND(100.0 * SUM(success_count) / NULLIF(SUM(recipient_count), 0), 2) as success_rate_percent
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Check Active Devices

```sql
SELECT
  platform,
  COUNT(*) as device_count,
  SUM(CASE WHEN notifications_enabled THEN 1 ELSE 0 END) as opted_in_count
FROM device_tokens
WHERE is_active = true
GROUP BY platform;
```

## Mobile App Integration

When you're ready to integrate with your mobile app, refer to:

- `src/api/mobile-device-registration-example.md` - Device registration flow
- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `src/api/mobile.ts` - API endpoints for device management

### Mobile App Endpoints

1. **Register Device**: `POST /api/mobile/register-device`
2. **Update Preferences**: `PUT /api/mobile/update-preferences`
3. **Unregister Device**: `DELETE /api/mobile/unregister-device`

## Troubleshooting

### Notifications Not Being Sent

1. Check if FCM is initialized:

   ```cmd
   npx tsx test-firebase-config.ts
   ```

2. Check for errors in your development server console

3. Verify environment variables are loaded:
   - Restart your dev server after updating `.env`

### Database Connection Issues

1. Verify Supabase credentials in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Check database tables exist:

   ```sql
   \dt device_tokens
   \dt notification_logs
   ```

3. Run migrations if needed:
   ```cmd
   psql -h your-host -U your-user -d your-db -f create-device-tokens-table.sql
   psql -h your-host -U your-user -d your-db -f create-notification-logs-table.sql
   ```

### Invalid Token Errors

This is expected behavior when using fake/test tokens. The system will:

- Mark the token as inactive
- Log the failure
- Continue processing other tokens
- Album creation still succeeds

## Next Steps

1. ✅ Firebase is configured and working
2. ✅ Backend notification system is implemented
3. ✅ Database schema is in place
4. ✅ API endpoints are ready

**Ready for mobile integration!**

When you build your mobile app:

1. Implement FCM token registration
2. Call the device registration API
3. Handle incoming notifications
4. Implement deep linking to album details

All backend infrastructure is complete and tested!
