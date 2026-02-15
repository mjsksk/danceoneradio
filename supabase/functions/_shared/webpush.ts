// Web Push using @negrel/webpush (proven RFC 8291 + RFC 8292 implementation)
import { ApplicationServer } from "jsr:@negrel/webpush@0.5.0";

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushResult {
  success: boolean;
  status?: number;
  statusText?: string;
  body?: string;
  endpoint: string;
}

function base64urlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importVapidKeys(
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<CryptoKeyPair> {
  const publicKeyBytes = base64urlDecode(publicKeyB64);
  const privateKeyBytes = base64urlDecode(privateKeyB64);

  // Build JWK for the private key (includes public components)
  const x = base64urlEncode(publicKeyBytes.slice(1, 33));
  const y = base64urlEncode(publicKeyBytes.slice(33, 65));
  const d = base64urlEncode(privateKeyBytes);

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );

  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"],
  );

  return { privateKey, publicKey };
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
): Promise<PushResult> {
  try {
    // Import VAPID keys as CryptoKeyPair
    const vapidKeys = await importVapidKeys(vapidPublicKeyB64, vapidPrivateKeyB64);

    // Create application server
    const appServer = await ApplicationServer.new({
      contactInformation: `mailto:${vapidEmail}`,
      vapidKeys,
    });

    // Create push subscription object matching the Web Push API format
    const pushSub = {
      endpoint: subscription.endpoint,
      expirationTime: null,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      // Provide getKey method that the library might need
      getKey(name: string): ArrayBuffer | null {
        if (name === "p256dh") return base64urlDecode(subscription.p256dh).buffer;
        if (name === "auth") return base64urlDecode(subscription.auth).buffer;
        return null;
      },
      toJSON() {
        return {
          endpoint: subscription.endpoint,
          expirationTime: null,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };
      },
    };

    console.log(`webpush: sending via @negrel/webpush to ${subscription.endpoint.substring(0, 60)}...`);

    // Subscribe and send
    const subscriber = appServer.subscribe(pushSub as any);
    await subscriber.pushTextMessage(payload, { urgency: "high", ttl: 86400 });

    console.log(`webpush: sent successfully`);

    return {
      success: true,
      status: 201,
      statusText: "Created",
      body: "",
      endpoint: subscription.endpoint,
    };
  } catch (error) {
    console.error(`webpush: error:`, error);

    // Check if it's a PushMessageError with a response
    if (error && typeof error === "object" && "response" in error) {
      const resp = (error as any).response as Response;
      const body = await resp.text().catch(() => "");
      console.error(`webpush: push service returned ${resp.status}: ${body}`);

      // Check if subscription is gone
      if (resp.status === 410 || resp.status === 404) {
        return {
          success: false,
          status: resp.status,
          statusText: resp.statusText,
          body,
          endpoint: subscription.endpoint,
        };
      }

      return {
        success: false,
        status: resp.status,
        statusText: resp.statusText,
        body,
        endpoint: subscription.endpoint,
      };
    }

    return {
      success: false,
      status: 500,
      statusText: "Internal Error",
      body: String(error),
      endpoint: subscription.endpoint,
    };
  }
}
