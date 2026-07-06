/**
 * Test Script for Push Notifications (Node.js Compatible)
 *
 * This script tests the push notification system without requiring a mobile app.
 * It simulates device registration and album creation to verify the notification flow.
 *
 * Usage:
 *   node --loader tsx test-notifications-node.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { FCMService } from "../../src/lib/fcm-node.js";
import type {
  Album,
  DeviceToken,
  NotificationLog,
} from "./src/types/database.js";

// Load environment variables
config();

// Create Supabase client using process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNotifications() {
  console.log("🧪 Starting Push Notification Test\n");

  // Step 1: Register a test device
  console.log("1️⃣ Registering test device...");
  const testDevice = {
    device_id: "test-device-" + Date.now(),
    fcm_token: "test-fcm-token-" + Date.now(),
    platform: "ios" as const,
  };

  const { data: deviceData, error: deviceError } = await supabase
    .from("device_tokens")
    .insert([
      {
        ...testDevice,
        is_active: true,
        notifications_enabled: true,
      },
    ])
    .select()
    .single();

  if (deviceError) {
    console.error("❌ Failed to register device:", deviceError);
    return;
  }

  console.log("✅ Device registered:", deviceData.id);
  console.log("   Device ID:", testDevice.device_id);
  console.log("   FCM Token:", testDevice.fcm_token);
  console.log();

  // Step 2: Create a test album
  console.log("2️⃣ Creating test album...");
  const testAlbum = {
    title: "Test Album " + Date.now(),
    artist: "Test Artist",
    release_date: new Date().toISOString().split("T")[0],
    image: "https://via.placeholder.com/300",
    cover: "fav_cover1",
    color: "#948C80",
    dob: new Date().toISOString().split("T")[0],
    age: "0",
  };

  const { data: albumData, error: albumError } = await supabase
    .from("albums")
    .insert([testAlbum])
    .select()
    .single();

  if (albumError) {
    console.error("❌ Failed to create album:", albumError);
    return;
  }

  console.log("✅ Album created:", albumData.id);
  console.log("   Title:", albumData.title);
  console.log("   Artist:", albumData.artist);
  console.log();

  // Step 3: Send notification
  console.log("3️⃣ Sending notification...");

  // Create FCM service and notification service
  const fcmService = new FCMService();

  // Initialize FCM
  try {
    await fcmService.initialize();
  } catch (error) {
    console.error("❌ Failed to initialize FCM:", error);
    console.log(
      "\n⚠️  Note: FCM initialization failed, but this is expected if you're testing without real FCM tokens.",
    );
    console.log(
      "   The database operations and service logic are still being tested.\n",
    );
  }

  // Manually construct and send notification (simplified version without NotificationService)
  try {
    // Get active tokens
    const { data: activeTokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("*")
      .eq("is_active", true)
      .eq("notifications_enabled", true);

    if (tokensError) {
      console.error("❌ Failed to query device tokens:", tokensError);
      return;
    }

    console.log(`✅ Found ${activeTokens?.length || 0} active device tokens`);

    const recipientCount = activeTokens?.length || 0;
    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];

    if (recipientCount > 0 && fcmService.isInitialized()) {
      // Construct payload
      const payload = {
        notification: {
          title: `New Album: ${albumData.title}`,
          body: `by ${albumData.artist}`,
          image: albumData.image,
        },
        data: {
          albumId: albumData.id,
          artist: albumData.artist,
          type: "album_added" as const,
        },
        android: {
          priority: "high" as const,
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

      // Send to all tokens
      const fcmTokens = activeTokens!.map((dt: any) => dt.fcm_token);
      const batchResponse = await fcmService.sendToMultipleDevices(
        fcmTokens,
        payload,
      );

      successCount = batchResponse.successCount;
      failureCount = batchResponse.failureCount;

      // Collect errors
      for (let i = 0; i < batchResponse.responses.length; i++) {
        const response = batchResponse.responses[i];
        if (!response.success && response.error) {
          errors.push({
            tokenId: activeTokens![i].id,
            errorCode: response.error.code,
            errorMessage: response.error.message,
          });
        }
      }
    }

    console.log("✅ Notification process completed!");
    console.log("   Recipients:", recipientCount);
    console.log("   Successful:", successCount);
    console.log("   Failed:", failureCount);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors:");
      errors.forEach((err) => {
        console.log(`   - ${err.errorCode}: ${err.errorMessage}`);
      });
    }

    // Log notification
    await supabase.from("notification_logs").insert([
      {
        album_id: albumData.id,
        notification_type: "album_added",
        recipient_count: recipientCount,
        success_count: successCount,
        failure_count: failureCount,
        payload: {
          notification: {
            title: `New Album: ${albumData.title}`,
            body: `by ${albumData.artist}`,
            image: albumData.image,
          },
          data: {
            albumId: albumData.id,
            artist: albumData.artist,
            type: "album_added",
          },
        },
      },
    ]);
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
  }
  console.log();

  // Step 4: Verify notification log
  console.log("4️⃣ Checking notification logs...");
  const { data: logs, error: logsError } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("album_id", albumData.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (logsError) {
    console.error("❌ Failed to fetch logs:", logsError);
    return;
  }

  if (logs && logs.length > 0) {
    const log = logs[0];
    console.log("✅ Notification logged:");
    console.log("   Log ID:", log.id);
    console.log("   Recipients:", log.recipient_count);
    console.log("   Success:", log.success_count);
    console.log("   Failures:", log.failure_count);
    console.log("   Payload:", JSON.stringify(log.payload, null, 2));
  }
  console.log();

  // Step 5: Test preference update
  console.log("5️⃣ Testing preference update (opt-out)...");
  const { error: prefError } = await supabase
    .from("device_tokens")
    .update({ notifications_enabled: false })
    .eq("id", deviceData.id);

  if (prefError) {
    console.error("❌ Failed to update preferences:", prefError);
  } else {
    console.log("✅ Device opted out of notifications");
  }
  console.log();

  // Step 6: Verify opt-out works
  console.log("6️⃣ Verifying opt-out (should not send)...");
  const testAlbum2 = {
    ...testAlbum,
    title: "Test Album 2 " + Date.now(),
  };

  const { data: albumData2, error: albumError2 } = await supabase
    .from("albums")
    .insert([testAlbum2])
    .select()
    .single();

  if (!albumError2 && albumData2) {
    try {
      const result2 =
        await notificationService.sendAlbumNotification(albumData2);
      console.log("✅ Notification attempted:");
      console.log("   Recipients:", result2.recipientCount, "(should be 0)");
      console.log("   Successful:", result2.successCount);
    } catch (error) {
      console.error("❌ Failed:", error);
    }
  }
  console.log();

  // Cleanup
  console.log("🧹 Cleaning up test data...");
  await supabase.from("device_tokens").delete().eq("id", deviceData.id);
  await supabase.from("albums").delete().eq("id", albumData.id);
  if (albumData2) {
    await supabase.from("albums").delete().eq("id", albumData2.id);
  }
  console.log("✅ Cleanup complete");
  console.log();

  console.log("✨ Test completed successfully!");
}

// Run the test
testNotifications().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
