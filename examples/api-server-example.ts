/**
 * Backend API Server Example
 *
 * This shows how to create a backend API that uses firebase-admin safely.
 * Deploy this to a Node.js server (Express, Fastify, etc.) or serverless function.
 *
 * DO NOT import this file in your React app!
 */

import express from "express";
import cors from "cors";
import { NotificationService } from "../src/lib/notification-service";
import { supabase } from "../src/lib/supabase";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize notification service once at startup
const notificationService = new NotificationService();

// Initialize FCM on server startup
notificationService.initialize().catch((error) => {
  console.error("Failed to initialize FCM:", error);
});

/**
 * POST /api/notifications/send
 *
 * Send push notification for a new album
 */
app.post("/api/notifications/send", async (req, res) => {
  try {
    const { albumId, title, artist, image } = req.body;

    if (!albumId) {
      return res.status(400).json({ error: "albumId is required" });
    }

    // Fetch full album data from database
    const { data: album, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", albumId)
      .single();

    if (error || !album) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Send notification
    const result = await notificationService.sendAlbumNotification(album);

    res.json(result);
  } catch (error) {
    console.error("Notification API error:", error);
    res.status(500).json({
      error: "Failed to send notification",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
