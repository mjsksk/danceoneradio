import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import * as webpush from "jsr:@negrel/webpush";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { importVapidKeysFromBase64 } from "../_shared/vapidHelper.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("send-test-notification: received request");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidEmail = Deno.env.get("VAPID_EMAIL")!;

    if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      console.error("send-test-notification: missing configuration");
      throw new Error("Missing configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, endpoint } = await req.json();

    if (!message?.title || !message?.body) {
      return new Response(JSON.stringify({ error: "Title and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!endpoint) {
      return new Response(JSON.stringify({ error: "Endpoint required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the subscription for this endpoint
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("endpoint", endpoint)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: "Subscription not found", details: subError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize VAPID email
    const cleanEmail = vapidEmail.replace(/[<>\s]/g, '').replace(/^mailto:/, '');
    const contactInfo = `mailto:${cleanEmail}`;

    // Import VAPID keys from base64url format
    const vapidKeys = await importVapidKeysFromBase64(vapidPublicKey, vapidPrivateKey);

    const appServer = await webpush.ApplicationServer.new({ contactInformation: contactInfo, vapidKeys });

    const pushPayload = JSON.stringify({
      title: message.title,
      body: message.body,
      icon: message.icon || "/favicon.png",
      badge: "/favicon.png",
      url: message.url || "/",
    });

    const pushSub: webpush.PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    console.log(`send-test-notification: sending to ${subscription.endpoint.substring(0, 60)}...`);

    const subscriber = appServer.subscribe(pushSub);
    await subscriber.pushTextMessage(pushPayload, { ttl: 60 });
    console.log(`send-test-notification: push sent successfully`);

    return new Response(
      JSON.stringify({ success: true, message: "Test notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-test-notification: error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
