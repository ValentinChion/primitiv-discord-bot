// Web Push implementation using Web Crypto API + fetch (Cloudflare Workers compatible).
// Replaces 'web-push' which relies on Node.js https.request, unavailable in CF Workers.
// Implements RFC 8291 (message encryption) + RFC 8188 (aes128gcm) + RFC 8292 (VAPID).

const ENC = new TextEncoder();

function b64uDecode(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const buf = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function b64uEncode(buf: ArrayBuffer | Uint8Array<ArrayBuffer>): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// HKDF-Extract: HMAC-SHA256(salt, ikm) → returns PRK as CryptoKey
async function hkdfExtract(
  salt: Uint8Array<ArrayBuffer>,
  ikm: ArrayBuffer | Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const saltKey = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const prk = await crypto.subtle.sign("HMAC", saltKey, ikm);
  return crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

// HKDF-Expand: T(1..n) concatenated, trimmed to `length` bytes
async function hkdfExpand(
  prk: CryptoKey,
  info: Uint8Array<ArrayBuffer>,
  length: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const out = new Uint8Array(new ArrayBuffer(length));
  let t = new Uint8Array(new ArrayBuffer(0));
  for (let i = 1, pos = 0; pos < length; i++) {
    const block = new Uint8Array(new ArrayBuffer(t.length + info.length + 1));
    block.set(t);
    block.set(info, t.length);
    block[t.length + info.length] = i;
    t = new Uint8Array(await crypto.subtle.sign("HMAC", prk, block));
    const take = Math.min(t.length, length - pos);
    out.set(t.subarray(0, take), pos);
    pos += take;
  }
  return out;
}

// Import VAPID private key (raw EC scalar base64url) + public key (uncompressed point base64url)
async function importVAPIDKey(privB64u: string, pubB64u: string): Promise<CryptoKey> {
  const pub = b64uDecode(pubB64u); // 65 bytes: 0x04 || x || y
  return crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      d: privB64u,
      x: b64uEncode(pub.slice(1, 33).buffer),
      y: b64uEncode(pub.slice(33, 65).buffer),
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

// Generate VAPID JWT for the push endpoint's origin
async function vapidJWT(endpoint: string): Promise<{ jwt: string; publicKey: string }> {
  const { origin } = new URL(endpoint);
  const header = b64uEncode(ENC.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })).buffer);
  const payload = b64uEncode(
    ENC.encode(
      JSON.stringify({
        aud: origin,
        exp: Math.floor(Date.now() / 1000) + 43200,
        sub: process.env.VAPID_SUBJECT,
      }),
    ).buffer,
  );
  const sigInput = ENC.encode(`${header}.${payload}`);
  const key = await importVAPIDKey(
    process.env.VAPID_PRIVATE_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  );
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, sigInput);
  return {
    jwt: `${header}.${payload}.${b64uEncode(sig)}`,
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  };
}

// Encrypt payload per RFC 8291 using aes128gcm
async function encryptPayload(
  payload: string,
  p256dhB64u: string,
  authB64u: string,
): Promise<{ salt: Uint8Array<ArrayBuffer>; serverPublicKey: Uint8Array<ArrayBuffer>; ciphertext: Uint8Array<ArrayBuffer> }> {
  const clientPub = b64uDecode(p256dhB64u); // 65-byte uncompressed EC point
  const authSecret = b64uDecode(authB64u);

  // Ephemeral server ECDH key pair
  const serverKP = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ]);

  // Export server public key as uncompressed point (0x04 || x || y)
  const serverJWK = (await crypto.subtle.exportKey("jwk", serverKP.publicKey)) as JsonWebKey;
  const serverPub = new Uint8Array(new ArrayBuffer(65));
  serverPub[0] = 0x04;
  serverPub.set(b64uDecode(serverJWK.x!), 1);
  serverPub.set(b64uDecode(serverJWK.y!), 33);

  // Import client public key for ECDH
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPub,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // ECDH shared secret
  const ecdhSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientKey },
    serverKP.privateKey,
    256,
  );

  // RFC 8291 §3.3 — derive IKM from ECDH secret + auth secret
  // key_info = "WebPush: info\0" || ua_public (65B) || as_public (65B)
  const keyInfo = new Uint8Array(new ArrayBuffer(14 + 65 + 65));
  keyInfo.set(ENC.encode("WebPush: info\x00"));
  keyInfo.set(clientPub, 14);
  keyInfo.set(serverPub, 14 + 65);

  const prkKey = await hkdfExtract(authSecret, ecdhSecret);
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  // RFC 8188 — random salt, then derive CEK + nonce
  const salt = new Uint8Array(new ArrayBuffer(16));
  crypto.getRandomValues(salt);

  const prk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(
    prk,
    new Uint8Array(ENC.encode("Content-Encoding: aes128gcm\x00").buffer),
    16,
  );
  const nonce = await hkdfExpand(
    prk,
    new Uint8Array(ENC.encode("Content-Encoding: nonce\x00").buffer),
    12,
  );

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);

  // Append padding delimiter 0x02 (last record marker per RFC 8188)
  const pt = ENC.encode(payload);
  const padded = new Uint8Array(new ArrayBuffer(pt.length + 1));
  padded.set(pt);
  padded[pt.length] = 0x02;

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded),
  );

  return { salt, serverPublicKey: serverPub, ciphertext };
}

// Build RFC 8188 aes128gcm body: header (86 bytes) + ciphertext
function buildBody(
  salt: Uint8Array<ArrayBuffer>,
  serverPublicKey: Uint8Array<ArrayBuffer>,
  ciphertext: Uint8Array<ArrayBuffer>,
): ArrayBuffer {
  // salt(16) + rs(4 BE) + idlen(1) + keyid(65) = 86 bytes header
  const buf = new ArrayBuffer(86 + ciphertext.length);
  const view = new Uint8Array(buf);
  view.set(salt, 0);
  new DataView(buf).setUint32(16, 4096, false); // rs = 4096, big-endian
  view[20] = 65; // idlen
  view.set(serverPublicKey, 21);
  view.set(ciphertext, 86);
  return buf;
}

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function sendWebPushNotification(
  sub: PushSubscription,
  payload: string,
): Promise<void> {
  const [{ jwt, publicKey }, { salt, serverPublicKey, ciphertext }] = await Promise.all([
    vapidJWT(sub.endpoint),
    encryptPayload(payload, sub.keys.p256dh, sub.keys.auth),
  ]);

  const body = buildBody(salt, serverPublicKey, ciphertext);

  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt},k=${publicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
    },
    body,
  });

  if (!res.ok) {
    throw Object.assign(new Error(`Push failed: ${res.status}`), { statusCode: res.status });
  }
}
