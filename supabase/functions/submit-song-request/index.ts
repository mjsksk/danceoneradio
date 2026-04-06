import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/corsHeaders.ts";

const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_REQUESTS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Honeypot check
    if (body.website) {
      // Bot detected - return fake success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listenerName = (body.listener_name || "").trim();
    const email = (body.email || "").trim();
    const artistName = (body.artist_name || "").trim();
    const songTitle = (body.song_title || "").trim();
    const message = (body.message || "").trim().substring(0, 300);

    // Validation
    if (!listenerName || listenerName.length > 100) {
      return new Response(JSON.stringify({ error: "Valid listener name is required (max 100 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!artistName || artistName.length > 200) {
      return new Response(JSON.stringify({ error: "Valid artist name is required (max 200 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!songTitle || songTitle.length > 200) {
      return new Response(JSON.stringify({ error: "Valid song title is required (max 200 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.acknowledged) {
      return new Response(JSON.stringify({ error: "You must acknowledge the disclaimer" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IP and user agent
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    const ipAddress = cfIp || realIp || forwardedFor?.split(",")[0].trim() || "unknown";
    const userAgent = (req.headers.get("user-agent") || "").substring(0, 500);

    // Create service-role client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { data: recentRequests, error: rlError } = await supabase
      .from("song_requests")
      .select("id")
      .eq("ip_address", ipAddress)
      .gte("created_at", windowStart);

    if (!rlError && recentRequests && recentRequests.length >= MAX_REQUESTS) {
      return new Response(JSON.stringify({ 
        error: "Too many requests. Please wait before submitting another request." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize for duplicate detection
    const normalizedArtist = artistName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedTitle = songTitle.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check for duplicates (same normalized artist+title in last 24 hours)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: duplicates } = await supabase
      .from("song_requests")
      .select("id")
      .eq("normalized_artist_name", normalizedArtist)
      .eq("normalized_song_title", normalizedTitle)
      .gte("created_at", dayAgo)
      .limit(1);

    const isDuplicate = duplicates && duplicates.length > 0;

    // Insert the request
    const { error: insertError } = await supabase
      .from("song_requests")
      .insert({
        listener_name: listenerName,
        email: email || null,
        artist_name: artistName,
        song_title: songTitle,
        message: message || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        normalized_artist_name: normalizedArtist,
        normalized_song_title: normalizedTitle,
        is_duplicate: isDuplicate,
        duplicate_reason: isDuplicate ? "Same artist + title submitted in last 24h" : null,
        source: "website",
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to submit request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
