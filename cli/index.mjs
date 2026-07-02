#!/usr/bin/env node
/* vibecubby publish - copy a built static app onto the shelf, deploy, register.
   Designed so an AI agent (or a human) can run one command and get a live URL:

     npx vibecubby publish ./my-app --name "My App"

   Options:
     --name    Display name on the shelf (default: folder name)
     --slug    URL slug (default: slugified name)
     --notes   One-line description shown on the shelf card
     --accent  Hex color for the shelf card icon (default: rotates a palette)
     --visibility  private | pin | public (default: private)
     --env     wrangler environment to deploy (e.g. jonathan)
     --url     Base URL of the deployed cubby, for shelf registration
               (default: $VIBECUBBY_URL, else parsed from deploy output)
     --pin     Cubby PIN for shelf registration (default: $VIBECUBBY_PIN)
     --no-deploy   Copy + register only; skip wrangler deploy
*/

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "wrangler.cmd" : "wrangler");

const args = process.argv.slice(2);
const command = args[0];
if (command !== "publish") {
  console.log("Usage: vibecubby publish <app-directory> [--name \"My App\"] [--notes \"...\"] [--env name] [--url https://...] [--pin 123456]");
  process.exit(command ? 1 : 0);
}

const flags = {};
const positional = [];
for (let index = 1; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--no-deploy") { flags.noDeploy = true; continue; }
  if (arg.startsWith("--")) { flags[arg.slice(2)] = args[index + 1]; index += 1; continue; }
  positional.push(arg);
}

const sourceDir = path.resolve(process.cwd(), positional[0] || ".");
if (!existsSync(path.join(sourceDir, "index.html"))) {
  fail(`No index.html found in ${sourceDir}. Point me at a built static app (a folder with an index.html).`);
}

const name = flags.name || titleCase(path.basename(sourceDir));
const slug = slugify(flags.slug || name);
if (["api", "pantry", "icon.svg", "sw.js", "health"].includes(slug)) fail(`"${slug}" is a reserved path - pick another slug.`);

const targetDir = path.join(root, "apps", slug);

// 1. Copy the app onto the shelf ------------------------------------------
if (path.resolve(sourceDir) !== path.resolve(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true });
  step(`Copied ${path.basename(sourceDir)} -> apps/${slug}/`);
} else {
  step(`apps/${slug}/ is already on the shelf.`);
}

// 2. Deploy -----------------------------------------------------------------
let deployOut = "";
if (!flags.noDeploy) {
  step("Deploying your cubby...");
  const deployArgs = ["deploy"];
  if (flags.env) deployArgs.push("--env", flags.env);
  const deploy = spawnSync(wranglerBin, deployArgs, { cwd: root, stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" });
  deployOut = (deploy.stdout || "") + (deploy.stderr || "");
  process.stdout.write(deployOut);
  if (deploy.status !== 0) fail("Deploy failed - see output above.");
}

// 3. Register on the shelf ---------------------------------------------------
const base = normalizeBase(
  flags.url
  || process.env.VIBECUBBY_URL
  || (deployOut.match(/https:\/\/[^\s]+\.workers\.dev/) || [])[0]
  || (deployOut.match(/^\s{2}([a-z0-9.-]+\.[a-z]{2,}) \(custom domain\)/mi) || [])[1],
);
const pin = flags.pin || process.env.VIBECUBBY_PIN || "";

if (!base) {
  step("Could not figure out your cubby's URL - skipping shelf registration.");
  step(`Register it manually from the shelf UI (Add App -> path /${slug}), or rerun with --url and --pin.`);
} else {
  const palette = ["#ff2e88", "#2f34ff", "#b5482a", "#3e6b4f", "#d9a13b", "#43a0ff"];
  const body = {
    id: slug,
    name,
    slug,
    path: `/${slug}`,
    url: `/${slug}`,
    category: flags.category || "Personal",
    runtime: "Static",
    visibility: ["private", "pin", "public"].includes(flags.visibility) ? flags.visibility : "private",
    status: "live",
    accent: /^#[0-9a-f]{6}$/i.test(flags.accent || "") ? flags.accent : palette[slug.length % palette.length],
    notes: flags.notes || "",
  };
  const response = await fetch(`${base}/api/apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(pin ? { "x-app-pin": pin } : {}) },
    body: JSON.stringify(body),
  }).catch((error) => ({ ok: false, statusText: String(error) }));
  if (response.ok) {
    step("Registered on your shelf.");
  } else {
    step(`Shelf registration skipped (${response.status || ""} ${response.statusText || "no response"}). Pass --pin YOUR_PIN to register.`);
  }
  console.log(`\nLive: ${base}/${slug}\n`);
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "app";
}

function titleCase(value) {
  return String(value).replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase()).trim();
}

function normalizeBase(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function step(text) {
  console.log("-> " + text);
}

function fail(text) {
  console.error("!! " + text);
  process.exit(1);
}
