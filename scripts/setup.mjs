#!/usr/bin/env node
/* One-command cubby setup: Cloudflare login, D1 database, secrets, deploy.
   The goal: a stranger with a free Cloudflare account is live in ~10 minutes. */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { randomBytes, randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "wrangler.cmd" : "wrangler");
const tomlPath = path.join(root, "wrangler.toml");

banner("VibeCubby setup");

if (!existsSync(wranglerBin)) {
  fail("wrangler is not installed. Run `npm install` first, then `npm run setup` again.");
}

// 1. Personal config -------------------------------------------------------
const configPath = path.join(root, "vibecubby.config.json");
if (!existsSync(configPath)) {
  copyFileSync(path.join(root, "vibecubby.config.example.json"), configPath);
  step("Created vibecubby.config.json from the example. Edit it any time to rename or re-theme your cubby.");
} else {
  step("Found vibecubby.config.json.");
}

// 2. Cloudflare auth -------------------------------------------------------
const who = wrangler(["whoami"], { capture: true });
if (!who.ok || /not authenticated/i.test(who.out)) {
  step("You are not logged in to Cloudflare yet. A browser window will open - approve the login there.");
  const login = wrangler(["login"]);
  if (!login.ok) fail("Cloudflare login did not complete. Run `npx wrangler login` yourself, then retry setup.");
} else {
  step("Cloudflare login looks good.");
}

// 3. D1 database -----------------------------------------------------------
let toml = readFileSync(tomlPath, "utf8");
const dbName = (toml.match(/database_name\s*=\s*"([^"]+)"/) || [])[1] || "vibecubby";
if (toml.includes("REPLACE_WITH_D1_DATABASE_ID")) {
  step(`Creating D1 database "${dbName}"...`);
  const created = wrangler(["d1", "create", dbName], { capture: true });
  let id = (created.out.match(/database_id\s*=\s*"([0-9a-f-]{36})"/) || [])[1];
  if (!id) {
    // Database may already exist from a previous run - look it up.
    const list = wrangler(["d1", "list", "--json"], { capture: true });
    try {
      const rows = JSON.parse(list.out.slice(list.out.indexOf("[")));
      id = (rows.find((row) => row.name === dbName) || {}).uuid;
    } catch {}
  }
  if (!id) fail("Could not create or find the D1 database. Run `npx wrangler d1 create " + dbName + "` and paste the id into wrangler.toml.");
  toml = toml.replace("REPLACE_WITH_D1_DATABASE_ID", id);
  writeFileSync(tomlPath, toml);
  step(`Database ready (${id}) and saved to wrangler.toml.`);
} else {
  step("wrangler.toml already has a database id - reusing it.");
}

// 4. Migrations ------------------------------------------------------------
step("Applying database migrations...");
const migrate = wrangler(["d1", "migrations", "apply", dbName, "--remote"]);
if (!migrate.ok) fail("Migrations failed - see the output above.");

// 5. Secrets ---------------------------------------------------------------
const readline = createInterface({ input: process.stdin, output: process.stdout });
const suggested = String(randomInt(100000, 1000000));
const pinAnswer = (await readline.question(`Pick a PIN for your cubby door [press enter for ${suggested}]: `)).trim();
readline.close();
const pin = pinAnswer || suggested;
step("Saving your PIN and a session secret to Cloudflare...");
const putPin = wrangler(["secret", "put", "APP_PIN"], { input: pin });
const putSecret = wrangler(["secret", "put", "SESSION_SECRET"], { input: randomBytes(32).toString("hex") });
if (!putPin.ok || !putSecret.ok) fail("Could not save secrets - see the output above.");

// 6. Deploy ----------------------------------------------------------------
step("Deploying your cubby... (if Cloudflare asks about a workers.dev subdomain, say yes and pick a name)");
const deploy = wrangler(["deploy"], { capture: true, echo: true });
if (!deploy.ok) fail("Deploy failed - see the output above.");
const url = (deploy.out.match(/https:\/\/[^\s]+\.workers\.dev/) || [])[0]
  || (deploy.out.match(/^\s{2}([a-z0-9.-]+\.[a-z]{2,}) \(custom domain\)/mi) || [])[1];

banner("Your cubby is live!");
console.log(`  URL:  ${url ? (url.startsWith("http") ? url : "https://" + url) : "see the deploy output above"}`);
console.log(`  PIN:  ${pin}`);
console.log("");
console.log("  Open it on your phone and choose 'Add to Home Screen'.");
console.log("  Publish your first app:  npx vibecubby publish ./path-to-your-app --name \"My App\"");
console.log("");

// ---------------------------------------------------------------------------
function wrangler(args, options = {}) {
  const result = spawnSync(wranglerBin, args, {
    cwd: root,
    input: options.input === undefined ? undefined : options.input + "\n",
    stdio: options.capture
      ? [options.input === undefined ? "inherit" : "pipe", "pipe", "pipe"]
      : [options.input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
    encoding: "utf8",
  });
  const out = (result.stdout || "") + (result.stderr || "");
  if (options.capture && options.echo) process.stdout.write(out);
  return { ok: result.status === 0, out };
}

function banner(text) {
  console.log("\n=== " + text + " ===\n");
}

function step(text) {
  console.log("-> " + text);
}

function fail(text) {
  console.error("\n!! " + text + "\n");
  process.exit(1);
}
