import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { albumsTXT } from "../data/constants";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error(
    "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Album {
  title: string;
  artist: string;
  date: string;
  dob: string;
  color?: string;
  image?: string;
  spotify?: string;
  apple?: string;
  ranking?: string | null;
  certification?: string | null;
  streams?: string | null;
}

interface MissingAlbum extends Album {
  reason?: string;
}

async function checkMissingAlbums() {
  console.log("🔍 Starting album comparison...\n");

  try {
    // Fetch all albums from Supabase
    console.log("📡 Fetching albums from Supabase...");
    const { data: supabaseAlbums, error } = await supabase
      .from("albums")
      .select("name, event_id, created_at");

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log(`✅ Found ${supabaseAlbums?.length || 0} albums in Supabase\n`);

    // Create a Set of album names for quick lookup
    const supabaseAlbumNames = new Set(
      supabaseAlbums?.map((a) => a.name.trim().toLowerCase()) || [],
    );

    // Collect all albums from constants.ts
    console.log("📖 Processing albums from constants.ts...");
    const allAlbumsFromConstants: Album[] = [];

    Object.entries(albumsTXT).forEach(([date, albums]) => {
      if (Array.isArray(albums)) {
        albums.forEach((album: any) => {
          allAlbumsFromConstants.push({
            title: album.title.trim(),
            artist: album.artist.trim(),
            date: date,
            dob: album.dob,
            color: album.color,
            image: album.image,
            spotify: album.spotify,
            apple: album.apple,
            ranking: album.ranking,
            certification: album.certification,
            streams: album.streams,
          });
        });
      }
    });

    console.log(
      `✅ Found ${allAlbumsFromConstants.length} albums in constants.ts\n`,
    );

    // Find missing albums
    console.log("🔎 Comparing data...\n");
    const missingAlbums: MissingAlbum[] = [];

    allAlbumsFromConstants.forEach((album) => {
      const albumName = album.title.toLowerCase();

      if (!supabaseAlbumNames.has(albumName)) {
        missingAlbums.push({
          ...album,
          reason: "Not found in Supabase",
        });
      }
    });

    // Generate report
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`📊 COMPARISON SUMMARY`);
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`Total albums in constants.ts: ${allAlbumsFromConstants.length}`);
    console.log(`Total albums in Supabase:     ${supabaseAlbums?.length || 0}`);
    console.log(`Missing albums:               ${missingAlbums.length}`);
    console.log(
      `Match rate:                   ${((1 - missingAlbums.length / allAlbumsFromConstants.length) * 100).toFixed(2)}%`,
    );
    console.log("═══════════════════════════════════════════════════════════\n");

    if (missingAlbums.length > 0) {
      console.log("❌ MISSING ALBUMS:\n");

      // Group by date
      const missingByDate: Record<string, MissingAlbum[]> = {};
      missingAlbums.forEach((album) => {
        if (!missingByDate[album.date]) {
          missingByDate[album.date] = [];
        }
        missingByDate[album.date].push(album);
      });

      // Display by date
      Object.entries(missingByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, albums]) => {
          console.log(`\n📅 ${date} (${albums.length} missing):`);
          albums.forEach((album, index) => {
            console.log(
              `   ${index + 1}. "${album.title}" by ${album.artist}`,
            );
            console.log(`      Released: ${album.dob}`);
            if (album.reason) {
              console.log(`      Reason: ${album.reason}`);
            }
          });
        });

      // Save to JSON file
      const outputPath = path.join(
        process.cwd(),
        "missing-albums-report.json",
      );
      const report = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalInConstants: allAlbumsFromConstants.length,
          totalInSupabase: supabaseAlbums?.length || 0,
          missingCount: missingAlbums.length,
          matchRate: (
            (1 - missingAlbums.length / allAlbumsFromConstants.length) *
            100
          ).toFixed(2),
        },
        missingAlbums: missingAlbums,
        missingByDate: missingByDate,
      };

      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
      console.log(`\n💾 Full report saved to: ${outputPath}`);

      // Create CSV for easy import
      const csvPath = path.join(process.cwd(), "missing-albums.csv");
      const csvHeader =
        "Date,Title,Artist,Release Date,Spotify,Apple Music,Image URL\n";
      const csvRows = missingAlbums
        .map(
          (album) =>
            `"${album.date}","${album.title}","${album.artist}","${album.dob}","${album.spotify || ""}","${album.apple || ""}","${album.image || ""}"`,
        )
        .join("\n");
      fs.writeFileSync(csvPath, csvHeader + csvRows, "utf-8");
      console.log(`📄 CSV export saved to: ${csvPath}\n`);
    } else {
      console.log("✅ All albums from constants.ts are present in Supabase!\n");
    }
  } catch (error) {
    console.error("❌ Error during comparison:", error);
    throw error;
  }
}

// Run the script
checkMissingAlbums()
  .then(() => {
    console.log("✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
