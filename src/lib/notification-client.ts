import type { Album } from "../types/database";

export interface NotificationResult {
  sent: number;
  failed: number;
  total: number;
}

export class NotificationClient {
  async sendAlbumNotification(album: Album, action: "added" | "updated" = "added"): Promise<NotificationResult> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const title = action === "updated" && album.certification
      ? `RIAA ${album.certification} Certified`
      : action === "updated"
      ? "Album Updated"
      : `New Album: ${album.artist}`;

    const body = action === "updated" && album.certification
      ? `${album.artist}'s "${album.title}" is now officially RIAA ${album.certification} certified.`
      : action === "updated"
      ? `${album.artist}'s "${album.title}" has been updated.`
      : `${album.artist} just dropped "${album.title}". Listen now!`;

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ title, body, album_id: album.id }),
    });

    if (!response.ok) {
      throw new Error(`Notification failed (${response.status})`);
    }

    return await response.json();
  }
}
