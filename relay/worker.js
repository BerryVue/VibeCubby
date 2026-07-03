/* VibeCubby push relay.
   Self-hosted cubbies cannot talk to Apple's push service directly - APNs
   only accepts pushes signed by the app publisher's key. This tiny relay
   accepts a message from any cubby and forwards it to APNs.

   Deploy once (the VibeCubby project runs the canonical one), with secrets:
     APNS_AUTH_KEY  - contents of the .p8 key from the Apple Developer portal
     APNS_KEY_ID    - the key's 10-character id
     APNS_TEAM_ID   - the Apple Developer team id
   and a var:
     APNS_TOPIC     - the companion app's bundle id (com.vibecubby.app)

   Privacy note, stated plainly: notification titles/bodies pass through this
   relay unencrypted on their way to Apple. Don't send secrets in pushes. */

const MAX_BODY = 2048;
let cachedJwt = null;
let cachedJwtAt = 0;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return respond(null, 204);
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/send") {
      return respond({ ok: true, service: "vibecubby-push-relay", usage: "POST /send { deviceToken, title, body, badge? }" }, request.method === "GET" ? 200 : 404);
    }

    let payload;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY) return respond({ error: "Payload too large." }, 413);
      payload = JSON.parse(raw);
    } catch {
      return respond({ error: "Invalid JSON." }, 400);
    }

    const deviceToken = clean(payload.deviceToken, 200);
    const title = clean(payload.title, 120);
    const body = clean(payload.body, 400);
    if (!/^[0-9a-f]{16,200}$/i.test(deviceToken)) return respond({ error: "Invalid device token." }, 400);
    if (!title && !body) return respond({ error: "Nothing to send." }, 400);

    if (!env.APNS_AUTH_KEY || !env.APNS_KEY_ID || !env.APNS_TEAM_ID) {
      return respond({ error: "Relay is not configured yet (missing APNs credentials)." }, 503);
    }

    const jwt = await apnsJwt(env);
    const apnsResponse = await fetch(`https://api.push.apple.com/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": env.APNS_TOPIC || "com.vibecubby.app",
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        aps: {
          alert: { title: title || "Your cubby", body },
          badge: Number.isFinite(Number(payload.badge)) ? Number(payload.badge) : undefined,
          sound: "default",
        },
      }),
    });

    if (apnsResponse.status === 200) return respond({ ok: true });
    const detail = await apnsResponse.text().catch(() => "");
    // 410 = token no longer valid; tell the cubby so it can forget the device.
    return respond({ ok: false, status: apnsResponse.status, detail: detail.slice(0, 300), gone: apnsResponse.status === 410 }, 502);
  },
};

async function apnsJwt(env) {
  // Apple wants tokens refreshed between 20 and 60 minutes; cache for 40.
  if (cachedJwt && Date.now() - cachedJwtAt < 40 * 60 * 1000) return cachedJwt;

  const header = base64url(JSON.stringify({ alg: "ES256", kid: env.APNS_KEY_ID }));
  const claims = base64url(JSON.stringify({ iss: env.APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) }));
  const message = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.APNS_AUTH_KEY),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(message));
  cachedJwt = `${message}.${base64url(signature)}`;
  cachedJwtAt = Date.now();
  return cachedJwt;
}

function pemToArrayBuffer(pem) {
  const base64 = String(pem).replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function base64url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function respond(body, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      ...(body === null ? {} : { "Content-Type": "application/json; charset=utf-8" }),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
