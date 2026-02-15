// Web Push with aes128gcm (RFC 8291) + VAPID (RFC 8292)
// Pure Web Crypto implementation for Deno Edge Runtime

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

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((a, b) => a + b.length, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// HKDF Extract + Expand (SHA-256)
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, ikm);
}

async function hkdfExpand(prk: ArrayBuffer, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // Single expansion step (length <= 32 for SHA-256)
  const input = concat(info, new Uint8Array([1]));
  const okm = await crypto.subtle.sign("HMAC", key, input);
  return new Uint8Array(okm).slice(0, length);
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hkdfExtract(salt, ikm);
  return hkdfExpand(prk, info, length);
}

// Create VAPID JWT (ES256)
async function createVapidJwt(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string,
): Promise<{ authorization: string; cryptoKey: string }> {
  const origin = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "ES256", typ: "JWT" };
  const payload = {
    aud: origin,
    exp: now + 12 * 3600,
    sub: `mailto:${vapidEmail}`,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import VAPID private key
  const privateKeyBytes = base64urlDecode(vapidPrivateKey);
  const publicKeyBytes = base64urlDecode(vapidPublicKey);

  // Build JWK for P-256 private key
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64urlEncode(publicKeyBytes.slice(1, 33)),
    y: base64urlEncode(publicKeyBytes.slice(33, 65)),
    d: base64urlEncode(privateKeyBytes),
  };

  const signingKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    signingKey,
    encoder.encode(unsignedToken),
  );

  // Convert DER signature to raw r||s format for JWT
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER encoded, need to extract r and s
    rawSig = derToRaw(sigBytes);
  }

  const signatureB64 = base64urlEncode(rawSig);
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
    cryptoKey: "",
  };
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER: 0x30 <len> 0x02 <rlen> <r> 0x02 <slen> <s>
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 and length
  // r
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen > 32 ? 0 : 32 - rLen;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  // s
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen > 32 ? 32 : 64 - sLen;
  raw.set(der.slice(sStart, offset + sLen), sDest);
  return raw;
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
): Promise<PushResult> {
  const encoder = new TextEncoder();

  // 1. Decode subscriber keys
  const subscriberPublicKeyBytes = base64urlDecode(subscription.p256dh);
  const authSecret = base64urlDecode(subscription.auth);

  // 2. Import subscriber's ECDH public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    subscriberPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // 3. Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const localPublicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey),
  );

  // 4. ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: subscriberKey },
      localKeyPair.privateKey,
      256,
    ),
  );

  // 5. Derive IKM per RFC 8291 Section 3.3
  // IKM = HKDF(salt=auth_secret, ikm=shared_secret, info="WebPush: info\0" || ua_public || as_public, 32)
  const ikmInfo = concat(
    encoder.encode("WebPush: info\0"),
    subscriberPublicKeyBytes,
    localPublicKeyBytes,
  );
  const ikm = await hkdf(authSecret, sharedSecret, ikmInfo, 32);

  // 6. Generate random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 7. Derive CEK (Content Encryption Key) per RFC 8188
  // info = "Content-Encoding: aes128gcm\0"
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const cek = await hkdf(salt, ikm, cekInfo, 16);

  // 8. Derive nonce
  // info = "Content-Encoding: nonce\0"
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // 9. Pad plaintext (add delimiter byte 0x02 for final record)
  const plaintextBytes = encoder.encode(payload);
  const paddedPlaintext = concat(plaintextBytes, new Uint8Array([2]));

  // 10. Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce, tagLength: 128 },
      aesKey,
      paddedPlaintext,
    ),
  );

  // 11. Build aes128gcm body: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const rs = paddedPlaintext.length + 16; // record size = plaintext + 16-byte tag
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false); // big-endian

  const body = concat(
    salt,
    rsBytes,
    new Uint8Array([65]), // idlen = 65 (uncompressed P-256 public key)
    localPublicKeyBytes,
    encrypted,
  );

  // 12. Create VAPID authorization
  const vapid = await createVapidJwt(
    subscription.endpoint,
    vapidPublicKeyB64,
    vapidPrivateKeyB64,
    vapidEmail,
  );

  // 13. Send request
  console.log(`webpush: sending aes128gcm to ${subscription.endpoint.substring(0, 60)}`);
  console.log(`webpush: body size: ${body.length}, encrypted size: ${encrypted.length}`);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Content-Length": String(body.length),
      Authorization: vapid.authorization,
      TTL: "86400",
      Urgency: "high",
    },
    body: body,
  });

  const responseBody = await response.text().catch(() => "");
  console.log(`webpush: response ${response.status} ${response.statusText} body: ${responseBody}`);

  return {
    success: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: responseBody,
    endpoint: subscription.endpoint,
  };
}
