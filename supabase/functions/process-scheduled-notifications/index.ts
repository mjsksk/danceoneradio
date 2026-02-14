import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { sendWebPush } from "../_shared/webpush.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Allow service role key (from pg_cron) or validate as admin user
    if (token !== supabaseServiceKey) {
      const anonClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (!userRole) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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

    const cleanEmail = vapidEmail.replace(/[<>\s]/g, '').replace(/^mailto:/, '');
    let totalProcessed = 0;

    for (const notif of pendingNotifications) {
      const pushPayloadStr = JSON.stringify({
        title: notif.title,
        body: notif.body,
        icon: notif.icon_url || "/favicon.png",
        badge: "/favicon.png",
        url: "/",
      });

      let sentCount = 0;

      for (const sub of subscriptions) {
        try {
          const result = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            pushPayloadStr,
            vapidPublicKey,
            vapidPrivateKey,
            cleanEmail,
          );

          if (result.success) {
            sentCount++;
          } else if (result.status === 410 || result.status === 404) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
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
