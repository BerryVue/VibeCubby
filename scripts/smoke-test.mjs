import assert from "node:assert/strict";
import worker from "../src/worker.js";
import { createFakeD1 } from "./fake-d1.mjs";
import config from "../vibecubby.config.json" with { type: "json" };

const env = {
  APP_PIN: "734921",
  SESSION_SECRET: "local-smoke-secret",
  DB: createFakeD1(),
};

const base = "https://my.cubby.example";
const member = config.members[0];

const session = await request("/api/session");
assert.equal(session.status, 200);
assert.equal((await session.json()).authenticated, false);

const blocked = await request("/api/apps");
assert.equal(blocked.status, 401);

const login = await request("/api/login", {
  method: "POST",
  body: JSON.stringify({ pin: "734921" }),
  headers: { "Content-Type": "application/json" },
});
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie");
assert.ok(cookie.includes("vibecubby_session="));

const apps = await request("/api/apps", { headers: { Cookie: cookie } });
assert.equal(apps.status, 200);
assert.equal((await apps.json()).apps[0].id, "family-pantry");

const items = await request("/api/pantry/items", { headers: { Cookie: cookie } });
assert.equal(items.status, 200);
assert.ok((await items.json()).items.length >= 5);

const created = await request("/api/pantry/items", {
  method: "POST",
  headers: { Cookie: cookie, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Coffee",
    quantity: "1 bag",
    category: "Pantry",
    listType: "essential",
    status: "need",
    modifiedBy: member,
  }),
});
assert.equal(created.status, 201);
assert.equal((await created.json()).item.name, "Coffee");

const health = await request("/health");
assert.equal(health.status, 200);

console.log("Smoke test passed.");

function request(path, init = {}) {
  return worker.fetch(new Request(base + path, init), env);
}
