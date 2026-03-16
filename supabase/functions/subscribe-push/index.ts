import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimiter.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit: 5 subscriptions per IP per 10 minutes
    const clientId = getClientIdentifier(req);
    const rateCheck = await checkRateLimit(supabase, {
      endpoint: "subscribe-push",
      maxRequests: 5,
      windowMs: 600000,
    }, clientId, req.headers.get("user-agent") || undefined);

    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate endpoint is a valid HTTPS URL
    try {
      const endpointUrl = new URL(subscription.endpoint);
      if (endpointUrl.protocol !== "https:") {
        return new Response(
          JSON.stringify({ error: "Endpoint must use HTTPS" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate keys exist and are non-empty strings
    if (!subscription.keys?.p256dh || !subscription.keys?.auth ||
        typeof subscription.keys.p256dh !== "string" || typeof subscription.keys.auth !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid subscription keys" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert subscription (endpoint is unique)
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("Error saving subscription:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
