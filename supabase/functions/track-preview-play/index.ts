import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/webpush.ts";

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

    // Fire-and-forget: push notify admin subscribers
    notifyAdmins(supabase, title, artist, pagePath).catch((e) =>
      console.error("notifyAdmins error:", e)
    );

    // Fire-and-forget: email notify admins
    emailAdmins(supabase, title, artist, pagePath).catch((e) =>
      console.error("emailAdmins error:", e)
    );


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

async function notifyAdmins(
  supabase: ReturnType<typeof createClient>,
  title: string,
  artist: string,
  pagePath: string | null,
) {
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidEmail = Deno.env.get("VAPID_EMAIL");
  if (!vapidPublic || !vapidPrivate || !vapidEmail) {
    console.warn("VAPID config missing, skipping admin push");
    return;
  }

  const { data: admins, error: adminErr } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (adminErr || !admins?.length) return;

  const adminIds = admins.map((a: { user_id: string }) => a.user_id);
  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", adminIds);
  if (subErr || !subs?.length) return;

  const payload = JSON.stringify({
    title: "🎧 Track preview played",
    body: `${title} — ${artist}`,
    icon: "/favicon.png",
    badge: "/favicon.png",
    url: pagePath || "/admin",
  });
  const cleanEmail = vapidEmail.replace(/[<>\s]/g, "").replace(/^mailto:/, "");

  await Promise.all(
    subs.map(async (s: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        const result = await sendWebPush(
          { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
          payload,
          vapidPublic,
          vapidPrivate,
          cleanEmail,
        );
        if (!result.success && (result.status === 410 || result.status === 404)) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      } catch (e) {
        console.error("admin push send error:", e);
      }
    }),
  );
}

async function emailAdmins(
  supabase: ReturnType<typeof createClient>,
  title: string,
  artist: string,
  pagePath: string | null,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("RESEND_API_KEY missing, skipping admin email");
    return;
  }

  // Collect admin emails from profiles joined with user_roles
  const { data: admins, error: adminErr } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (adminErr || !admins?.length) return;

  const adminIds = admins.map((a: { user_id: string }) => a.user_id);
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("email")
    .in("id", adminIds);
  if (profErr) {
    console.error("profiles fetch error:", profErr);
  }

  const emails = new Set<string>();
  for (const p of profiles ?? []) {
    if (p?.email) emails.add(p.email as string);
  }
  // Fallback / additional ADMIN_EMAIL secret
  const adminEmailSecret = Deno.env.get("ADMIN_EMAIL");
  if (adminEmailSecret) emails.add(adminEmailSecret);

  if (!emails.size) return;

  const safeTitle = title.replace(/[<>]/g, "");
  const safeArtist = artist.replace(/[<>]/g, "");
  const safePath = (pagePath || "/").replace(/[<>"']/g, "");

  const subject = `🎧 Track preview played: ${safeTitle} — ${safeArtist}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color:#222;margin:0 0 12px;">New track preview played</h2>
      <p style="margin:6px 0;"><strong>Title:</strong> ${safeTitle}</p>
      <p style="margin:6px 0;"><strong>Artist:</strong> ${safeArtist}</p>
      <p style="margin:6px 0;"><strong>Page:</strong> ${safePath}</p>
      <p style="margin:6px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;" />
      <p style="font-size:12px;color:#888;">
        Automated notification from Dance One Radio.
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dance One Radio <noreply@danceoneradio.com>",
      to: Array.from(emails),
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Resend admin email error:", res.status, txt);
  }
}

