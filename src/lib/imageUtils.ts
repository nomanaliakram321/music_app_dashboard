/**
 * Convert a Supabase storage URL to use the image transform API.
 * Serves a smaller, compressed version — faster to load in lists/thumbnails.
 * Falls back to the original URL if it's not a Supabase storage URL.
 */
export function thumbUrl(url: string | null | undefined, width = 200, quality = 75): string {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=${quality}`;
}
