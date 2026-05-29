import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clean(s: unknown, max = 255): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t) return null;
  return t.slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = clean(body.title);
    const artist = clean(body.artist);
    const pagePath = clean(body.pagePath, 500);
    const trackHistoryId =
      typeof body.trackHistoryId === "string" &&
      /^[0-9a-f-]{36}$/i.test(body.trackHistoryId)
        ? body.trackHistoryId
        : null;

    if (!title || !artist) {
      return new Response(JSON.stringify({ error: "title and artist required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const visitorHash = await sha256(`${ip}::${userAgent}`);

    // Optional country from Cloudflare-style header
    const countryCode =
      req.headers.get("cf-ipcountry") || req.headers.get("x-country") || null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Optional user_id from auth header
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const { data } = await supabase.auth.getUser(token);
        userId = data.user?.id ?? null;
      } catch {
        /* ignore */
      }
    }

    const { error } = await supabase.from("track_preview_plays").insert({
      title,
      artist,
      track_history_id: trackHistoryId,
      visitor_hash: visitorHash,
      user_id: userId,
      country: null,
      country_code: countryCode,
      page_path: pagePath,
      user_agent: userAgent.slice(0, 500),
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to record play" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-preview-play error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
