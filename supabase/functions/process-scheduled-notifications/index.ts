import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { buildPushHTTPRequest } from "npm:@pushforge/builder";
import { corsHeaders } from "../_shared/corsHeaders.ts";

function base64UrlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildPrivateJWK(publicKeyBase64: string, privateKeyBase64: string) {
  const publicKeyBytes = base64UrlDecode(publicKeyBase64);
  const x = base64UrlEncode(publicKeyBytes.slice(1, 33));
  const y = base64UrlEncode(publicKeyBytes.slice(33, 65));
  return { kty: "EC", crv: "P-256", d: privateKeyBase64, x, y };
}

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending notifications that are due
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled notifications: ${fetchError.message}`);
    }

    if (!pendingNotifications?.length) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending notifications" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (!subscriptions?.length) {
      // Mark all as sent with 0 recipients
      for (const notif of pendingNotifications) {
        await supabase.from("scheduled_notifications").update({
          status: "sent",
          recipient_count: 0,
          sent_at: new Date().toISOString(),
        }).eq("id", notif.id);
      }
      return new Response(
        JSON.stringify({ success: true, processed: pendingNotifications.length, message: "No subscribers" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const privateJWK = buildPrivateJWK(vapidPublicKey, vapidPrivateKey);
    let totalProcessed = 0;

    for (const notif of pendingNotifications) {
      const pushPayload = {
        title: notif.title,
        body: notif.body,
        icon: notif.icon_url || "/favicon.png",
        badge: "/favicon.png",
        url: "/",
      };

      let sentCount = 0;

      for (const sub of subscriptions) {
        try {
          const { endpoint, headers, body } = await buildPushHTTPRequest({
            privateJWK,
            subscription: {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            message: {
              payload: JSON.stringify(pushPayload),
              adminContact: vapidEmail,
            },
          });

          const response = await fetch(endpoint, { method: "POST", headers, body });

          if (response.status === 201 || response.status === 200) {
            sentCount++;
          } else if (response.status === 410 || response.status === 404) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
          await response.text().catch(() => {});
        } catch (error) {
          console.error("Push error for subscription:", error);
        }
      }

      // Update the scheduled notification status
      await supabase.from("scheduled_notifications").update({
        status: "sent",
        recipient_count: sentCount,
        sent_at: new Date().toISOString(),
      }).eq("id", notif.id);

      // Log to push_notifications table
      await supabase.from("push_notifications").insert({
        title: notif.title,
        body: notif.body,
        image_url: notif.icon_url || null,
        recipient_count: sentCount,
        sent_by: notif.created_by,
      });

      totalProcessed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed: totalProcessed }),
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
