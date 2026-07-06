import * as admin from "firebase-admin";

/**
 * Firebase Cloud Messaging Configuration
 *
 * This module initializes the Firebase Admin SDK for sending push notifications
 * using Firebase Cloud Messaging (FCM). It reads credentials from environment
 * variables and provides a singleton instance of the Firebase Admin app.
 */

interface FCMConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

/**
 * FCM Notification Payload Structure
 * Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 7.3
 */
export interface FCMNotificationPayload {
  notification: {
    title: string;
    body: string;
    image?: string;
  };
  data: {
    albumId: string;
    artist: string;
    type: "album_added";
  };
  android?: {
    priority: "high";
    notification: {
      channelId: "album_updates";
      sound: "default";
    };
  };
  apns?: {
    payload: {
      aps: {
        sound: "default";
        badge: number;
      };
    };
  };
}

/**
 * FCM Response for single device notification
 * Requirements: 3.3, 7.3
 */
export interface FCMResponse {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * FCM Batch Response for multiple device notifications
 * Requirements: 3.5, 8.3
 */
export interface FCMBatchResponse {
  successCount: number;
  failureCount: number;
  responses: FCMResponse[];
}

let firebaseApp: admin.app.App | null = null;

/**
 * Get FCM configuration from environment variables
 * @returns FCMConfig object with Firebase credentials
 * @throws Error if required environment variables are missing
 */
export const getFCMConfig = (): FCMConfig => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const privateKey = import.meta.env.VITE_FIREBASE_PRIVATE_KEY;
  const clientEmail = import.meta.env.VITE_FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Missing Firebase configuration. Please ensure VITE_FIREBASE_PROJECT_ID, " +
        "VITE_FIREBASE_PRIVATE_KEY, and VITE_FIREBASE_CLIENT_EMAIL are set in environment variables.",
    );
  }

  // Replace escaped newlines in private key
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  return {
    projectId,
    privateKey: formattedPrivateKey,
    clientEmail,
  };
};

/**
 * Initialize Firebase Admin SDK
 * @returns Initialized Firebase Admin app instance
 * @throws Error if initialization fails
 */
export const initializeFCM = (): admin.app.App => {
  // Return existing instance if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const config = getFCMConfig();

    // Initialize Firebase Admin with service account credentials
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey,
        clientEmail: config.clientEmail,
      }),
    });

    console.log(
      `[FCM] Firebase Admin SDK initialized successfully for project: ${config.projectId}`,
    );
    return firebaseApp;
  } catch (error) {
    console.error("[FCM] Failed to initialize Firebase Admin SDK:", error);
    throw new Error(
      `FCM initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Get the Firebase Admin app instance
 * Initializes if not already initialized
 * @returns Firebase Admin app instance
 */
export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    return initializeFCM();
  }
  return firebaseApp;
};

/**
 * Get Firebase Cloud Messaging instance
 * @returns Firebase Messaging instance
 */
export const getMessaging = (): admin.messaging.Messaging => {
  const app = getFirebaseApp();
  return admin.messaging(app);
};

/**
 * Validate FCM configuration without initializing
 * Useful for startup checks
 * @returns true if configuration is valid, false otherwise
 */
export const validateFCMConfig = (): boolean => {
  try {
    getFCMConfig();
    return true;
  } catch (error) {
    console.error("[FCM] Configuration validation failed:", error);
    return false;
  }
};

/**
 * FCM Service Class
 *
 * Provides a structured interface for Firebase Cloud Messaging operations.
 * Handles initialization, connection validation, and error management.
 *
 * Requirements:
 * - 1.1: Initialize FCM using Firebase project credentials
 * - 1.2: Validate FCM configuration and log connection status
 * - 1.4: Log detailed error information and prevent notification sending on failure
 */
export class FCMService {
  private app: admin.app.App | null = null;
  private initialized = false;
  private initializationError: Error | null = null;

  /**
   * Initialize the FCM service
   * Validates configuration and establishes connection
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Prevent re-initialization
    if (this.initialized) {
      console.log("[FCMService] Already initialized, skipping");
      return;
    }

    try {
      // Validate configuration first
      console.log("[FCMService] Validating FCM configuration...");
      const config = getFCMConfig();
      console.log(
        `[FCMService] Configuration validated for project: ${config.projectId}`,
      );

      // Initialize Firebase Admin SDK
      console.log("[FCMService] Initializing Firebase Admin SDK...");
      this.app = initializeFCM();

      // Validate connection by attempting to get messaging instance
      const messaging = admin.messaging(this.app);
      console.log("[FCMService] Firebase Messaging instance obtained");

      // Mark as successfully initialized
      this.initialized = true;
      this.initializationError = null;

      console.log(
        "[FCMService] ✓ FCM Service initialized successfully and ready to send notifications",
      );
    } catch (error) {
      // Store initialization error
      this.initializationError =
        error instanceof Error
          ? error
          : new Error(`FCM initialization failed: ${String(error)}`);

      // Log detailed error information
      console.error(
        "[FCMService] ✗ FCM initialization failed:",
        this.initializationError.message,
      );
      console.error("[FCMService] Error details:", {
        name: this.initializationError.name,
        message: this.initializationError.message,
        stack: this.initializationError.stack,
      });

      // Mark as failed (not initialized)
      this.initialized = false;
      this.app = null;

      // Re-throw to allow caller to handle
      throw this.initializationError;
    }
  }

  /**
   * Check if the service is initialized and ready to send notifications
   * @returns true if initialized successfully, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized && this.app !== null;
  }

  /**
   * Get the initialization error if initialization failed
   * @returns Error object if initialization failed, null otherwise
   */
  getInitializationError(): Error | null {
    return this.initializationError;
  }

  /**
   * Get the Firebase Messaging instance
   * @returns Firebase Messaging instance
   * @throws Error if service is not initialized
   */
  getMessaging(): admin.messaging.Messaging {
    if (!this.isInitialized() || !this.app) {
      const error = new Error(
        "FCM Service is not initialized. Cannot send notifications.",
      );
      console.error("[FCMService]", error.message);
      if (this.initializationError) {
        console.error(
          "[FCMService] Initialization error:",
          this.initializationError.message,
        );
      }
      throw error;
    }

    return admin.messaging(this.app);
  }

  /**
   * Validate that the service is ready to send notifications
   * @throws Error if service is not initialized
   */
  validateReadyToSend(): void {
    if (!this.isInitialized()) {
      throw new Error(
        "FCM Service is not initialized. Notification sending is disabled.",
      );
    }
  }

  /**
   * Get connection status information
   * @returns Object with connection status details
   */
  getStatus(): {
    initialized: boolean;
    hasError: boolean;
    errorMessage: string | null;
  } {
    return {
      initialized: this.initialized,
      hasError: this.initializationError !== null,
      errorMessage: this.initializationError?.message || null,
    };
  }

  /**
   * Send notification to a single device
   *
   * Constructs and sends an FCM notification payload to a specific device token.
   * Includes platform-specific configuration for iOS (APNs) and Android.
   *
   * Requirements:
   * - 3.3: Construct notification payload with album metadata
   * - 7.3: Handle platform-specific notification formatting (APNs for iOS, Android channel)
   *
   * @param token - FCM device token
   * @param payload - Notification payload with album information
   * @returns Promise resolving to FCMResponse with success status and message ID or error
   */
  async sendToDevice(
    token: string,
    payload: FCMNotificationPayload,
  ): Promise<FCMResponse> {
    // Validate service is ready
    this.validateReadyToSend();

    try {
      const messaging = this.getMessaging();

      // Construct FCM message with platform-specific configuration
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.notification.title,
          body: payload.notification.body,
          imageUrl: payload.notification.image,
        },
        data: {
          albumId: payload.data.albumId,
          artist: payload.data.artist,
          type: payload.data.type,
        },
        // Android-specific configuration
        android: payload.android
          ? {
              priority: payload.android.priority,
              notification: {
                channelId: payload.android.notification.channelId,
                sound: payload.android.notification.sound,
              },
            }
          : undefined,
        // iOS-specific configuration (APNs)
        apns: payload.apns
          ? {
              payload: {
                aps: {
                  sound: payload.apns.payload.aps.sound,
                  badge: payload.apns.payload.aps.badge,
                },
              },
            }
          : undefined,
      };

      // Send the message
      const messageId = await messaging.send(message);

      console.log(
        `[FCMService] ✓ Notification sent successfully to device. Message ID: ${messageId}`,
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      // Parse FCM error
      const fcmError = error as any;
      const errorCode = fcmError.code || "UNKNOWN_ERROR";
      const errorMessage =
        fcmError.message || "Failed to send notification to device";

      console.error(
        `[FCMService] ✗ Failed to send notification to device:`,
        errorCode,
        errorMessage,
      );

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Send notification to multiple devices (batch sending)
   *
   * Efficiently sends the same notification payload to multiple device tokens.
   * Handles individual token failures gracefully and continues sending to remaining tokens.
   * This method processes tokens individually to ensure one failure doesn't block others.
   *
   * Requirements:
   * - 3.5: Send notifications to all active device tokens
   * - 8.3: Continue sending to remaining tokens on individual failures
   *
   * @param tokens - Array of FCM device tokens
   * @param payload - Notification payload with album information
   * @returns Promise resolving to FCMBatchResponse with success/failure counts and individual responses
   */
  async sendToMultipleDevices(
    tokens: string[],
    payload: FCMNotificationPayload,
  ): Promise<FCMBatchResponse> {
    // Validate service is ready
    this.validateReadyToSend();

    console.log(
      `[FCMService] Starting batch notification send to ${tokens.length} devices`,
    );

    const responses: FCMResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Send to each token individually to handle failures gracefully
    // This ensures one token failure doesn't block others
    for (const token of tokens) {
      try {
        const response = await this.sendToDevice(token, payload);
        responses.push(response);

        if (response.success) {
          successCount++;
        } else {
          failureCount++;
          console.warn(
            `[FCMService] Failed to send to token ${token.substring(0, 10)}...: ${response.error?.code} - ${response.error?.message}`,
          );
        }
      } catch (error) {
        // Catch any unexpected errors and continue with remaining tokens
        failureCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[FCMService] Unexpected error sending to token ${token.substring(0, 10)}...:`,
          errorMessage,
        );

        responses.push({
          success: false,
          error: {
            code: "UNEXPECTED_ERROR",
            message: errorMessage,
          },
        });
      }
    }

    console.log(
      `[FCMService] Batch send complete: ${successCount} succeeded, ${failureCount} failed out of ${tokens.length} total`,
    );

    return {
      successCount,
      failureCount,
      responses,
    };
  }
}
