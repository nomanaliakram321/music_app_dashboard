import { supabase } from "./supabase";
import { FCMService, FCMNotificationPayload } from "./fcm";
import type { Album, DeviceToken, NotificationLog } from "../types/database";

/**
 * Notification Service
 *
 * Handles sending push notifications for album additions.
 * Manages device token queries, FCM integration, and notification logging.
 *
 * Requirements:
 * - 3.2: Receive album addition events and construct notification payloads
 * - 3.4: Send notifications to all active device tokens with notifications enabled
 * - 8.1: Mark invalid tokens as inactive
 * - 9.1: Log each notification send attempt with timestamp, album ID, and recipient count
 */

export interface NotificationResult {
  success: boolean;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  errors: NotificationError[];
}

export interface NotificationError {
  tokenId: string;
  fcmToken: string;
  errorCode: string;
  errorMessage: string;
}

export class NotificationService {
  private fcmService: FCMService;

  constructor(fcmService?: FCMService) {
    this.fcmService = fcmService || new FCMService();
  }

  /**
   * Get all active device tokens that have notifications enabled
   *
   * Queries the database for device tokens where:
   * - is_active = true
   * - notifications_enabled = true
   *
   * Requirements:
   * - 3.4: Send notifications to all active device tokens with notifications enabled
   * - 6.3: Exclude opted-out users from notification sends
   *
   * @returns Promise resolving to array of active device tokens
   */
  async getActiveTokens(): Promise<DeviceToken[]> {
    try {
      console.log(
        "[NotificationService] Querying active device tokens with notifications enabled",
      );

      const { data, error } = await supabase
        .from("device_tokens")
        .select("*")
        .eq("is_active", true)
        .eq("notifications_enabled", true);

      if (error) {
        console.error(
          "[NotificationService] Failed to query device tokens:",
          error,
        );
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log(
        `[NotificationService] Found ${data?.length || 0} active device tokens`,
      );

      return (data as DeviceToken[]) || [];
    } catch (error) {
      console.error("[NotificationService] Error in getActiveTokens:", error);
      throw error;
    }
  }

  /**
   * Send album notification to all active devices
   *
   * Main method for sending push notifications when a new album is added.
   * Handles the complete flow:
   * 1. Query active device tokens
   * 2. Construct notification payload
   * 3. Send notifications via FCM
   * 4. Handle invalid tokens
   * 5. Log notification results
   *
   * Requirements:
   * - 3.2: Receive album addition event with album metadata
   * - 3.3: Construct notification payload with album name, artist, and album ID
   * - 3.4: Send notification to all active device tokens with notifications enabled
   * - 3.5: Log failures and continue sending to remaining devices
   * - 8.1: Mark invalid tokens as inactive
   * - 9.1: Log notification send attempt
   *
   * @param album - Album object with metadata for notification
   * @returns Promise resolving to NotificationResult with success/failure details
   */
  async sendAlbumNotification(album: Album): Promise<NotificationResult> {
    console.log(
      `[NotificationService] Starting album notification for: "${album.title}" by ${album.artist}`,
    );

    const result: NotificationResult = {
      success: false,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    try {
      // Ensure FCM service is initialized
      if (!this.fcmService.isInitialized()) {
        console.log("[NotificationService] Initializing FCM service...");
        await this.fcmService.initialize();
      }

      // Step 1: Get active device tokens
      const deviceTokens = await this.getActiveTokens();
      result.recipientCount = deviceTokens.length;

      if (deviceTokens.length === 0) {
        console.log(
          "[NotificationService] No active device tokens found. Skipping notification send.",
        );
        result.success = true; // Not an error, just no recipients
        await this.logNotification({
          album_id: album.id,
          notification_type: "album_added",
          recipient_count: 0,
          success_count: 0,
          failure_count: 0,
          payload: this.constructPayload(album),
        });
        return result;
      }

      // Step 2: Construct notification payload
      const payload = this.constructPayload(album);

      // Step 3: Send notifications via FCM
      console.log(
        `[NotificationService] Sending notifications to ${deviceTokens.length} devices`,
      );

      const fcmTokens = deviceTokens.map((dt) => dt.fcm_token);
      const batchResponse = await this.fcmService.sendToMultipleDevices(
        fcmTokens,
        payload,
      );

      result.successCount = batchResponse.successCount;
      result.failureCount = batchResponse.failureCount;

      // Step 4: Handle invalid tokens and collect errors
      for (let i = 0; i < batchResponse.responses.length; i++) {
        const response = batchResponse.responses[i];
        const deviceToken = deviceTokens[i];

        if (!response.success && response.error) {
          // Check if token is invalid/expired
          const isInvalidToken =
            response.error.code === "messaging/invalid-registration-token" ||
            response.error.code ===
              "messaging/registration-token-not-registered";

          if (isInvalidToken) {
            console.log(
              `[NotificationService] Marking invalid token as inactive: ${deviceToken.id}`,
            );
            await this.updateTokenStatus(deviceToken.id, false);
          }

          // Collect error details
          result.errors.push({
            tokenId: deviceToken.id,
            fcmToken: deviceToken.fcm_token,
            errorCode: response.error.code,
            errorMessage: response.error.message,
          });
        }
      }

      // Step 5: Log notification results
      await this.logNotification({
        album_id: album.id,
        notification_type: "album_added",
        recipient_count: result.recipientCount,
        success_count: result.successCount,
        failure_count: result.failureCount,
        payload: payload,
      });

      result.success = true;

      console.log(
        `[NotificationService] ✓ Album notification complete: ${result.successCount} succeeded, ${result.failureCount} failed`,
      );

      return result;
    } catch (error) {
      console.error(
        "[NotificationService] ✗ Failed to send album notification:",
        error,
      );

      // Log the failure
      try {
        await this.logNotification({
          album_id: album.id,
          notification_type: "album_added",
          recipient_count: result.recipientCount,
          success_count: result.successCount,
          failure_count: result.failureCount,
          payload: this.constructPayload(album),
        });
      } catch (logError) {
        console.error(
          "[NotificationService] Failed to log notification error:",
          logError,
        );
      }

      throw error;
    }
  }

  /**
   * Update device token active status
   *
   * Marks a device token as active or inactive in the database.
   * Used primarily for handling invalid/expired tokens returned by FCM.
   *
   * Requirements:
   * - 8.1: Mark device token as inactive when FCM returns invalid token error
   *
   * @param tokenId - UUID of the device token record
   * @param isActive - New active status (true or false)
   * @returns Promise that resolves when update is complete
   */
  async updateTokenStatus(tokenId: string, isActive: boolean): Promise<void> {
    try {
      console.log(
        `[NotificationService] Updating token ${tokenId} active status to: ${isActive}`,
      );

      const { error } = await supabase
        .from("device_tokens")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tokenId);

      if (error) {
        console.error(
          "[NotificationService] Failed to update token status:",
          error,
        );
        throw new Error(`Failed to update token status: ${error.message}`);
      }

      console.log(
        `[NotificationService] ✓ Token ${tokenId} status updated successfully`,
      );
    } catch (error) {
      console.error("[NotificationService] Error in updateTokenStatus:", error);
      throw error;
    }
  }

  /**
   * Log notification send attempt to database
   *
   * Creates an audit trail record for each notification send operation.
   * Stores recipient count, success/failure counts, and the notification payload.
   *
   * Requirements:
   * - 9.1: Log each notification send attempt with timestamp, album ID, and recipient count
   * - 9.2: Log notification delivery success and failure rates
   *
   * @param log - Notification log data (without id and created_at which are auto-generated)
   * @returns Promise that resolves when log is created
   */
  async logNotification(
    log: Omit<NotificationLog, "id" | "created_at">,
  ): Promise<void> {
    try {
      console.log(
        `[NotificationService] Logging notification: album=${log.album_id}, recipients=${log.recipient_count}, success=${log.success_count}, failure=${log.failure_count}`,
      );

      const { error } = await supabase.from("notification_logs").insert([
        {
          album_id: log.album_id,
          notification_type: log.notification_type,
          recipient_count: log.recipient_count,
          success_count: log.success_count,
          failure_count: log.failure_count,
          payload: log.payload,
        },
      ]);

      if (error) {
        console.error(
          "[NotificationService] Failed to log notification:",
          error,
        );
        throw new Error(`Failed to log notification: ${error.message}`);
      }

      console.log("[NotificationService] ✓ Notification logged successfully");
    } catch (error) {
      console.error("[NotificationService] Error in logNotification:", error);
      throw error;
    }
  }

  /**
   * Construct FCM notification payload from album data
   *
   * Creates a properly formatted notification payload with:
   * - Title: "New Album: {album_name}"
   * - Body: "by {artist_name}"
   * - Album cover image
   * - Album ID for deep linking
   * - Platform-specific configuration
   *
   * Requirements:
   * - 4.1: Title format "New Album: [Album Name]"
   * - 4.2: Body format "by [Artist Name]"
   * - 4.3: Include album cover art URL
   * - 4.4: Include album ID for deep linking
   * - 7.3: Platform-specific formatting (APNs for iOS, Android channel)
   *
   * @param album - Album object with metadata
   * @returns FCM notification payload
   */
  private constructPayload(album: Album): FCMNotificationPayload {
    return {
      notification: {
        title: `New Album: ${album.title}`,
        body: `by ${album.artist}`,
        image: album.image,
      },
      data: {
        albumId: album.id,
        artist: album.artist,
        type: "album_added",
      },
      android: {
        priority: "high",
        notification: {
          channelId: "album_updates",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };
  }
}
