import RAW_CONFIG from "../vibecubby.config.json" with { type: "json" };
import { THEMES, appIcon, serviceWorkerSource, renderAppHtml } from "./ui.js";

const CONFIG = normalizeConfig(RAW_CONFIG);
const THEME = THEMES[CONFIG.theme] || THEMES.hearth;
const APP_NAME = CONFIG.cubbyName;
const SHORT_NAME = CONFIG.shortName;
const MEMBERS = CONFIG.members;
const CATEGORIES = CONFIG.categories;
const REDIRECTS = CONFIG.redirects;
const SESSION_COOKIE = "vibecubby_session";
const SESSION_DAYS = 30;

const DEFAULT_APPS = CONFIG.apps;

const DEFAULT_ITEMS = [
  seedItem("Milk", "essential", "low", "Refrigerated", "1 gallon", "Check date before buying.", "Dairy", MEMBERS[0], 10),
  seedItem("Eggs", "essential", "need", "Refrigerated", "18 count", "", "Dairy", MEMBERS[0], 20),
  seedItem("Broccoli", "occasional", "need", "Produce", "2 crowns", "", "Produce", MEMBERS[MEMBERS.length - 1], 30),
  seedItem("Rice", "pantry", "have", "Pantry", "1 bag", "Jasmine rice in lower cabinet.", "Dry goods", MEMBERS[0], 40),
  seedItem("Dish soap", "essential", "low", "Household", "1 bottle", "", "Cleaning", MEMBERS[MEMBERS.length - 1], 50),
];

const APP_ICON = appIcon(THEME);
const SERVICE_WORKER = serviceWorkerSource();
const APP_HTML = renderAppHtml(CONFIG, THEME);

function normalizeConfig(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const cubbyName = clean(input.cubbyName, 60) || "My Cubby";
  const members = (Array.isArray(input.members) ? input.members : [])
    .map((member) => clean(member, 40))
    .filter(Boolean)
    .slice(0, 8);
  const categories = (Array.isArray(input.categories) ? input.categories : [])
    .map((category) => clean(category, 40))
    .filter(Boolean)
    .slice(0, 24);
  const redirects = {};
  if (input.redirects && typeof input.redirects === "object") {
    for (const [from, to] of Object.entries(input.redirects)) {
      const cleanFrom = clean(from, 120).toLowerCase();
      const cleanTo = clean(to, 120).toLowerCase();
      if (cleanFrom && cleanTo) redirects[cleanFrom] = cleanTo;
    }
  }
  return {
    cubbyName,
    shortName: clean(input.shortName, 30) || cubbyName,
    tagline: clean(input.tagline, 120) || "Homemade apps, living on my own shelf",
    owner: clean(input.owner, 60) || (members[0] || "Owner"),
    members: members.length ? members : ["You"],
    theme: clean(input.theme, 20) || "hearth",
    redirects,
    categories: categories.length ? categories : ["Essentials", "Other"],
    apps: Array.isArray(input.apps) ? input.apps : [],
  };
}

let schemaReady = false;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const redirectTo = REDIRECTS[url.hostname.toLowerCase()];
    if (redirectTo) {
      url.hostname = redirectTo;
      return Response.redirect(url.toString(), 301);
    }

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }

      if (url.pathname === "/" || url.pathname === "/pantry") {
        return html(APP_HTML);
      }
      if (url.pathname === "/manifest.webmanifest") {
        return json(manifest(url.origin));
      }
      if (url.pathname === "/icon.svg") {
        return svg(APP_ICON);
      }
      if (url.pathname === "/sw.js") {
        return javascript(SERVICE_WORKER);
      }
      if (url.pathname === "/health") {
        return json({ ok: true, app: APP_NAME, platform: "VibeCubby", storage: Boolean(env.DB) });
      }

      if (url.pathname === "/api/session" && request.method === "GET") {
        const authenticated = await isAuthenticated(request, env);
        return json({
          appName: APP_NAME,
          tagline: CONFIG.tagline,
          theme: CONFIG.theme,
          members: MEMBERS,
          privateMode: Boolean(env.APP_PIN),
          authenticated,
          categories: CATEGORIES,
        });
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        return login(request, env, url);
      }

      if (url.pathname === "/api/logout" && request.method === "POST") {
        return json(
          { ok: true },
          200,
          { "Set-Cookie": clearCookie(url.protocol === "https:") },
        );
      }

      if (url.pathname.startsWith("/api/")) {
        const unauthorized = await requireAuth(request, env);
        if (unauthorized) return unauthorized;
        await ensureDatabase(env);
      }

      if (url.pathname === "/api/apps" && request.method === "GET") {
        return json({ apps: await listApps(env) });
      }

      if (url.pathname === "/api/apps" && request.method === "POST") {
        const app = normalizeApp(await request.json(), url.origin);
        await upsertApp(env, app);
        return json({ app }, 201);
      }

      const appMatch = url.pathname.match(/^\/api\/apps\/([^/]+)$/);
      if (appMatch && request.method === "PATCH") {
        const id = decodeURIComponent(appMatch[1]);
        const existing = await getApp(env, id);
        if (!existing) return json({ error: "App not found." }, 404);
        const app = normalizeApp({ ...existing, ...(await request.json()), id, createdAt: existing.createdAt }, url.origin);
        await upsertApp(env, app);
        return json({ app });
      }

      if (appMatch && request.method === "DELETE") {
        await run(
          env,
          "update app_meta set deleted_at = ?, updated_at = ? where id = ?",
          new Date().toISOString(),
          new Date().toISOString(),
          decodeURIComponent(appMatch[1]),
        );
        return json({ ok: true });
      }

      if (url.pathname === "/api/pantry/items" && request.method === "GET") {
        return json({ items: await listItems(env) });
      }

      if (url.pathname === "/api/pantry/items" && request.method === "POST") {
        const item = normalizeItem(await request.json());
        await upsertItem(env, item);
        return json({ item }, 201);
      }

      const itemMatch = url.pathname.match(/^\/api\/pantry\/items\/([^/]+)$/);
      if (itemMatch && request.method === "PATCH") {
        const id = decodeURIComponent(itemMatch[1]);
        const existing = await getItem(env, id);
        if (!existing) return json({ error: "Item not found." }, 404);
        const item = normalizeItem({ ...existing, ...(await request.json()), id, createdAt: existing.createdAt });
        await upsertItem(env, item);
        return json({ item });
      }

      if (itemMatch && request.method === "DELETE") {
        await run(
          env,
          "update grocery_items set deleted_at = ?, updated_at = ? where id = ?",
          new Date().toISOString(),
          new Date().toISOString(),
          decodeURIComponent(itemMatch[1]),
        );
        return json({ ok: true });
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: "Something went wrong." }, 500);
    }
  },
};

async function login(request, env, url) {
  const body = await request.json().catch(() => ({}));
  const configuredPin = clean(env.APP_PIN, 80);
  const providedPin = clean(body.pin, 80);

  if (configuredPin && providedPin !== configuredPin) {
    return json({ error: "Wrong PIN." }, 401);
  }

  const token = await createSessionToken(env);
  return json(
    { ok: true, appName: APP_NAME, privateMode: Boolean(configuredPin), authenticated: true },
    200,
    { "Set-Cookie": sessionCookie(token, url.protocol === "https:") },
  );
}

async function requireAuth(request, env) {
  if (await isAuthenticated(request, env)) return null;
  return json({ error: "PIN required." }, 401);
}

async function isAuthenticated(request, env) {
  const configuredPin = clean(env.APP_PIN, 80);
  if (!configuredPin) return true;
  if (request.headers.get("x-app-pin") === configuredPin) return true;
  const cookie = parseCookies(request.headers.get("Cookie") || "")[SESSION_COOKIE];
  return verifySessionToken(cookie, env);
}

async function createSessionToken(env) {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const message = `v1.${expiresAt}`;
  const signature = await hmacHex(message, sessionSecret(env));
  return `${message}.${signature}`;
}

async function verifySessionToken(token, env) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const message = `${parts[0]}.${parts[1]}`;
  const expected = await hmacHex(message, sessionSecret(env));
  return constantTimeEqual(expected, parts[2]);
}

function sessionSecret(env) {
  return clean(env.SESSION_SECRET, 240) || clean(env.APP_PIN, 80) || "local-dev-session-secret";
}

async function ensureDatabase(env) {
  assertDb(env);
  if (schemaReady) return;

  await run(env, `
    create table if not exists app_meta (
      id text primary key,
      name text not null,
      slug text not null unique,
      path text not null,
      url text not null,
      category text not null,
      runtime text not null,
      visibility text not null,
      status text not null,
      accent text not null,
      icon text not null,
      notes text not null,
      sort_order integer not null default 100,
      created_at text not null,
      updated_at text not null,
      deleted_at text
    )
  `);
  await run(env, `
    create table if not exists grocery_items (
      id text primary key,
      name text not null,
      list_type text not null,
      status text not null,
      category text not null,
      quantity text not null,
      notes text not null,
      aisle text not null,
      modified_by text not null,
      last_purchased_at text,
      sort_order integer not null default 100,
      created_at text not null,
      updated_at text not null,
      deleted_at text
    )
  `);

  const appCount = await first(env, "select count(*) as count from app_meta where deleted_at is null");
  if (Number(appCount?.count || 0) === 0) {
    for (const app of DEFAULT_APPS) await upsertApp(env, normalizeApp(app, ""));
  }

  const itemCount = await first(env, "select count(*) as count from grocery_items where deleted_at is null");
  if (Number(itemCount?.count || 0) === 0) {
    for (const item of DEFAULT_ITEMS) await upsertItem(env, item);
  }

  schemaReady = true;
}

async function listApps(env) {
  const rows = await all(env, `
    select *
    from app_meta
    where deleted_at is null
    order by
      case status when 'live' then 1 when 'draft' then 2 else 3 end,
      sort_order,
      lower(name)
  `);
  return rows.map(rowToApp);
}

async function getApp(env, id) {
  const row = await first(env, "select * from app_meta where id = ? and deleted_at is null limit 1", id);
  return row ? rowToApp(row) : null;
}

async function upsertApp(env, app) {
  await run(
    env,
    `
      insert into app_meta (
        id, name, slug, path, url, category, runtime, visibility, status,
        accent, icon, notes, sort_order, created_at, updated_at, deleted_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null)
      on conflict(id) do update set
        name = excluded.name,
        slug = excluded.slug,
        path = excluded.path,
        url = excluded.url,
        category = excluded.category,
        runtime = excluded.runtime,
        visibility = excluded.visibility,
        status = excluded.status,
        accent = excluded.accent,
        icon = excluded.icon,
        notes = excluded.notes,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at,
        deleted_at = null
    `,
    app.id,
    app.name,
    app.slug,
    app.path,
    app.url,
    app.category,
    app.runtime,
    app.visibility,
    app.status,
    app.accent,
    app.icon,
    app.notes,
    app.sortOrder,
    app.createdAt,
    app.updatedAt,
  );
}

async function listItems(env) {
  const rows = await all(env, `
    select *
    from grocery_items
    where deleted_at is null
    order by
      case status
        when 'need' then 1
        when 'low' then 2
        when 'have' then 3
        when 'bought' then 4
        when 'skipped' then 5
        else 6
      end,
      case list_type when 'essential' then 1 when 'occasional' then 2 when 'pantry' then 3 else 4 end,
      sort_order,
      lower(name)
  `);
  return rows.map(rowToItem);
}

async function getItem(env, id) {
  const row = await first(env, "select * from grocery_items where id = ? and deleted_at is null limit 1", id);
  return row ? rowToItem(row) : null;
}

async function upsertItem(env, item) {
  await run(
    env,
    `
      insert into grocery_items (
        id, name, list_type, status, category, quantity, notes, aisle,
        modified_by, last_purchased_at, sort_order, created_at, updated_at, deleted_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null)
      on conflict(id) do update set
        name = excluded.name,
        list_type = excluded.list_type,
        status = excluded.status,
        category = excluded.category,
        quantity = excluded.quantity,
        notes = excluded.notes,
        aisle = excluded.aisle,
        modified_by = excluded.modified_by,
        last_purchased_at = excluded.last_purchased_at,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at,
        deleted_at = null
    `,
    item.id,
    item.name,
    item.listType,
    item.status,
    item.category,
    item.quantity,
    item.notes,
    item.aisle,
    item.modifiedBy,
    item.lastPurchasedAt,
    item.sortOrder,
    item.createdAt,
    item.updatedAt,
  );
}

function normalizeApp(input, origin) {
  const now = new Date().toISOString();
  const name = clean(input.name, 80) || "Untitled App";
  const slug = slugify(clean(input.slug, 80) || name);
  const path = normalizePath(clean(input.path, 120) || `/${slug}`);
  const rawUrl = clean(input.url, 240) || path;
  const url = rawUrl.startsWith("/") ? rawUrl : rawUrl;

  if (!url.startsWith("/") && !url.startsWith("https://") && !url.startsWith("http://")) {
    throw new Error("A valid URL is required.");
  }

  return {
    id: clean(input.id, 100) || slug,
    name,
    slug,
    path,
    url: origin && url.startsWith("/") ? origin + url : url,
    category: clean(input.category, 40) || "Personal",
    runtime: clean(input.runtime, 40) || "Cloudflare Worker",
    visibility: oneOf(input.visibility, ["private", "pin", "public"], "private"),
    status: oneOf(input.status, ["live", "draft", "needs-work"], "live"),
    accent: /^#[0-9a-f]{6}$/i.test(String(input.accent || "")) ? String(input.accent) : "#315f4f",
    icon: oneOf(input.icon, ["pantry", "boat", "home", "tool", "list", "spark"], "tool"),
    notes: clean(input.notes, 220),
    sortOrder: toInt(input.sortOrder, 100),
    createdAt: clean(input.createdAt, 40) || now,
    updatedAt: now,
  };
}

function normalizeItem(input) {
  const now = new Date().toISOString();
  const name = clean(input.name, 80);
  if (!name) throw new Error("Item name is required.");
  const status = oneOf(input.status, ["need", "low", "have", "bought", "skipped"], "need");
  const listType = oneOf(input.listType, ["essential", "occasional", "pantry"], "occasional");
  const category = CATEGORIES.includes(String(input.category)) ? String(input.category) : "Other";
  const lastPurchasedAt = status === "have" || status === "bought"
    ? clean(input.lastPurchasedAt, 20) || now.slice(0, 10)
    : clean(input.lastPurchasedAt, 20) || null;

  return {
    id: clean(input.id, 120) || crypto.randomUUID(),
    name,
    listType,
    status,
    category,
    quantity: clean(input.quantity, 60),
    notes: clean(input.notes, 220),
    aisle: clean(input.aisle, 60),
    modifiedBy: MEMBERS.includes(String(input.modifiedBy)) ? String(input.modifiedBy) : MEMBERS[0],
    lastPurchasedAt,
    sortOrder: toInt(input.sortOrder, 100),
    createdAt: clean(input.createdAt, 40) || now,
    updatedAt: now,
  };
}

function seedItem(name, listType, status, category, quantity, notes, aisle, modifiedBy, sortOrder) {
  const now = new Date().toISOString();
  return {
    id: `seed-${slugify(name)}`,
    name,
    listType,
    status,
    category,
    quantity,
    notes,
    aisle,
    modifiedBy,
    lastPurchasedAt: status === "have" || status === "bought" ? now.slice(0, 10) : null,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
}

function rowToApp(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    path: row.path,
    url: row.url,
    category: row.category,
    runtime: row.runtime,
    visibility: row.visibility,
    status: row.status,
    accent: row.accent,
    icon: row.icon,
    notes: row.notes,
    sortOrder: Number(row.sort_order || 100),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToItem(row) {
  return {
    id: row.id,
    name: row.name,
    listType: row.list_type,
    status: row.status,
    category: row.category,
    quantity: row.quantity,
    notes: row.notes,
    aisle: row.aisle,
    modifiedBy: row.modified_by,
    lastPurchasedAt: row.last_purchased_at,
    sortOrder: Number(row.sort_order || 100),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function all(env, sql, ...params) {
  const statement = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
  const result = await statement.all();
  return result.results || [];
}

async function first(env, sql, ...params) {
  const statement = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
  return statement.first();
}

async function run(env, sql, ...params) {
  const statement = params.length ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
  return statement.run();
}

function assertDb(env) {
  if (!env.DB) throw new Error("D1 binding DB is missing.");
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...securityHeaders(),
      ...extraHeaders,
    },
  });
}

function html(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...securityHeaders(),
    },
  });
}

function svg(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      ...securityHeaders(),
    },
  });
}

function javascript(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      ...securityHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-app-pin",
  };
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; manifest-src 'self'; base-uri 'self'; frame-ancestors 'none'",
  };
}

function manifest(origin) {
  return {
    name: APP_NAME,
    short_name: SHORT_NAME,
    start_url: `${origin}/`,
    scope: `${origin}/`,
    display: "standalone",
    background_color: THEME.background,
    theme_color: THEME.themeColor,
    icons: [
      { src: `${origin}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    ],
  };
}

function sessionCookie(token, secure) {
  const securePart = secure ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${securePart}`;
}

function clearCookie(secure) {
  const securePart = secure ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${securePart}`;
}

function parseCookies(cookieHeader) {
  const cookies = {};
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return cookies;
}

async function hmacHex(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToHex(signature);
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function slugify(value) {
  return clean(value, 100).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || crypto.randomUUID();
}

function normalizePath(value) {
  const slug = slugify(value);
  if (value.startsWith("/") && !value.startsWith("//")) return value.slice(0, 120);
  return `/${slug}`;
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(String(value)) ? String(value) : fallback;
}

function toInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

