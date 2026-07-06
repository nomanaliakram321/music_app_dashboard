import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(): Promise<string> {
  const privateKey = (Deno.env.get("FIREBASE_PRIVATE_KEY") || "").replace(/\\n/g, "\n");
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const signingInput = `${encode({ alg: "RS256", typ: "JWT" })}.${encode(payload)}`;

  const pemContents = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const jwt = `${signingInput}.${signatureB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function sendToToken(
  accessToken: string,
  fcmToken: string,
  title: string,
  body: string,
  albumId: string
) {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
  const appUrl = Deno.env.get("APP_URL") || "https://www.hiphopcalendar.live";
  const link = `${appUrl}/albums/${albumId}`;

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          data: {
            album_id: albumId,
            url: link,
            title,
            body,
          },
          android: {
            priority: "HIGH",
          },
          apns: {
            payload: {
              aps: {
                alert: { title, body },
                sound: "default",
                "content-available": 1,
              },
            },
          },
        },
      }),
    }
  );

  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, body, album_id } = await req.json();

    if (!title || !body || !album_id) {
      return new Response(JSON.stringify({ error: "title, body, album_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("fcm_token")
      .eq("is_active", true)
      .eq("notifications_enabled", true);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No tokens registered" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();
    let sent = 0;
    let failed = 0;
    const invalidTokens: string[] = [];

    for (const { fcm_token } of tokens) {
      try {
        const result = await sendToToken(accessToken, fcm_token, title, body, album_id);
        if (result.error) {
          failed++;
          if (result.error.status === "NOT_FOUND" || result.error.status === "UNREGISTERED") {
            invalidTokens.push(fcm_token);
          }
        } else {
          sent++;
        }
      } catch {
        failed++;
      }
    }

    if (invalidTokens.length > 0) {
      await supabase.from("device_tokens").update({ is_active: false }).in("fcm_token", invalidTokens);
    }

    // Store once in global history so all users can see it in the Updates tab
    if (sent > 0) {
      try {
        await supabase.from("notification_history").insert({ title, body, album_id });
      } catch (_) {
        // Non-fatal — notifications already sent
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, total: tokens.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
