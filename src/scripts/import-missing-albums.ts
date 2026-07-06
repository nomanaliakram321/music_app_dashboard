import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface MissingAlbum {
  title: string;
  artist: string;
  dob: string;
  age: string;
  color: string;
  cover: string | null;
  image: string;
  spotify: string | null;
  apple: string | null;
  ranking: string | null;
  certification: string | null;
  streams: string | null;
  date: string;
}

interface ImportReport {
  generatedAt: string;
  summary: {
    totalInConstants: number;
    totalInSupabase: number;
    missingCount: number;
    matchRate: string;
  };
  missingAlbums: MissingAlbum[];
}

// Convert date string to proper format (YYYY-MM-DD)
function parseDate(dateStr: string): string {
  // dateStr format: "January 01, 1993"
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

// Format date for event name (e.g., "January 1, 2025")
function formatEventName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function importMissingAlbums() {
  console.log("🚀 Starting album import process...\n");

  try {
    // Read the JSON file - check for both possible filenames
    const possiblePaths = [
      path.join(process.cwd(), "src", "data", "missing-albums.json"),
      path.join(process.cwd(), "src", "data", "missing-albums-2026-02-12.json"),
    ];

    let jsonPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!jsonPath) {
      throw new Error(
        `JSON file not found. Tried:\n${possiblePaths.join("\n")}`,
      );
    }

    console.log(`📄 Using file: ${path.basename(jsonPath)}`);

    console.log("📖 Reading missing albums JSON file...");
    const reportData: ImportReport = JSON.parse(
      fs.readFileSync(jsonPath, "utf-8"),
    );

    const missingAlbums = reportData.missingAlbums;
    console.log(`✅ Found ${missingAlbums.length} missing albums to import\n`);

    // Group albums by date
    const albumsByDate: Record<string, MissingAlbum[]> = {};
    missingAlbums.forEach((album) => {
      if (!albumsByDate[album.date]) {
        albumsByDate[album.date] = [];
      }
      albumsByDate[album.date].push(album);
    });

    console.log(
      `📅 Albums grouped into ${Object.keys(albumsByDate).length} unique dates\n`,
    );

    // Fetch existing events to avoid duplicates
    console.log("🔍 Fetching existing events...");
    const { data: existingEvents, error: eventsError } = await supabase
      .from("events")
      .select("event_id, event_date, name");

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    const existingEventsByDate = new Map(
      existingEvents?.map((e) => [e.event_date, e]) || [],
    );
    console.log(`✅ Found ${existingEvents?.length || 0} existing events\n`);

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each date
    for (const [dateKey, albums] of Object.entries(albumsByDate).sort()) {
      console.log(`\n📆 Processing ${dateKey} (${albums.length} albums)...`);

      // Import albums for this date
      let imported = 0;
      let skipped = 0;

      for (const album of albums) {
        try {
          // Check if album already exists (by title + release_date)
          const albumReleaseDate = parseDate(album.dob);
          const { data: existing } = await supabase
            .from("albums")
            .select("id")
            .eq("title", album.title)
            .eq("release_date", albumReleaseDate)
            .single();

          if (existing) {
            console.log(`   ⏭️  Skipped (exists): "${album.title}"`);
            skipped++;
            continue;
          }

          // Insert album
          const { error: insertError } = await supabase.from("albums").insert({
            title: album.title,
            artist: album.artist,
            image: album.image || "",
            cover: album.cover || "",
            color: album.color || "",
            release_date: albumReleaseDate,
            dob: album.dob,
            age: album.age || "",
            ranking: album.ranking || null,
            certification: album.certification || null,
            streams: album.streams || null,
            spotify: album.spotify || null,
            apple: album.apple || null,
          });

          if (insertError) {
            console.error(`   ❌ Failed to import "${album.title}": ${insertError.message}`);
            totalErrors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error(`   ❌ Error processing "${album.title}":`, err);
          totalErrors++;
        }
      }

      totalImported += imported;
      totalSkipped += skipped;

      console.log(
        `   📊 Date complete: ${imported} imported, ${skipped} skipped`,
      );
    }

    // Final summary
    console.log("\n" + "═".repeat(60));
    console.log("📊 IMPORT SUMMARY");
    console.log("═".repeat(60));
    console.log(`Total albums in JSON:     ${missingAlbums.length}`);
    console.log(`✅ Successfully imported:  ${totalImported}`);
    console.log(`⏭️  Skipped (duplicates):  ${totalSkipped}`);
    console.log(`❌ Errors:                ${totalErrors}`);
    console.log("═".repeat(60) + "\n");

    console.log("✅ Import process completed!");
  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }
}

// Run the import
importMissingAlbums()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
