import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import {
  buildPushPayload,
  type VapidKeys,
  type PushSubscription as WebPushSubscription,
  type PushMessage,
} from "npm:@block65/webcrypto-web-push";
import { corsHeaders } from "../_shared/corsHeaders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidEmail = Deno.env.get("VAPID_EMAIL")!;

    if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
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

    const { message } = await req.json();

    if (!message?.title || !message?.body) {
      return new Response(JSON.stringify({ error: "Title and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError || !subscriptions?.length) {
      return new Response(
        JSON.stringify({ success: true, sentCount: 0, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize VAPID email: strip angle brackets, spaces, and ensure mailto: prefix
    const cleanEmail = vapidEmail.replace(/[<>\s]/g, '').replace(/^mailto:/, '');
    const vapidSubject = `mailto:${cleanEmail}`;
    console.log(`🔔 VAPID subject: ${vapidSubject}`);
    console.log(`🔔 VAPID public key (first 20): ${vapidPublicKey.substring(0, 20)}...`);
    console.log(`🔔 Subscription count: ${subscriptions.length}`);

    const vapid: VapidKeys = {
      subject: vapidSubject,
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey,
    };

    const pushPayload = JSON.stringify({
      title: message.title,
      body: message.body,
      icon: message.icon || "/favicon.png",
      badge: "/favicon.png",
      url: message.url || "/",
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const sub of subscriptions) {
      try {
        const subscription: WebPushSubscription = {
          endpoint: sub.endpoint,
          expirationTime: null,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const pushMessage: PushMessage = {
          data: pushPayload,
          options: { ttl: 60 },
        };

        console.log(`🔔 Sending to: ${sub.endpoint.substring(0, 60)}...`);

        const payload = await buildPushPayload(pushMessage, subscription, vapid);
        
        // Log the actual request details
        const payloadHeaders = payload.headers instanceof Headers 
          ? Object.fromEntries(payload.headers.entries()) 
          : payload.headers;
        console.log(`🔔 Payload headers:`, JSON.stringify(payloadHeaders));
        console.log(`🔔 Payload method: ${payload.method}`);
        console.log(`🔔 Payload body type: ${payload.body?.constructor?.name}, byteLength: ${payload.body instanceof ArrayBuffer ? payload.body.byteLength : payload.body instanceof Uint8Array ? payload.body.byteLength : 'unknown'}`);

        const response = await fetch(subscription.endpoint, payload);
        const responseBody = await response.text();
        const respHeaders = Object.fromEntries(response.headers.entries());
        console.log(`🔔 Response: status=${response.status}, headers=${JSON.stringify(respHeaders)}, body=${responseBody}`);

        if (response.status === 201 || response.status === 200) {
          sentCount++;
        } else if (response.status === 410 || response.status === 404) {
          console.log(`🔔 Subscription expired, removing`);
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          failedCount++;
        } else {
          console.error(`🔔 Push failed ${response.status}: ${responseBody}`);
          failedCount++;
        }
      } catch (error) {
        console.error("🔔 Push error:", error);
        failedCount++;
      }
    }

    // Log the notification
    await supabase.from("push_notifications").insert({
      title: message.title,
      body: message.body,
      image_url: message.icon || null,
      recipient_count: sentCount,
      sent_by: userId,
    });

    return new Response(
      JSON.stringify({ success: true, sentCount, failedCount, total: subscriptions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
