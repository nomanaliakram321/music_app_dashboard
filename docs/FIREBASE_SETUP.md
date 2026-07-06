# Firebase Cloud Messaging Setup Guide

This guide explains how to configure Firebase Cloud Messaging (FCM) for the album push notifications feature.

## Prerequisites

- Access to the Firebase Console for the `music-app-10f66` project
- Admin permissions to generate service account credentials

## Setup Steps

### 1. Generate Firebase Service Account Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select the `music-app-10f66` project
3. Navigate to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. A JSON file will be downloaded containing your credentials

### 2. Extract Credentials from JSON File

The downloaded JSON file will look like this:

```json
{
  "type": "service_account",
  "project_id": "music-app-10f66",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@music-app-10f66.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

You need to extract three values:

- `project_id`
- `private_key`
- `client_email`

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Firebase Cloud Messaging Configuration
VITE_FIREBASE_PROJECT_ID=music-app-10f66
VITE_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
VITE_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@music-app-10f66.iam.gserviceaccount.com
```

**Important Notes:**

- Keep the quotes around the private key
- The `\n` characters in the private key should remain as `\n` (escaped newlines) - the configuration module will handle the conversion
- Never commit the `.env` file to version control
- Use `.env.example` as a template for other developers

### 4. Verify Configuration

The FCM configuration module (`src/lib/fcm.ts`) provides validation functions:

```typescript
import { validateFCMConfig, initializeFCM } from "./lib/fcm";

// Check if configuration is valid
if (validateFCMConfig()) {
  console.log("FCM configuration is valid");

  // Initialize FCM
  try {
    initializeFCM();
    console.log("FCM initialized successfully");
  } catch (error) {
    console.error("FCM initialization failed:", error);
  }
} else {
  console.error("FCM configuration is invalid");
}
```

## Configuration Module API

### `getFCMConfig()`

Returns the FCM configuration object with credentials from environment variables.

**Returns:** `FCMConfig`

```typescript
{
  projectId: string;
  privateKey: string;
  clientEmail: string;
}
```

**Throws:** Error if any required environment variable is missing

### `initializeFCM()`

Initializes the Firebase Admin SDK with the configured credentials.

**Returns:** `admin.app.App` - Firebase Admin app instance

**Throws:** Error if initialization fails

### `getFirebaseApp()`

Gets the Firebase Admin app instance, initializing it if necessary.

**Returns:** `admin.app.App`

### `getMessaging()`

Gets the Firebase Cloud Messaging instance.

**Returns:** `admin.messaging.Messaging`

### `validateFCMConfig()`

Validates that all required environment variables are set without initializing Firebase.

**Returns:** `boolean` - true if configuration is valid, false otherwise

## Security Best Practices

1. **Never commit credentials to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Rotate credentials regularly**
   - Generate new service account keys periodically
   - Delete old keys from Firebase Console

3. **Limit service account permissions**
   - Only grant necessary permissions for FCM
   - Use separate service accounts for different environments

4. **Use environment-specific credentials**
   - Development: Use a separate Firebase project or service account
   - Production: Use production credentials with restricted access

## Troubleshooting

### Error: "Missing Firebase configuration"

- Verify all three environment variables are set in `.env`
- Check that variable names match exactly: `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_PRIVATE_KEY`, `VITE_FIREBASE_CLIENT_EMAIL`
- Ensure the `.env` file is in the project root directory

### Error: "FCM initialization failed"

- Verify the private key format is correct (should include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- Check that the client email matches the format: `firebase-adminsdk-xxxxx@PROJECT_ID.iam.gserviceaccount.com`
- Ensure the service account has the necessary permissions in Firebase Console

### Error: "Invalid credentials"

- Regenerate the service account key from Firebase Console
- Verify you're using the correct Firebase project (`music-app-10f66`)
- Check that the service account hasn't been deleted or disabled

## Next Steps

After configuring FCM:

1. Implement the FCM service module (Task 2.1)
2. Create device token management endpoints (Task 3.x)
3. Integrate notifications with album creation (Task 6.x)

## References

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Account Credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk)
