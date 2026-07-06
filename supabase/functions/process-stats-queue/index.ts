import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const BATCH_SIZE = 10;

interface QueueRow {
  id: string;
  album_id: string;
}

interface AlbumRow {
  id: string;
  title: string;
  artist: string;
  release_date: string;
  streams?: string | null;
  certification?: string | null;
  ranking?: string | null;
}

interface AlbumStatsResult {
  index: number;
  streams: string | null;
  certification: string | null;
  ranking: string | null;
}

const normalizeNullableString = (value: unknown) => {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text || ["none", "n/a", "null", "unknown"].includes(text.toLowerCase())) {
    return null;
  }

  return text;
};

const buildPrompt = (albums: AlbumRow[]) => {
  const albumList = albums
    .map(
      (album, index) =>
        `${index + 1}. "${album.title}" by ${album.artist} (${
          album.release_date?.slice(0, 4) || "unknown"
        })`,
    )
    .join("\n");

  return `You are a music data expert. For each album below, provide current Spotify streams (approximate), RIAA certification, and Billboard 200 peak ranking.

Albums:
${albumList}

Respond with ONLY a JSON array in this exact format, no extra text:
[
  {
    "index": 1,
    "streams": "1.2B",
    "certification": "Diamond",
    "ranking": "#1"
  }
]

Rules:
- streams: Use format like "1.2B", "500M", "2.5B". Use best estimate if exact data unavailable.
- certification: One of: Diamond, 10x Platinum, 9x Platinum, 8x Platinum, 7x Platinum, 6x Platinum, 5x Platinum, 4x Platinum, 3x Platinum, 2x Platinum, Platinum, Gold, or null.
- ranking: Billboard 200 peak position like "#1", "#5", "#23", or null if never charted.`;
};

const parseStatsJson = (text: string): AlbumStatsResult[] => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Provider response did not include a JSON array");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Provider response JSON was empty or invalid");
  }

  const results = parsed
    .map((item) => ({
      index: Number(item.index),
      streams: normalizeNullableString(item.streams),
      certification: normalizeNullableString(item.certification),
      ranking: normalizeNullableString(item.ranking),
    }))
    .filter((item) => Number.isInteger(item.index) && item.index > 0);

  if (results.length === 0) {
    throw new Error("Provider response did not include usable album indexes");
  }

  return results;
};

const fetchGeminiStats = async (prompt: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseStatsJson(text);
};

const fetchGroqStats = async (prompt: string) => {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return parseStatsJson(text);
};

const getStatsWithFailover = async (albums: AlbumRow[]) => {
  const prompt = buildPrompt(albums);

  try {
    const results = await fetchGeminiStats(prompt);
    console.log("[process-stats-queue] stats served by tier: gemini");
    return { tier: "gemini" as const, results };
  } catch (geminiError) {
    console.error("[process-stats-queue] Gemini failed:", geminiError);
  }

  try {
    const results = await fetchGroqStats(prompt);
    console.log("[process-stats-queue] stats served by tier: groq");
    return { tier: "groq" as const, results };
  } catch (groqError) {
    console.error("[process-stats-queue] Groq failed:", groqError);
  }

  console.log("[process-stats-queue] stats served by tier: local_db");
  return {
    tier: "local_db" as const,
    results: albums.map((album, index) => ({
      index: index + 1,
      streams: normalizeNullableString(album.streams),
      certification: normalizeNullableString(album.certification),
      ranking: normalizeNullableString(album.ranking),
    })),
  };
};

const releaseQueueRows = async (
  supabase: ReturnType<typeof createClient>,
  albumIds: string[],
) => {
  await supabase.from("stats_queue").update({ processing: false }).in("album_id", albumIds);
  await supabase.from("albums").update({ stats_updating: false }).in("id", albumIds);
};

const finishQueueRows = async (
  supabase: ReturnType<typeof createClient>,
  albumIds: string[],
) => {
  await supabase.from("stats_queue").delete().in("album_id", albumIds);
  await supabase.from("albums").update({ stats_updating: false }).in("id", albumIds);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: claimed, error: claimError } = await supabase.rpc("claim_stats_queue", {
    batch_size: BATCH_SIZE,
  });

  if (claimError) {
    console.error("[process-stats-queue] claim error:", claimError);
    return new Response(JSON.stringify({ error: claimError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows: QueueRow[] = claimed || [];
  if (rows.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const albumIds = rows.map((row) => row.album_id);
  const { data: albums, error: albumsError } = await supabase
    .from("albums")
    .select("id, title, artist, release_date, streams, certification, ranking")
    .in("id", albumIds);

  if (albumsError) {
    console.error("[process-stats-queue] album fetch error:", albumsError);
    await releaseQueueRows(supabase, albumIds);
    return new Response(JSON.stringify({ error: albumsError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!albums || albums.length === 0) {
    await finishQueueRows(supabase, albumIds);
    return new Response(JSON.stringify({ processed: 0, source: "local_db" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderedAlbums = albumIds
    .map((id) => albums.find((album: AlbumRow) => album.id === id))
    .filter(Boolean) as AlbumRow[];

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { tier, results } = await getStatsWithFailover(orderedAlbums);

  let successCount = 0;
  for (const result of results) {
    const album = orderedAlbums[result.index - 1];
    if (!album) continue;

    const update =
      tier === "local_db"
        ? {
            stats_last_checked: now.toISOString(),
            stats_updating: false,
          }
        : {
            streams: result.streams,
            certification: result.certification,
            ranking: result.ranking,
            stats_month: currentMonth,
            stats_last_checked: now.toISOString(),
            stats_updating: false,
          };

    const { error: updateError } = await supabase
      .from("albums")
      .update(update)
      .eq("id", album.id);

    if (updateError) {
      console.error("[process-stats-queue] album update error:", {
        albumId: album.id,
        tier,
        error: updateError,
      });
      continue;
    }

    successCount++;
  }

  await finishQueueRows(supabase, albumIds);

  console.log(
    `[process-stats-queue] Done via ${tier}: ${successCount}/${orderedAlbums.length} updated`,
  );

  return new Response(
    JSON.stringify({
      processed: successCount,
      total: rows.length,
      source: tier,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
