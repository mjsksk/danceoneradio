import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

interface PushMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidEmail = Deno.env.get("VAPID_EMAIL");

    if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      throw new Error("Missing Supabase or VAPID configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

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

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { message, targetUserIds } = await req.json();

    if (!message || !message.title || !message.body) {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get subscriptions for target users
    let query = supabase
      .from("push_subscriptions")
      .select("*");

    if (targetUserIds && targetUserIds.length > 0) {
      query = query.in("user_id", targetUserIds);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          sentCount: 0, 
          message: "No subscriptions found" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send push notifications
    let sentCount = 0;
    let failedCount = 0;

    for (const sub of subscriptions) {
      try {
        const pushMessage = JSON.stringify({
          notification: {
            title: message.title,
            body: message.body,
            icon: message.icon,
            badge: message.badge,
            tag: message.tag,
            requireInteraction: message.requireInteraction || false,
          },
        });

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Crypto-Key": `dh=${sub.p256dh}`,
            "Authorization": `vapid t=${generateVapidToken(vapidPrivateKey, vapidPublicKey, vapidEmail)}, k=${vapidPublicKey}`,
          },
          body: pushMessage,
        });

        if (response.status === 201 || response.status === 200) {
          sentCount++;
        } else if (response.status === 410) {
          // Subscription no longer valid
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          failedCount++;
        } else {
          failedCount++;
        }
        
        await response.text(); // Consume response
      } catch (error) {
        console.error("Error sending notification:", error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalAttempted: subscriptions.length,
      }),
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

// Simplified VAPID token generation (real implementation would use proper JWT)
function generateVapidToken(
  privateKey: string,
  publicKey: string,
  email: string
): string {
  // For production, you should use a proper JWT library
  // This is a placeholder - the actual implementation requires proper signing
  const header = btoa(JSON.stringify({ alg: "ES256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      aud: "https://fcm.googleapis.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: email,
    })
  );
  
  // Note: Proper implementation would sign with ES256
  // For now, return a basic token structure
  return `${header}.${payload}.signature`;
}
