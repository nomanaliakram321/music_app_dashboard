import { z } from "zod";

/**
 * Input validation schemas
 * Use these to validate all user inputs and API requests
 */

// Album validation
export const albumSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  artist: z.string()
    .min(1, "Artist is required")
    .max(200, "Artist must be less than 200 characters")
    .trim(),
  release_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Release date must be in YYYY-MM-DD format"),
  image: z.string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("")),
  spotify_link: z.string()
    .url("Spotify link must be a valid URL")
    .optional()
    .or(z.literal("")),
  apple_music_link: z.string()
    .url("Apple Music link must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  is_diamond: z.boolean().optional(),
});

export type AlbumInput = z.infer<typeof albumSchema>;

// Event validation
export const eventSchema = z.object({
  event_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format"),
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;

// CSV upload validation
export const csvAlbumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  image: z.string().optional(),
  spotify_link: z.string().optional(),
  apple_music_link: z.string().optional(),
  description: z.string().optional(),
});

// Notification validation
export const notificationSchema = z.object({
  albumId: z.string().uuid("Invalid album ID"),
  action: z.enum(["added", "updated"]).optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

// Login validation
export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Device token validation
export const deviceTokenSchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
  fcm_token: z.string().min(1, "FCM token is required"),
  platform: z.enum(["ios", "android"], {
    errorMap: () => ({ message: "Platform must be ios or android" })
  }),
  notifications_enabled: z.boolean().optional(),
});

export type DeviceTokenInput = z.infer<typeof deviceTokenSchema>;

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message
      };
    }
    return {
      success: false,
      error: "Validation failed"
    };
  }
}
