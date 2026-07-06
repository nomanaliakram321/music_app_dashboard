// Supabase Edge Function: get-album-stats
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AlbumStats {
  id: string;
  title?: string;
  artist?: string;
  release_date?: string;
  certification?: string | null;
  ranking?: number | null;
  streams?: string | null;
  spotify?: string | null;
  apple?: string | null;
  updated_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { album_id } = await req.json();

    if (!album_id) {
      return new Response(JSON.stringify({ error: "album_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Step 1: Check if record exists in database
    const { data: existingAlbum, error: fetchError } = await supabase
      .from("albums")
      .select("*")
      .eq("id", album_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Database fetch error:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Database error",
          source: "fresh",
          album: null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Check if data is older than 1 month
    const isDataOlderThanMonth = (lastUpdated: string | null) => {
      if (!lastUpdated) return true;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(lastUpdated) < oneMonthAgo;
    };

    const dataIsOld =
      !existingAlbum || isDataOlderThanMonth(existingAlbum.updated_at);

    // Step 3: Determine what needs to be fetched from Groq
    const needsSpotifyLink = !existingAlbum?.spotify;
    const needsAppleMusicLink = !existingAlbum?.apple;
    const needsCertification = !existingAlbum?.certification || dataIsOld;
    const needsRanking = !existingAlbum?.ranking || dataIsOld;
    const needsStreams = !existingAlbum?.streams || dataIsOld;

    const needsAnyData =
      needsSpotifyLink ||
      needsAppleMusicLink ||
      needsCertification ||
      needsRanking ||
      needsStreams;

    // Step 4: If nothing needs updating, return cached data
    if (!needsAnyData && existingAlbum) {
      console.log("✅ Returning cached data (all fields present and fresh)");
      return new Response(
        JSON.stringify({
          source: "cached_queued",
          album: existingAlbum,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 5: Fetch missing or old data from Groq
    console.log("🔄 Fetching data from Groq:", {
      dataIsOld,
      needsSpotifyLink,
      needsAppleMusicLink,
      needsCertification,
      needsRanking,
      needsStreams,
    });

    let groqData: Partial<AlbumStats> = {};

    if (needsAnyData) {
      let prompt = `Get information for the album "${existingAlbum?.title}" by "${existingAlbum?.artist}". Provide:\n`;
      if (needsCertification)
        prompt += "- Certification (e.g., Gold, Platinum, Multi-Platinum)\n";
      if (needsRanking) prompt += "- Billboard ranking (peak position)\n";
      if (needsStreams) prompt += "- Total streams (approximate)\n";
      if (needsSpotifyLink) prompt += "- Spotify link\n";
      if (needsAppleMusicLink) prompt += "- Apple Music link\n";
      prompt +=
        "\nReturn as JSON with keys: certification, ranking, streams, spotify, apple";

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a music database assistant. Return only valid JSON without markdown formatting.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.1,
            max_tokens: 500,
          }),
        },
      );

      if (groqResponse.ok) {
        const groqResult = await groqResponse.json();
        const content = groqResult.choices?.[0]?.message?.content;

        if (content) {
          try {
            const parsed = JSON.parse(
              content.replace(/```json\n?|\n?```/g, ""),
            );

            const cleanValue = (val: any) => {
              if (
                val === "None" ||
                val === "none" ||
                val === "N/A" ||
                val === "" ||
                val === "null"
              )
                return null;
              return val;
            };

            if (needsCertification)
              groqData.certification = cleanValue(parsed.certification);
            if (needsRanking) groqData.ranking = cleanValue(parsed.ranking);
            if (needsStreams) groqData.streams = cleanValue(parsed.streams);
            if (needsSpotifyLink) groqData.spotify = cleanValue(parsed.spotify);
            if (needsAppleMusicLink) groqData.apple = cleanValue(parsed.apple);
          } catch (parseError) {
            console.error("Failed to parse Groq response:", parseError);
          }
        }
      }
    }

    // Step 6: Merge existing data with new Groq data
    const updatedAlbum: AlbumStats = {
      ...existingAlbum,
      ...(needsCertification && groqData.certification !== undefined
        ? { certification: groqData.certification }
        : {}),
      ...(needsRanking && groqData.ranking !== undefined
        ? { ranking: groqData.ranking }
        : {}),
      ...(needsStreams && groqData.streams !== undefined
        ? { streams: groqData.streams }
        : {}),
      ...(needsSpotifyLink && groqData.spotify !== undefined
        ? { spotify: groqData.spotify }
        : {}),
      ...(needsAppleMusicLink && groqData.apple !== undefined
        ? { apple: groqData.apple }
        : {}),
      updated_at: new Date().toISOString(),
    };

    // Step 7: Update database
    console.log("💾 Attempting to update database with:", updatedAlbum);

    const { data: savedAlbum, error: updateError } = await supabase
      .from("albums")
      .update(updatedAlbum)
      .eq("id", album_id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Database update error:", updateError);
      return new Response(
        JSON.stringify({
          source: "fresh",
          album: updatedAlbum,
          error: `Database update failed: ${updateError.message}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Data updated successfully in database");

    return new Response(
      JSON.stringify({
        source: "fresh",
        album: savedAlbum,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        source: "fresh",
        album: null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
