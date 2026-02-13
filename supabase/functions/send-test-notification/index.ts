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

  return {
    kty: "EC",
    crv: "P-256",
    d: privateKeyBase64,
    x,
    y,
  };
}

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
      console.log("send-test-notification: no auth header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("send-test-notification: claims error", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    console.log("send-test-notification: authenticated user", userId);

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!userRole) {
      console.log("send-test-notification: user is not admin");
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

    console.log("send-test-notification: looking up subscription for endpoint", endpoint.substring(0, 60) + "...");

    // Get the subscription for this endpoint
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("endpoint", endpoint)
      .single();

    if (subError || !subscription) {
      console.error("send-test-notification: subscription not found", subError?.message);
      return new Response(
        JSON.stringify({ error: "Subscription not found", details: subError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("send-test-notification: found subscription, building push request");

    const privateJWK = buildPrivateJWK(vapidPublicKey, vapidPrivateKey);

    const pushPayload = {
      title: message.title,
      body: message.body,
      icon: message.icon || "/favicon.png",
      badge: "/favicon.png",
      url: message.url || "/",
    };

    try {
      const { endpoint: pushEndpoint, headers, body } = await buildPushHTTPRequest({
        privateJWK,
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        message: {
          payload: JSON.stringify(pushPayload),
          adminContact: vapidEmail,
        },
      });

      console.log("send-test-notification: sending to push service", pushEndpoint.substring(0, 60) + "...");

      const response = await fetch(pushEndpoint, {
        method: "POST",
        headers,
        body,
      });

      const respText = await response.text();
      console.log(`send-test-notification: push service responded ${response.status}: ${respText}`);

      if (response.status === 201 || response.status === 200) {
        return new Response(
          JSON.stringify({ success: true, message: "Test notification sent", pushStatus: response.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (response.status === 410 || response.status === 404) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        return new Response(
          JSON.stringify({ error: "Subscription expired or invalid. It has been removed. Please re-enable notifications and try again." }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error(`send-test-notification: push failed ${response.status}: ${respText}`);
        return new Response(
          JSON.stringify({ error: `Push service returned ${response.status}`, details: respText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("send-test-notification: push error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("send-test-notification: error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
