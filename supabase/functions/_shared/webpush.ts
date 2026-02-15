// Web Push with aes128gcm (RFC 8291) + VAPID (RFC 8292)
// Using native Web Crypto HKDF for Deno Edge Runtime

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

// Use native Web Crypto HKDF
async function deriveHkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  lengthBits: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "HKDF", salt, info, hash: "SHA-256" },
    key,
    lengthBits,
  );
  return new Uint8Array(derived);
}

function derToRaw(der: Uint8Array): Uint8Array {
  const raw = new Uint8Array(64);
  let offset = 2;
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen > 32 ? 0 : 32 - rLen;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen > 32 ? 32 : 64 - sLen;
  raw.set(der.slice(sStart, offset + sLen), sDest);
  return raw;
}

async function createVapidAuth(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string,
): Promise<string> {
  const origin = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();

  const header = { alg: "ES256", typ: "JWT" };
  const payload = { aud: origin, exp: now + 12 * 3600, sub: `mailto:${vapidEmail}` };

  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const privateKeyBytes = base64urlDecode(vapidPrivateKey);
  const publicKeyBytes = base64urlDecode(vapidPublicKey);

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64urlEncode(publicKeyBytes.slice(1, 33)),
    y: base64urlEncode(publicKeyBytes.slice(33, 65)),
    d: base64urlEncode(privateKeyBytes),
  };

  const signingKey = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, signingKey, encoder.encode(unsignedToken));

  const sigBytes = new Uint8Array(signature);
  const rawSig = sigBytes.length === 64 ? sigBytes : derToRaw(sigBytes);

  return `vapid t=${unsignedToken}.${base64urlEncode(rawSig)},k=${vapidPublicKey}`;
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
): Promise<PushResult> {
  const encoder = new TextEncoder();

  // Decode subscriber keys
  const subscriberPubBytes = base64urlDecode(subscription.p256dh);
  const authSecret = base64urlDecode(subscription.auth);

  console.log(`webpush: subscriber pub key length: ${subscriberPubBytes.length}, auth length: ${authSecret.length}`);

  // Import subscriber's ECDH public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw", subscriberPubBytes, { name: "ECDH", namedCurve: "P-256" }, false, [],
  );

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"],
  );
  const localPubBytes = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: subscriberKey }, localKeyPair.privateKey, 256),
  );

  console.log(`webpush: shared secret length: ${sharedSecret.length}, local pub length: ${localPubBytes.length}`);

  // RFC 8291 Section 3.3: Derive IKM
  // ikm_info = "WebPush: info" || 0x00 || ua_public || as_public
  const ikmInfo = concat(
    encoder.encode("WebPush: info\0"),
    subscriberPubBytes, // ua_public (subscriber/user agent)
    localPubBytes,      // as_public (application server / local)
  );

  const ikm = await deriveHkdf(sharedSecret, authSecret, ikmInfo, 256); // 32 bytes

  console.log(`webpush: IKM length: ${ikm.length}`);

  // Random salt for content encryption
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8188: Derive CEK and nonce
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const cek = await deriveHkdf(ikm, salt, cekInfo, 128); // 16 bytes

  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = await deriveHkdf(ikm, salt, nonceInfo, 96); // 12 bytes

  console.log(`webpush: CEK length: ${cek.length}, nonce length: ${nonce.length}`);

  // Pad plaintext: content || 0x02 (final record delimiter)
  const plaintextBytes = encoder.encode(payload);
  const paddedPlaintext = concat(plaintextBytes, new Uint8Array([2]));

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, paddedPlaintext),
  );

  console.log(`webpush: plaintext: ${plaintextBytes.length}, padded: ${paddedPlaintext.length}, encrypted: ${encrypted.length}`);

  // Build aes128gcm body per RFC 8188
  // Header: salt(16) || rs(4, uint32 BE) || idlen(1) || keyid(65)
  // Record: encrypted ciphertext (includes 16-byte GCM tag)
  const rs = new Uint8Array(4);
  // rs value = size of each encrypted record. For single record, just use 4096.
  new DataView(rs.buffer).setUint32(0, 4096, false);

  const body = concat(
    salt,         // 16 bytes
    rs,           // 4 bytes
    new Uint8Array([65]), // idlen = 65 (uncompressed P-256 key)
    localPubBytes, // 65 bytes (keyid = our public key)
    encrypted,    // ciphertext with GCM tag
  );

  console.log(`webpush: body size: ${body.length} (header: 86, ciphertext: ${encrypted.length})`);

  // VAPID Authorization
  const authorization = await createVapidAuth(
    subscription.endpoint, vapidPublicKeyB64, vapidPrivateKeyB64, vapidEmail,
  );

  // Send
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "Content-Length": String(body.length),
      Authorization: authorization,
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
