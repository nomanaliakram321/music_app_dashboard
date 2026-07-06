/**
 * Firebase Cloud Messaging Configuration (Node.js Compatible)
 *
 * This is a Node.js compatible version of the FCM module for testing purposes.
 * Uses process.env instead of import.meta.env
 */

import admin from "firebase-admin";
import { config } from "dotenv";

// Load environment variables
config();

interface FCMConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

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

export interface FCMResponse {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface FCMBatchResponse {
  successCount: number;
  failureCount: number;
  responses: FCMResponse[];
}

let firebaseApp: admin.app.App | null = null;

export const getFCMConfig = (): FCMConfig => {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const privateKey = process.env.VITE_FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.VITE_FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Missing Firebase configuration. Please ensure VITE_FIREBASE_PROJECT_ID, " +
        "VITE_FIREBASE_PRIVATE_KEY, and VITE_FIREBASE_CLIENT_EMAIL are set in .env file.",
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

export const initializeFCM = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const config = getFCMConfig();

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

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    return initializeFCM();
  }
  return firebaseApp;
};

export const getMessaging = (): admin.messaging.Messaging => {
  const app = getFirebaseApp();
  return admin.messaging(app);
};

export const validateFCMConfig = (): boolean => {
  try {
    getFCMConfig();
    return true;
  } catch (error) {
    console.error("[FCM] Configuration validation failed:", error);
    return false;
  }
};

export class FCMService {
  private app: admin.app.App | null = null;
  private initialized = false;
  private initializationError: Error | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("[FCMService] Already initialized, skipping");
      return;
    }

    try {
      console.log("[FCMService] Validating FCM configuration...");
      const config = getFCMConfig();
      console.log(
        `[FCMService] Configuration validated for project: ${config.projectId}`,
      );

      console.log("[FCMService] Initializing Firebase Admin SDK...");
      this.app = initializeFCM();

      const messaging = admin.messaging(this.app);
      console.log("[FCMService] Firebase Messaging instance obtained");

      this.initialized = true;
      this.initializationError = null;

      console.log(
        "[FCMService] ✓ FCM Service initialized successfully and ready to send notifications",
      );
    } catch (error) {
      this.initializationError =
        error instanceof Error
          ? error
          : new Error(`FCM initialization failed: ${String(error)}`);

      console.error(
        "[FCMService] ✗ FCM initialization failed:",
        this.initializationError.message,
      );
      console.error("[FCMService] Error details:", {
        name: this.initializationError.name,
        message: this.initializationError.message,
        stack: this.initializationError.stack,
      });

      this.initialized = false;
      this.app = null;

      throw this.initializationError;
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.app !== null;
  }

  getInitializationError(): Error | null {
    return this.initializationError;
  }

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

  validateReadyToSend(): void {
    if (!this.isInitialized()) {
      throw new Error(
        "FCM Service is not initialized. Notification sending is disabled.",
      );
    }
  }

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

  async sendToDevice(
    token: string,
    payload: FCMNotificationPayload,
  ): Promise<FCMResponse> {
    this.validateReadyToSend();

    try {
      const messaging = this.getMessaging();

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
        android: payload.android
          ? {
              priority: payload.android.priority,
              notification: {
                channelId: payload.android.notification.channelId,
                sound: payload.android.notification.sound,
              },
            }
          : undefined,
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

      const messageId = await messaging.send(message);

      console.log(
        `[FCMService] ✓ Notification sent successfully to device. Message ID: ${messageId}`,
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
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

  async sendToMultipleDevices(
    tokens: string[],
    payload: FCMNotificationPayload,
  ): Promise<FCMBatchResponse> {
    this.validateReadyToSend();

    console.log(
      `[FCMService] Starting batch notification send to ${tokens.length} devices`,
    );

    const responses: FCMResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

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
