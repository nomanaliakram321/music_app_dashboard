import { supabase } from "@/lib/supabase";

/**
 * Admin API for Push Notification Monitoring
 *
 * Provides endpoints for monitoring notification metrics, success/failure rates,
 * and active device statistics.
 */

// ===================================
// NOTIFICATION METRICS
// ===================================

export interface NotificationMetrics {
  // Device statistics
  total_devices: number;
  active_devices: number;
  opted_in_devices: number;
  opted_out_devices: number;
  ios_devices: number;
  android_devices: number;

  // Notification statistics
  total_notifications: number;
  total_recipients: number;
  total_successes: number;
  total_failures: number;
  success_rate: number;
  failure_rate: number;

  // Time period
  start_date: string;
  end_date: string;
}

export interface GetMetricsRequest {
  start_date?: string; // ISO date string (optional, defaults to 7 days ago)
  end_date?: string; // ISO date string (optional, defaults to now)
}

/**
 * Get notification metrics and statistics
 *
 * Returns comprehensive metrics including:
 * - Active device counts by platform
 * - Notification success/failure rates
 * - Opt-in/opt-out statistics
 *
 * Supports date range filtering for historical analysis
 *
 * Requirements: 9.3
 */
export async function getNotificationMetrics(
  request: GetMetricsRequest = {},
): Promise<{ data: NotificationMetrics | null; error: any }> {
  try {
    // Default to last 7 days if no date range provided
    const endDate = request.end_date || new Date().toISOString();
    const startDate =
      request.start_date ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get device statistics
    const { data: allDevices, error: devicesError } = await supabase
      .from("device_tokens")
      .select("platform, is_active, notifications_enabled");

    if (devicesError) {
      return { data: null, error: devicesError };
    }

    const totalDevices = allDevices?.length || 0;
    const activeDevices = allDevices?.filter((d) => d.is_active).length || 0;
    const optedInDevices =
      allDevices?.filter((d) => d.is_active && d.notifications_enabled)
        .length || 0;
    const optedOutDevices =
      allDevices?.filter((d) => d.is_active && !d.notifications_enabled)
        .length || 0;
    const iosDevices =
      allDevices?.filter((d) => d.is_active && d.platform === "ios").length ||
      0;
    const androidDevices =
      allDevices?.filter((d) => d.is_active && d.platform === "android")
        .length || 0;

    // Get notification statistics for date range
    const { data: logs, error: logsError } = await supabase
      .from("notification_logs")
      .select("recipient_count, success_count, failure_count")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (logsError) {
      return { data: null, error: logsError };
    }

    const totalNotifications = logs?.length || 0;
    const totalRecipients =
      logs?.reduce((sum, log) => sum + (log.recipient_count || 0), 0) || 0;
    const totalSuccesses =
      logs?.reduce((sum, log) => sum + (log.success_count || 0), 0) || 0;
    const totalFailures =
      logs?.reduce((sum, log) => sum + (log.failure_count || 0), 0) || 0;

    const successRate =
      totalRecipients > 0
        ? Math.round((totalSuccesses / totalRecipients) * 100 * 100) / 100
        : 0;
    const failureRate =
      totalRecipients > 0
        ? Math.round((totalFailures / totalRecipients) * 100 * 100) / 100
        : 0;

    return {
      data: {
        // Device statistics
        total_devices: totalDevices,
        active_devices: activeDevices,
        opted_in_devices: optedInDevices,
        opted_out_devices: optedOutDevices,
        ios_devices: iosDevices,
        android_devices: androidDevices,

        // Notification statistics
        total_notifications: totalNotifications,
        total_recipients: totalRecipients,
        total_successes: totalSuccesses,
        total_failures: totalFailures,
        success_rate: successRate,
        failure_rate: failureRate,

        // Time period
        start_date: startDate,
        end_date: endDate,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

// ===================================
// FAILURE RATE MONITORING
// ===================================

export interface FailureAlert {
  alert_triggered: boolean;
  failure_rate: number;
  threshold: number;
  total_notifications: number;
  total_failures: number;
  message: string;
}

/**
 * Check notification failure rate and generate alert if threshold exceeded
 *
 * Monitors the failure rate for recent notifications and generates an alert
 * when the failure rate exceeds 10%.
 *
 * This should be called periodically (e.g., every hour) or after each
 * notification batch to monitor system health.
 *
 * Requirements: 9.4
 */
export async function checkFailureRate(
  hoursToCheck: number = 24,
): Promise<{ data: FailureAlert | null; error: any }> {
  try {
    const FAILURE_THRESHOLD = 10; // 10% failure rate threshold

    // Get notifications from the last N hours
    const startDate = new Date(
      Date.now() - hoursToCheck * 60 * 60 * 1000,
    ).toISOString();

    const { data: logs, error: logsError } = await supabase
      .from("notification_logs")
      .select("recipient_count, success_count, failure_count")
      .gte("created_at", startDate);

    if (logsError) {
      return { data: null, error: logsError };
    }

    if (!logs || logs.length === 0) {
      return {
        data: {
          alert_triggered: false,
          failure_rate: 0,
          threshold: FAILURE_THRESHOLD,
          total_notifications: 0,
          total_failures: 0,
          message: "No notifications sent in the specified time period",
        },
        error: null,
      };
    }

    const totalRecipients = logs.reduce(
      (sum, log) => sum + (log.recipient_count || 0),
      0,
    );
    const totalFailures = logs.reduce(
      (sum, log) => sum + (log.failure_count || 0),
      0,
    );

    const failureRate =
      totalRecipients > 0
        ? Math.round((totalFailures / totalRecipients) * 100 * 100) / 100
        : 0;

    const alertTriggered = failureRate > FAILURE_THRESHOLD;

    let message = "";
    if (alertTriggered) {
      message =
        `⚠️ ALERT: Notification failure rate (${failureRate}%) exceeds threshold (${FAILURE_THRESHOLD}%). ` +
        `${totalFailures} failures out of ${totalRecipients} recipients in the last ${hoursToCheck} hours. ` +
        `Please investigate FCM configuration and device token validity.`;

      // Log the alert to console for administrator review
      console.error("[NOTIFICATION ALERT]", message);

      // You could also:
      // - Send an email to administrators
      // - Post to a Slack channel
      // - Create a database record in an alerts table
      // - Trigger a monitoring system webhook
    } else {
      message = `✓ Notification system healthy. Failure rate (${failureRate}%) is below threshold (${FAILURE_THRESHOLD}%).`;
    }

    return {
      data: {
        alert_triggered: alertTriggered,
        failure_rate: failureRate,
        threshold: FAILURE_THRESHOLD,
        total_notifications: logs.length,
        total_failures: totalFailures,
        message: message,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

// ===================================
// RECENT NOTIFICATIONS
// ===================================

export interface NotificationLogEntry {
  id: string;
  album_id: string;
  notification_type: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  album_title?: string;
  album_artist?: string;
}

/**
 * Get recent notification logs with album details
 *
 * Returns the most recent notification attempts with success/failure metrics
 * and associated album information.
 */
export async function getRecentNotifications(
  limit: number = 50,
): Promise<{ data: NotificationLogEntry[] | null; error: any }> {
  try {
    const { data: logs, error: logsError } = await supabase
      .from("notification_logs")
      .select(
        `
        id,
        album_id,
        notification_type,
        recipient_count,
        success_count,
        failure_count,
        created_at,
        albums (
          title,
          artist
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (logsError) {
      return { data: null, error: logsError };
    }

    // Format the response
    const formattedLogs =
      logs?.map((log: any) => ({
        id: log.id,
        album_id: log.album_id,
        notification_type: log.notification_type,
        recipient_count: log.recipient_count,
        success_count: log.success_count,
        failure_count: log.failure_count,
        created_at: log.created_at,
        album_title: log.albums?.title,
        album_artist: log.albums?.artist,
      })) || [];

    return { data: formattedLogs, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ===================================
// DEVICE MANAGEMENT
// ===================================

export interface DeviceTokenInfo {
  id: string;
  device_id: string;
  platform: string;
  is_active: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string;
}

/**
 * Get all registered device tokens with their status
 *
 * Useful for admin panel to view all registered devices and their
 * notification preferences.
 */
export async function getAllDeviceTokens(): Promise<{
  data: DeviceTokenInfo[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from("device_tokens")
      .select(
        "id, device_id, platform, is_active, notifications_enabled, created_at, updated_at, last_used_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data as DeviceTokenInfo[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Manually deactivate a device token
 *
 * Allows administrators to manually deactivate problematic device tokens
 * that are causing repeated failures.
 */
export async function deactivateDeviceToken(
  deviceId: string,
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from("device_tokens")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("device_id", deviceId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
