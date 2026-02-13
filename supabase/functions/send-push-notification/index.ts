import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

// Web Push requires signing JWTs with ES256 (ECDSA P-256)
async function importVapidPrivateKey(base64UrlKey: string): Promise<CryptoKey> {
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: base64UrlKey,
    // We need x and y from the public key, but for signing we only need d
    // We'll derive them from the public key
    x: "",
    y: "",
  };

  // For VAPID, we need the full JWK. We'll construct it from the raw public key.
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

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

async function generateVapidJwt(
  audience: string,
  subject: string,
  publicKeyBase64: string,
  privateKeyBase64: string
): Promise<string> {
  // Decode the public key to get x and y coordinates
  const publicKeyBytes = base64UrlDecode(publicKeyBase64);
  // Raw public key is 65 bytes: 0x04 + 32 bytes x + 32 bytes y
  const x = base64UrlEncode(publicKeyBytes.slice(1, 33));
  const y = base64UrlEncode(publicKeyBytes.slice(33, 65));

  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: privateKeyBase64,
    x,
    y,
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format (64 bytes)
  const sigBytes = new Uint8Array(signature);
  const sigB64 = base64UrlEncode(sigBytes);

  return `${unsignedToken}.${sigB64}`;
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
      throw new Error("Missing configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin role from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    const decoded = JSON.parse(atob(parts[1]));
    const userId = decoded.sub;

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
        // Extract audience from endpoint URL
        const endpointUrl = new URL(sub.endpoint);
        const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

        const jwt = await generateVapidJwt(audience, vapidEmail, vapidPublicKey, vapidPrivateKey);

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            TTL: "86400",
            Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
          },
          body: new TextEncoder().encode(pushPayload),
        });

        if (response.status === 201 || response.status === 200) {
          sentCount++;
        } else if (response.status === 410 || response.status === 404) {
          // Subscription expired, remove it
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          failedCount++;
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${response.status}`);
          failedCount++;
        }

        await response.text();
      } catch (error) {
        console.error("Push error:", error);
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
