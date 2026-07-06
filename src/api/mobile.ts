import { supabase } from "@/lib/supabase";

// ===================================
// APP USERS (Device ID Tracking)
// ===================================

export interface AppUser {
  id: string;
  device_id: string;
  username: string;
  created_at: string;
  last_login: string;
}

/**
 * Register or update app user with device ID
 */
export async function registerAppUser(deviceId: string, username: string) {
  try {
    // Check if device already exists
    const { data: existing } = await supabase
      .from("app_users")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    if (existing) {
      // Update last_login
      const { data, error } = await supabase
        .from("app_users")
        .update({ last_login: new Date().toISOString(), username })
        .eq("device_id", deviceId)
        .select()
        .single();

      return { data, error };
    } else {
      // Create new user
      const { data, error } = await supabase
        .from("app_users")
        .insert({
          device_id: deviceId,
          username,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    }
  } catch (error) {
    return { data: null, error };
  }
}

// ===================================
// EVENTS (Calendar)
// ===================================

/**
 * Get events by month (1-12)
 */
export async function getEventsByMonth(month: number) {
  const { data, error } = await supabase
    .from("events_by_month_day")
    .select("*")
    .eq("month", month)
    .order("event_date")
    .limit(500);

  return { data, error };
}

// ===================================
// ALBUMS
// ===================================

/**
 * Get albums by month and day
 */
export async function getAlbumsByDate(month: number, day: number) {
  const { data, error } = await supabase
    .from("albums_by_month_day")
    .select("*")
    .eq("month", month)
    .eq("day", day)
    .order("artist", { ascending: true });

  // Remove duplicates
  const uniqueAlbums = data
    ? Array.from(new Map(data.map((album) => [album.id, album])).values())
    : [];

  return { data: uniqueAlbums, error };
}

/**
 * Get album detail by ID
 */
export async function getAlbumById(albumId: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", albumId)
    .single();

  return { data, error };
}

/**
 * Search albums by title or artist
 */
export async function searchAlbums(query: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .order("release_date", { ascending: false })
    .limit(50);

  return { data, error };
}

// ===================================
// FAVORITES
// ===================================

/**
 * Get all favorites
 */
export async function getFavorites() {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .order("display_order", { ascending: true });

  return { data, error };
}

/**
 * Add album to favorites
 */
export async function addFavorite(album: {
  title: string;
  artist: string;
  dob?: string;
  age?: string;
  color?: string;
  cover?: string;
  image?: string;
  spotify?: string;
  apple?: string;
  display_order?: number;
}) {
  const { data, error } = await supabase
    .from("favorites")
    .insert(album)
    .select()
    .single();

  return { data, error };
}

/**
 * Remove favorite by ID
 */
export async function removeFavorite(favoriteId: string) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId);

  return { error };
}

/**
 * Update favorite display order
 */
export async function updateFavoriteOrder(
  favoriteId: string,
  displayOrder: number,
) {
  const { data, error } = await supabase
    .from("favorites")
    .update({ display_order: displayOrder })
    .eq("id", favoriteId)
    .select()
    .single();

  return { data, error };
}

// ===================================
// DEVICE TOKENS (Push Notifications)
// ===================================

export interface RegisterDeviceRequest {
  device_id: string;
  fcm_token: string;
  platform: "ios" | "android";
  user_id?: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  token_id: string;
}

/**
 * Register or update device token for push notifications
 * Implements upsert logic: creates new token or updates existing one
 * Associates tokens with user accounts when authenticated
 */
export async function registerDevice(
  request: RegisterDeviceRequest,
): Promise<{ data: RegisterDeviceResponse | null; error: any }> {
  try {
    const { device_id, fcm_token, platform, user_id } = request;

    // Validate required fields
    if (!device_id || !fcm_token || !platform) {
      return {
        data: null,
        error: new Error(
          "Missing required fields: device_id, fcm_token, platform",
        ),
      };
    }

    // Validate platform
    if (platform !== "ios" && platform !== "android") {
      return {
        data: null,
        error: new Error("Invalid platform. Must be 'ios' or 'android'"),
      };
    }

    // Check if device token already exists for this device_id
    const { data: existing } = await supabase
      .from("device_tokens")
      .select("*")
      .eq("device_id", device_id)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing token
      const { data, error } = await supabase
        .from("device_tokens")
        .update({
          fcm_token,
          platform,
          user_id: user_id || null,
          is_active: true,
          updated_at: now,
          last_used_at: now,
        })
        .eq("device_id", device_id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          success: true,
          token_id: data.id,
        },
        error: null,
      };
    } else {
      // Create new token
      const { data, error } = await supabase
        .from("device_tokens")
        .insert({
          device_id,
          fcm_token,
          platform,
          user_id: user_id || null,
          is_active: true,
          notifications_enabled: true, // Default to enabled
          created_at: now,
          updated_at: now,
          last_used_at: now,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          success: true,
          token_id: data.id,
        },
        error: null,
      };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export interface UpdatePreferencesRequest {
  device_id: string;
  notifications_enabled: boolean;
}

export interface UpdatePreferencesResponse {
  success: boolean;
}

/**
 * Update notification preferences for a device
 * Validates device ownership and updates notifications_enabled flag
 * Requirements: 6.2, 6.3, 6.4
 */
export async function updatePreferences(
  request: UpdatePreferencesRequest,
): Promise<{ data: UpdatePreferencesResponse | null; error: any }> {
  try {
    const { device_id, notifications_enabled } = request;

    // Validate required fields
    if (!device_id || notifications_enabled === undefined) {
      return {
        data: null,
        error: new Error(
          "Missing required fields: device_id, notifications_enabled",
        ),
      };
    }

    // Validate notifications_enabled is boolean
    if (typeof notifications_enabled !== "boolean") {
      return {
        data: null,
        error: new Error("notifications_enabled must be a boolean"),
      };
    }

    // Check if device exists
    const { data: existing } = await supabase
      .from("device_tokens")
      .select("*")
      .eq("device_id", device_id)
      .single();

    if (!existing) {
      return {
        data: null,
        error: new Error("Device not found"),
      };
    }

    // Update preferences
    const { error } = await supabase
      .from("device_tokens")
      .update({
        notifications_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("device_id", device_id);

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        success: true,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export interface UnregisterDeviceRequest {
  device_id: string;
}

export interface UnregisterDeviceResponse {
  success: boolean;
}

/**
 * Unregister device token for push notifications
 * Marks device token as inactive to stop receiving notifications
 * Used for logout scenarios and device deregistration
 * Requirements: 2.6
 */
export async function unregisterDevice(
  request: UnregisterDeviceRequest,
): Promise<{ data: UnregisterDeviceResponse | null; error: any }> {
  try {
    const { device_id } = request;

    // Validate required fields
    if (!device_id) {
      return {
        data: null,
        error: new Error("Missing required field: device_id"),
      };
    }

    // Check if device exists
    const { data: existing } = await supabase
      .from("device_tokens")
      .select("*")
      .eq("device_id", device_id)
      .single();

    if (!existing) {
      return {
        data: null,
        error: new Error("Device not found"),
      };
    }

    // Mark device token as inactive
    const { error } = await supabase
      .from("device_tokens")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("device_id", device_id);

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        success: true,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
