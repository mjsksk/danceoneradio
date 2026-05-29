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
    const action = body.action === "unlike" ? "unlike" : "like";
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
    const countryCode =
      req.headers.get("cf-ipcountry") || req.headers.get("x-country") || null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

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

    const { error } = await supabase.from("track_likes").insert({
      title,
      artist,
      action,
      track_history_id: trackHistoryId,
      visitor_hash: visitorHash,
      user_id: userId,
      country_code: countryCode,
      page_path: pagePath,
      user_agent: userAgent.slice(0, 500),
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to record like" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget email to admins (only on like, to avoid spam)
    if (action === "like") {
      emailAdmins(supabase, title, artist, pagePath).catch((e) =>
        console.error("emailAdmins error:", e)
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-like error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function emailAdmins(
  supabase: ReturnType<typeof createClient>,
  title: string,
  artist: string,
  pagePath: string | null,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return;

  const { data: admins } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (!admins?.length) return;

  const adminIds = admins.map((a: { user_id: string }) => a.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .in("id", adminIds);

  const emails = new Set<string>();
  for (const p of profiles ?? []) {
    if (p?.email) emails.add(p.email as string);
  }
  const adminEmailSecret = Deno.env.get("ADMIN_EMAIL");
  if (adminEmailSecret) emails.add(adminEmailSecret);
  if (!emails.size) return;

  const safeTitle = title.replace(/[<>]/g, "");
  const safeArtist = artist.replace(/[<>]/g, "");
  const safePath = (pagePath || "/").replace(/[<>"']/g, "");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dance One Radio <noreply@danceoneradio.com>",
      to: Array.from(emails),
      subject: `❤️ Track liked: ${safeTitle} — ${safeArtist}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color:#222;margin:0 0 12px;">A listener liked a track</h2>
          <p style="margin:6px 0;"><strong>Title:</strong> ${safeTitle}</p>
          <p style="margin:6px 0;"><strong>Artist:</strong> ${safeArtist}</p>
          <p style="margin:6px 0;"><strong>Page:</strong> ${safePath}</p>
          <p style="margin:6px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr style="margin:20px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#888;">Automated notification from Dance One Radio.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Resend admin email error:", res.status, txt);
  }
}
