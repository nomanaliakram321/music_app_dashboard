# Device Registration Endpoint - Usage Example

## Overview

The device registration endpoint allows mobile clients to register their FCM tokens for push notifications. It implements upsert logic, meaning it will create a new token record or update an existing one based on the device_id.

## API Function

```typescript
import { registerDevice } from "@/api/mobile";

// Register a new device (anonymous user)
const result = await registerDevice({
  device_id: "unique-device-identifier",
  fcm_token: "fcm-token-from-firebase",
  platform: "ios", // or "android"
});

// Register a device with authenticated user
const result = await registerDevice({
  device_id: "unique-device-identifier",
  fcm_token: "fcm-token-from-firebase",
  platform: "android",
  user_id: "authenticated-user-id", // optional
});
```

## Response Format

### Success Response

```typescript
{
  data: {
    success: true,
    token_id: "uuid-of-device-token-record"
  },
  error: null
}
```

### Error Response

```typescript
{
  data: null,
  error: Error // Error object with message
}
```

## Behavior

### First-Time Registration (Create)

When a device registers for the first time:

- A new record is created in the `device_tokens` table
- `is_active` is set to `true`
- `notifications_enabled` is set to `true` (default opt-in)
- Timestamps are set for `created_at`, `updated_at`, and `last_used_at`

### Subsequent Registration (Update)

When a device re-registers (same `device_id`):

- The existing record is updated with the new `fcm_token`
- `platform` is updated (in case device OS changed)
- `user_id` is updated (for authentication association)
- `is_active` is set to `true` (reactivates inactive tokens)
- `updated_at` and `last_used_at` are refreshed

## Validation

The endpoint validates:

1. **Required fields**: `device_id`, `fcm_token`, and `platform` must be provided
2. **Platform values**: Must be either "ios" or "android"

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 2.3**: Mobile client sends Device_Token to backend for storage
- **Requirement 2.4**: System associates each Device_Token with authenticated user account
- **Requirement 2.5**: Mobile client updates backend when Device_Token changes or expires

## Database Schema

The endpoint interacts with the `device_tokens` table:

```sql
CREATE TABLE device_tokens (
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
```

## Mobile Client Integration

### React Native / Expo Example

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerDevice } from "./api/mobile";

async function registerForPushNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Notification permissions not granted");
    return;
  }

  // Get FCM token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Get device ID
  const deviceId = Device.osBuildId || Device.osInternalBuildId || "unknown";

  // Register with backend
  const result = await registerDevice({
    device_id: deviceId,
    fcm_token: token,
    platform: Device.osName === "iOS" ? "ios" : "android",
    user_id: currentUser?.id, // if authenticated
  });

  if (result.error) {
    console.error("Failed to register device:", result.error);
  } else {
    console.log("Device registered successfully:", result.data?.token_id);
  }
}
```

## Error Handling

The endpoint handles various error scenarios:

1. **Missing required fields**: Returns error with descriptive message
2. **Invalid platform**: Returns error indicating valid platform values
3. **Database errors**: Catches and returns database errors gracefully
4. **Duplicate FCM tokens**: Handled by database UNIQUE constraint on `fcm_token`

## Testing

Comprehensive unit tests cover:

- First-time device registration
- Updating existing device tokens
- User association
- Required field validation
- Platform validation
- Database error handling
- Default values for `is_active` and `notifications_enabled`

Run tests with:

```bash
npm test -- src/test/mobile-device-registration.test.ts
```
