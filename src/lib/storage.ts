import { supabase } from "./supabase";
import { logger } from "./logger";

const BUCKET_NAME = "music_app";

/**
 * Upload image to Supabase Storage
 * @param file - File object to upload
 * @param folder - Optional folder path (e.g., 'albums', 'covers')
 * @returns Public URL of uploaded image or null if failed
 */
export const uploadImage = async (
  file: File,
  folder: string = "albums",
): Promise<string | null> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Upload exception:", error);
    return null;
  }
};

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 * @returns true if deleted successfully
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${BUCKET_NAME}/`,
    );
    if (pathParts.length < 2) return false;

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete exception:", error);
    return false;
  }
};

/**
 * Ensure storage bucket exists (run once on app init)
 */
export const ensureBucketExists = async (): Promise<void> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ],
      });
    }
  } catch (error) {
    console.log("Error!");
    console.error("Bucket check error:", error);
  }
};
