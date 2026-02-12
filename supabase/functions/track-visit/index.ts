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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page_path } = await req.json();
    if (!page_path || typeof page_path !== "string") {
      return new Response(JSON.stringify({ error: "page_path required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Compute privacy-safe visitor hash
    const visitorHash = await sha256(`${ip}::${userAgent}`);

    // Geolocate IP
    let country: string | null = null;
    let countryCode: string | null = null;
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.status === "success") {
          country = geo.country;
          countryCode = geo.countryCode;
        }
      }
    } catch (e) {
      console.error("Geolocation failed:", e);
    }

    // Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if returning visitor
    const { count } = await supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })
      .eq("visitor_hash", visitorHash)
      .limit(1);

    const isReturning = (count ?? 0) > 0;

    // Insert visit
    const { error } = await supabase.from("site_visits").insert({
      visitor_hash: visitorHash,
      country,
      country_code: countryCode,
      page_path,
      is_returning: isReturning,
    });

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to record visit" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-visit error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
