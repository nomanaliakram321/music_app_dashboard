import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const currentYear = today.getFullYear();

    const notifications: Array<{ title: string; body: string; album_id: string }> = [];

    // 1. Album Birthday — release_date anniversary every 5 years
    const { data: birthdayAlbums } = await supabase
      .from("albums")
      .select("id, title, artist, release_date")
      .not("release_date", "is", null);

    for (const album of birthdayAlbums || []) {
      const releaseDate = new Date(album.release_date);
      const albumMonthDay = `${String(releaseDate.getMonth() + 1).padStart(2, "0")}-${String(releaseDate.getDate()).padStart(2, "0")}`;
      const yearsAgo = currentYear - releaseDate.getFullYear();
      if (albumMonthDay === monthDay && yearsAgo > 0 && yearsAgo % 5 === 0) {
        notifications.push({
          title: "Hip Hop Anniversary",
          body: `${yearsAgo} Years Ago Today: ${album.artist} released the classic "${album.title}". Celebrate the legacy and listen now.`,
          album_id: album.id,
        });
      }
    }

    // 2. Billboard #1 Anniversary — chart_number_one_date every 5 years
    const { data: chartAlbums } = await supabase
      .from("albums")
      .select("id, title, artist, chart_number_one_date")
      .not("chart_number_one_date", "is", null);

    for (const album of chartAlbums || []) {
      const chartDate = new Date(album.chart_number_one_date);
      const chartMonthDay = `${String(chartDate.getMonth() + 1).padStart(2, "0")}-${String(chartDate.getDate()).padStart(2, "0")}`;
      const yearsAgo = currentYear - chartDate.getFullYear();
      if (chartMonthDay === monthDay && yearsAgo > 0 && yearsAgo % 5 === 0) {
        notifications.push({
          title: "Billboard History",
          body: `On this day in ${chartDate.getFullYear()}, ${album.artist} hit #1 on the Billboard 200 with "${album.title}". See how it stacks up against today's hits.`,
          album_id: album.id,
        });
      }
    }

    // Send all notifications
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    let totalSent = 0;

    for (const notif of notifications) {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify(notif),
      });
      const data = await res.json();
      totalSent += data.sent || 0;
    }

    return new Response(
      JSON.stringify({ processed: notifications.length, sent: totalSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
