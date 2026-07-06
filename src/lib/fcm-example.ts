/**
 * Example usage of FCMService
 *
 * This file demonstrates how to use the FCMService class
 * for initializing and managing Firebase Cloud Messaging.
 */

import { FCMService } from "./fcm";

/**
 * Example: Initialize FCM Service and check status
 */
export async function initializeFCMExample() {
  const fcmService = new FCMService();

  try {
    // Initialize the service
    console.log("Initializing FCM Service...");
    await fcmService.initialize();

    // Check if initialization was successful
    if (fcmService.isInitialized()) {
      console.log("✓ FCM Service is ready to send notifications");

      // Get status information
      const status = fcmService.getStatus();
      console.log("Status:", status);

      // Get messaging instance for sending notifications
      const messaging = fcmService.getMessaging();
      console.log("Messaging instance obtained:", !!messaging);
    }
  } catch (error) {
    // Handle initialization failure
    console.error("✗ FCM Service initialization failed");

    // Get detailed error information
    const initError = fcmService.getInitializationError();
    if (initError) {
      console.error("Error details:", initError.message);
    }

    // Get status even after failure
    const status = fcmService.getStatus();
    console.log("Status after failure:", status);
  }
}

/**
 * Example: Validate service is ready before sending notifications
 */
export function validateBeforeSending(fcmService: FCMService) {
  try {
    // This will throw if service is not initialized
    fcmService.validateReadyToSend();
    console.log("Service is ready to send notifications");
    return true;
  } catch (error) {
    console.error("Service is not ready:", error);
    return false;
  }
}
