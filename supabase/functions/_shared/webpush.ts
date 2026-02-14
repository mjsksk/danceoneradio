// Manual Web Push implementation using Web Crypto API
// Implements RFC 8291 (aes128gcm) and RFC 8292 (VAPID)

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concatBuffers(...buffers: (Uint8Array | ArrayBuffer)[]): Uint8Array {
  const arrays = buffers.map(b => b instanceof Uint8Array ? b : new Uint8Array(b));
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

const encoder = new TextEncoder();

// Create VAPID JWT
async function createVapidJwt(
  privateKey: CryptoKey,
  publicKeyRaw: Uint8Array,
  audience: string,
  subject: string,
): Promise<{ authorization: string }> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600,
    sub: subject,
  };

  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoder.encode(unsigned),
  );

  // Convert DER signature to raw r||s format (64 bytes)
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;

  if (sigBytes.length === 64) {
    // Already raw format
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  } else {
    // DER format: 0x30 <len> 0x02 <rlen> <r> 0x02 <slen> <s>
    let offset = 2; // skip 0x30 <len>
    offset++; // skip 0x02
    const rLen = sigBytes[offset++];
    const rBytes = sigBytes.slice(offset, offset + rLen);
    offset += rLen;
    offset++; // skip 0x02
    const sLen = sigBytes[offset++];
    const sBytes = sigBytes.slice(offset, offset + sLen);

    // Pad/trim to 32 bytes
    r = new Uint8Array(32);
    s = new Uint8Array(32);
    r.set(rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes, 32 - Math.min(rBytes.length, 32));
    s.set(sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes, 32 - Math.min(sBytes.length, 32));
  }

  const rawSig = concatBuffers(r, s);
  const sigB64 = uint8ArrayToBase64url(rawSig);
  const token = `${unsigned}.${sigB64}`;
  const k = uint8ArrayToBase64url(publicKeyRaw);

  return {
    authorization: `vapid t=${token}, k=${k}`,
  };
}

// HKDF-SHA-256
async function hkdfDerive(
  ikm: ArrayBuffer,
  salt: ArrayBuffer,
  info: Uint8Array,
  length: number,
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8,
  );
}

// RFC 8291 aes128gcm encryption
async function encryptPayload(
  payload: Uint8Array,
  subscriptionPublicKey: Uint8Array,
  authSecret: Uint8Array,
): Promise<{ ciphertext: Uint8Array; localPublicKey: Uint8Array }> {
  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );

  // Export local public key (65 bytes, uncompressed)
  const localPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey),
  );

  // Import subscriber's public key for ECDH
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    subscriptionPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // ECDH shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKeyPair.privateKey,
    256,
  );

  // key_info = "WebPush: info" || 0x00 || ua_public || as_public
  const keyInfo = concatBuffers(
    encoder.encode("WebPush: info\0"),
    subscriptionPublicKey,
    localPublicKey,
  );

  // IKM = HKDF-Extract(auth_secret, ecdh_secret) then HKDF-Expand with key_info
  const prk = await hkdfDerive(sharedSecret, authSecret.buffer, keyInfo, 32);

  // Derive content encryption key: HKDF(salt, ikm, "Content-Encoding: aes128gcm" || 0x01, 16)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const cekInfo = concatBuffers(encoder.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([0x01]));
  const cek = await hkdfDerive(prk, salt.buffer, cekInfo, 16);

  // Derive nonce: HKDF(salt, ikm, "Content-Encoding: nonce" || 0x01, 12)
  const nonceInfo = concatBuffers(encoder.encode("Content-Encoding: nonce\0"), new Uint8Array([0x01]));
  const nonce = await hkdfDerive(prk, salt.buffer, nonceInfo, 12);

  // Add padding delimiter (0x02 for final record)
  const paddedPayload = concatBuffers(payload, new Uint8Array([2]));

  // AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, tagLength: 128 },
    aesKey,
    paddedPayload,
  );

  // Build aes128gcm record:
  // salt (16) || rs (4, big-endian uint32) || idlen (1) || keyid (65) || encrypted
  const rs = 4096; // record size
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs, false);

  const header = concatBuffers(
    salt,
    rsBytes,
    new Uint8Array([localPublicKey.length]),
    localPublicKey,
  );

  const ciphertext = concatBuffers(header, new Uint8Array(encrypted));

  return { ciphertext, localPublicKey };
}

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

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
): Promise<PushResult> {
  const vapidPublicKeyRaw = base64urlToUint8Array(vapidPublicKeyB64);
  const vapidPrivateKeyBytes = base64urlToUint8Array(vapidPrivateKeyB64);

  // Import VAPID keys
  const x = uint8ArrayToBase64url(vapidPublicKeyRaw.slice(1, 33));
  const y = uint8ArrayToBase64url(vapidPublicKeyRaw.slice(33, 65));
  const d = uint8ArrayToBase64url(vapidPrivateKeyBytes);

  const vapidPrivateKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );

  // Get audience from endpoint
  const audience = new URL(subscription.endpoint).origin;

  // Create VAPID authorization
  const { authorization } = await createVapidJwt(
    vapidPrivateKey,
    vapidPublicKeyRaw,
    audience,
    `mailto:${vapidEmail}`,
  );

  // Encrypt payload
  const subscriptionPublicKey = base64urlToUint8Array(subscription.p256dh);
  const authSecret = base64urlToUint8Array(subscription.auth);
  const payloadBytes = encoder.encode(payload);

  const { ciphertext } = await encryptPayload(payloadBytes, subscriptionPublicKey, authSecret);

  // Send to push service
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "TTL": "86400",
      "Urgency": "high",
      "Authorization": authorization,
    },
    body: ciphertext,
  });

  const body = await response.text().catch(() => "");

  return {
    success: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
    endpoint: subscription.endpoint,
  };
}
