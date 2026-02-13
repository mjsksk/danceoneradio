import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

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

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new Response(
        JSON.stringify({ error: "Invalid subscription data" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the user ID from the JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Decode JWT to get user ID
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = JSON.parse(atob(parts[1]));
    const userId = decoded.sub;

    // Save subscription to database
    const { error } = await supabase.from("push_subscriptions").insert([
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Error saving subscription:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save subscription" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscription saved" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
