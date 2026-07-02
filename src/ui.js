/* VibeCubby UI layer: themes, icon, service worker, and the shelf app shell.
   Everything personal comes in through vibecubby.config.json — nothing in this
   file should name a specific owner, domain, or household. */

export const THEMES = {
  // Warm, homey, "software as a home-cooked meal."
  hearth: {
    name: "Hearth",
    themeColor: "#b5482a",
    background: "#f7f1e5",
    colorScheme: "light",
    vars: `
      --paper: #f7f1e5;
      --wash: #efe6d3;
      --card: #fffdf7;
      --ink: #2b241c;
      --muted: #8a7d6a;
      --line: #e0d5c1;
      --accent: #b5482a;
      --accent-ink: #fff6ee;
      --accent-2: #3e6b4f;
      --pop: #d9a13b;
      --danger: #8e2f27;
      --radius: 16px;
      --radius-sm: 11px;
      --border-w: 1px;
      --shadow: 0 14px 34px rgba(84, 62, 40, 0.14);
      --shadow-soft: 0 1px 0 rgba(84, 62, 40, 0.05);
      --font-display: "Iowan Old Style", Charter, Georgia, "Times New Roman", serif;
      --font-body: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    `,
    extra: `
      h1 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.01em; }
      .brand-copy strong { font-family: var(--font-display); }
      .login-wrap { background: radial-gradient(circle at 18% 12%, #f3e2c8, transparent 42%), radial-gradient(circle at 85% 90%, #e9d9c0, transparent 40%), var(--paper); }
      .app-icon, .brand-mark { border-radius: 14px; }
      .primary:hover { filter: brightness(1.06); }
    `,
  },

  // Dark, neon, a little CRT. For night people.
  arcade: {
    name: "Arcade",
    themeColor: "#a3ff3f",
    background: "#0e1016",
    colorScheme: "dark",
    vars: `
      --paper: #0e1016;
      --wash: #141824;
      --card: #161b28;
      --ink: #e8eef6;
      --muted: #8d97ab;
      --line: #262e42;
      --accent: #a3ff3f;
      --accent-ink: #0c1407;
      --accent-2: #43e0ff;
      --pop: #ff5cd6;
      --danger: #ff7a6b;
      --radius: 8px;
      --radius-sm: 6px;
      --border-w: 1px;
      --shadow: 0 0 0 1px rgba(163, 255, 63, 0.06), 0 18px 44px rgba(0, 0, 0, 0.5);
      --shadow-soft: 0 0 0 1px rgba(163, 255, 63, 0.04);
      --font-display: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      --font-body: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    `,
    extra: `
      body::after { content: ""; position: fixed; inset: 0; z-index: 90; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 3px); }
      h1, h2, .brand-copy strong { font-family: var(--font-display); text-transform: uppercase; letter-spacing: 0.05em; }
      h1 { text-shadow: 0 0 18px rgba(163, 255, 63, 0.35); }
      .nav button.active, .primary { box-shadow: 0 0 18px rgba(163, 255, 63, 0.35); }
      .pill { border: 1px solid var(--line); background: transparent; }
      .login-wrap { background: radial-gradient(circle at 50% -10%, rgba(67, 224, 255, 0.14), transparent 52%), var(--paper); }
      input:focus, select:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(163, 255, 63, 0.18); }
    `,
  },

  // Paper, stickers, marker lines. Full MySpace-era heart.
  zine: {
    name: "Zine",
    themeColor: "#ff2e88",
    background: "#fffdf4",
    colorScheme: "light",
    vars: `
      --paper: #fffdf4;
      --wash: #fff5da;
      --card: #ffffff;
      --ink: #131313;
      --muted: #5d5d5d;
      --line: #131313;
      --accent: #ff2e88;
      --accent-ink: #ffffff;
      --accent-2: #2f34ff;
      --pop: #ffd500;
      --danger: #d21f1f;
      --radius: 6px;
      --radius-sm: 4px;
      --border-w: 2.5px;
      --shadow: 5px 5px 0 var(--ink);
      --shadow-soft: 2.5px 2.5px 0 var(--ink);
      --font-display: "Avenir Next", Futura, "Helvetica Neue", Arial, sans-serif;
      --font-body: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
    `,
    extra: `
      h1 { font-weight: 900; letter-spacing: -0.02em; display: inline-block; background: linear-gradient(transparent 62%, var(--pop) 62%, var(--pop) 94%, transparent 94%); }
      h2, h3, .brand-copy strong { font-weight: 900; }
      .topbar { border-bottom-width: 2.5px; }
      .app-card:nth-child(odd) { transform: rotate(-0.6deg); }
      .app-card:nth-child(even) { transform: rotate(0.5deg); }
      .app-card:hover { transform: rotate(0deg); }
      .pill { border: 2px solid var(--ink); background: var(--card); color: var(--ink); font-weight: 700; }
      .chip.active { background: var(--pop); border-color: var(--ink); color: var(--ink); }
      .nav { box-shadow: var(--shadow-soft); }
      .primary { box-shadow: var(--shadow-soft); }
      .primary:active, .secondary:active { transform: translate(2px, 2px); box-shadow: none; }
      .login-panel { transform: rotate(-0.8deg); }
      .stat strong { font-weight: 900; }
    `,
  },
};

export function appIcon(theme) {
  const a = theme.themeColor;
  const bg = theme.background;
  const pop = theme === THEMES.arcade ? "#ff5cd6" : theme === THEMES.zine ? "#2f34ff" : "#d9a13b";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="VibeCubby">
  <rect width="256" height="256" rx="56" fill="${a}"/>
  <rect x="36" y="36" width="184" height="184" rx="22" fill="${bg}"/>
  <path d="M128 44v168M44 128h168" stroke="${a}" stroke-width="12"/>
  <path d="M82 100c-11-9-22-17-22-27a12 12 0 0 1 22-6 12 12 0 0 1 22 6c0 10-11 18-22 27z" fill="${a}"/>
  <path d="M174 58l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" fill="${pop}"/>
  <rect x="62" y="156" width="38" height="38" rx="10" transform="rotate(-8 81 175)" fill="${pop}"/>
  <circle cx="174" cy="175" r="19" fill="${a}"/>
  <circle cx="174" cy="175" r="7" fill="${bg}"/>
</svg>`;
}

export function serviceWorkerSource() {
  return `
const CACHE = "vibecubby-v1";
const SHELL = ["/", "/pantry", "/manifest.webmanifest", "/icon.svg"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match("/"))));
});
`;
}

export function renderAppHtml(config, theme) {
  const name = esc(config.cubbyName);
  const tagline = esc(config.tagline);
  const mark = esc((config.cubbyName || "C").replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "C");
  const memberChips = config.members
    .map((member, index) => `<button class="chip${index === 0 ? " active" : ""}" type="button" data-member="${escAttr(member)}">${esc(member)}</button>`)
    .join("\n            ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="${escAttr(theme.themeColor)}">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <title>${name}</title>
  <style>
    :root {
      color-scheme: ${theme.colorScheme};
${theme.vars}
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: var(--paper); color: var(--ink); font-family: var(--font-body); }
    body { overflow-x: hidden; }
    button, input, select, textarea { font: inherit; }
    button { border: 0; cursor: pointer; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
    .topbar { position: sticky; top: 0; z-index: 20; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 14px clamp(16px, 4vw, 34px); border-bottom: var(--border-w) solid var(--line); background: color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter: blur(18px); }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .brand-mark { width: 40px; height: 40px; border-radius: var(--radius-sm); display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); font-weight: 900; font-size: 19px; flex: 0 0 auto; border: var(--border-w) solid var(--line); }
    .brand-copy { min-width: 0; }
    .brand-copy strong { display: block; line-height: 1.1; font-size: 15.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .brand-copy span { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
    .nav { display: flex; gap: 6px; padding: 4px; border: var(--border-w) solid var(--line); border-radius: 999px; background: var(--card); }
    .nav button, .chip, .icon-btn, .primary, .secondary { min-height: 38px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; }
    .nav button { padding: 0 13px; color: var(--muted); background: transparent; font-weight: 600; }
    .nav button.active { background: var(--accent); color: var(--accent-ink); }
    .chip { padding: 0 12px; color: var(--ink); background: var(--card); border: var(--border-w) solid var(--line); }
    .chip.active { background: color-mix(in srgb, var(--accent-2) 16%, var(--card)); border-color: color-mix(in srgb, var(--accent-2) 45%, var(--line)); color: var(--ink); font-weight: 700; }
    .primary { padding: 0 16px; color: var(--accent-ink); background: var(--accent); font-weight: 700; border: var(--border-w) solid var(--line); }
    .secondary { padding: 0 15px; color: var(--ink); background: var(--card); border: var(--border-w) solid var(--line); }
    .danger { color: var(--danger); }
    .icon-btn { width: auto; padding: 0 13px; color: var(--ink); background: var(--card); border: var(--border-w) solid var(--line); }
    main { width: min(1180px, 100%); margin: 0 auto; padding: 22px clamp(16px, 4vw, 34px) 44px; }
    .view { display: none; }
    .view.active { display: block; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin: 8px 0 18px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 27px; line-height: 1.15; }
    h2 { font-size: 18px; line-height: 1.2; }
    h3 { font-size: 15px; line-height: 1.2; }
    .subtle { color: var(--muted); font-size: 13px; line-height: 1.35; margin-top: 5px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
    .stat { min-height: 78px; padding: 14px; border: var(--border-w) solid var(--line); border-radius: var(--radius-sm); background: var(--card); box-shadow: var(--shadow-soft); }
    .stat strong { display: block; font-size: 25px; line-height: 1; }
    .stat span { display: block; color: var(--muted); font-size: 12px; margin-top: 8px; }
    .app-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .app-card, .item-row, .panel { border: var(--border-w) solid var(--line); border-radius: var(--radius); background: var(--card); box-shadow: var(--shadow-soft); }
    .app-card { min-height: 210px; display: grid; grid-template-rows: auto 1fr auto; gap: 16px; padding: 16px; transition: transform 140ms ease, box-shadow 140ms ease; }
    .app-card:hover { box-shadow: var(--shadow); }
    .app-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: start; }
    .app-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); color: white; display: grid; place-items: center; font-weight: 900; font-size: 19px; background: var(--accent); border: var(--border-w) solid var(--line); }
    .meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .pill { display: inline-flex; min-height: 24px; align-items: center; border-radius: 999px; padding: 0 9px; font-size: 12px; background: var(--wash); color: var(--muted); }
    .app-actions, .row-actions, .modal-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
    .filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .list { display: grid; gap: 9px; }
    .item-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border-radius: var(--radius-sm); }
    .item-main { min-width: 0; }
    .item-title { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .item-title strong { min-width: 0; overflow-wrap: anywhere; }
    .item-detail { color: var(--muted); font-size: 12px; margin-top: 5px; overflow-wrap: anywhere; }
    .status-need { background: color-mix(in srgb, var(--danger) 16%, var(--card)); color: var(--danger); }
    .status-low { background: color-mix(in srgb, var(--pop) 26%, var(--card)); color: var(--ink); }
    .status-have { background: color-mix(in srgb, var(--accent-2) 18%, var(--card)); color: var(--ink); }
    .status-bought { background: var(--wash); color: var(--muted); }
    .status-skipped { background: var(--wash); color: var(--muted); }
    .empty { min-height: 190px; display: grid; place-items: center; text-align: center; border: var(--border-w) dashed var(--line); border-radius: var(--radius); background: var(--wash); color: var(--muted); padding: 20px; }
    .login-wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--paper); }
    .login-panel { width: min(420px, 100%); border: var(--border-w) solid var(--line); border-radius: var(--radius); background: var(--card); padding: 24px; box-shadow: var(--shadow); }
    .login-panel .brand { margin-bottom: 8px; }
    .login-note { color: var(--muted); font-size: 13px; line-height: 1.45; margin: 0 0 18px; }
    label { display: grid; gap: 7px; color: var(--muted); font-size: 12px; font-weight: 700; }
    input, select, textarea { width: 100%; min-height: 42px; border: var(--border-w) solid var(--line); border-radius: var(--radius-sm); background: var(--card); color: var(--ink); padding: 0 12px; outline: none; }
    textarea { min-height: 88px; padding: 11px 12px; resize: vertical; }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .form-grid .span { grid-column: 1 / -1; }
    .error { color: var(--danger); font-size: 13px; min-height: 18px; margin-top: 10px; }
    dialog { width: min(560px, calc(100vw - 28px)); border: var(--border-w) solid var(--line); border-radius: var(--radius); background: var(--card); color: var(--ink); padding: 0; box-shadow: var(--shadow); }
    dialog::backdrop { background: rgba(12, 12, 14, 0.4); backdrop-filter: blur(4px); }
    .modal { padding: 18px; display: grid; gap: 14px; }
    .modal-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; }
    .toast { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%) translateY(80px); z-index: 50; max-width: min(420px, calc(100vw - 28px)); padding: 12px 14px; border-radius: var(--radius-sm); background: var(--ink); color: var(--paper); box-shadow: var(--shadow); transition: transform 160ms ease; }
    .toast.show { transform: translateX(-50%) translateY(0); }
    .footer { padding: 18px clamp(16px, 4vw, 34px) 26px; color: var(--muted); font-size: 12px; display: flex; justify-content: center; gap: 6px; }
    .footer a { color: var(--muted); }
    .hidden { display: none !important; }
    @media (max-width: 860px) {
      .topbar { grid-template-columns: 1fr; }
      .top-actions { justify-content: stretch; }
      .nav { width: 100%; }
      .nav button { flex: 1; }
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .app-grid { grid-template-columns: 1fr; }
      .section-head { align-items: stretch; flex-direction: column; }
      .item-row { grid-template-columns: 1fr; }
      .row-actions { justify-content: stretch; }
      .row-actions button { flex: 1 1 auto; }
    }
    @media (max-width: 520px) {
      main { padding-top: 16px; }
      .brand-copy span { display: none; }
      .stats { grid-template-columns: 1fr 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .top-actions > .primary, .top-actions > .secondary { flex: 1 1 auto; }
      .toolbar { align-items: stretch; }
      .filters, .toolbar .primary { width: 100%; }
      .filters .chip { flex: 1 1 auto; }
    }
${theme.extra}
  </style>
</head>
<body data-theme="${escAttr(config.theme)}">
  <div id="login" class="login-wrap hidden">
    <form class="login-panel" id="login-form">
      <div class="brand">
        <div class="brand-mark">${mark}</div>
        <div class="brand-copy">
          <strong>${name}</strong>
          <span>${tagline}</span>
        </div>
      </div>
      <p class="login-note">This cubby is private. If you belong here, you know the PIN.</p>
      <label>
        Cubby PIN
        <input id="pin-input" name="pin" inputmode="numeric" autocomplete="current-password" autofocus>
      </label>
      <div class="error" id="login-error"></div>
      <button class="primary" type="submit">Open the door</button>
    </form>
  </div>

  <div id="app" class="shell hidden">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">${mark}</div>
        <div class="brand-copy">
          <strong>${name}</strong>
          <span id="subtitle">${tagline}</span>
        </div>
      </div>
      <div class="top-actions">
        <div class="nav" role="tablist" aria-label="Views">
          <button id="nav-shelf" type="button" class="active" data-view="shelf">Shelf</button>
          <button id="nav-pantry" type="button" data-view="pantry">Pantry</button>
        </div>
        <button id="add-app" class="secondary" type="button">Add App</button>
        <button id="add-item" class="primary" type="button">Add Item</button>
        <button id="logout" class="icon-btn" type="button" aria-label="Lock">Lock</button>
      </div>
    </header>

    <main>
      <section id="view-shelf" class="view active">
        <div class="section-head">
          <div>
            <h1>The Shelf</h1>
            <p class="subtle">Apps made at home, hosted on my own little cloud.</p>
          </div>
        </div>
        <div class="stats" id="stats"></div>
        <div class="app-grid" id="app-grid"></div>
      </section>

      <section id="view-pantry" class="view">
        <div class="section-head">
          <div>
            <h1>Family Pantry</h1>
            <p class="subtle">Synced grocery and household checklist.</p>
          </div>
          <div class="filters" id="member-filters">
            ${memberChips}
          </div>
        </div>
        <div class="toolbar">
          <div class="filters" id="status-filters">
            <button class="chip active" type="button" data-status="active">Active</button>
            <button class="chip" type="button" data-status="need">Need</button>
            <button class="chip" type="button" data-status="low">Low</button>
            <button class="chip" type="button" data-status="have">Have</button>
            <button class="chip" type="button" data-status="all">All</button>
          </div>
          <div class="filters" id="type-filters">
            <button class="chip active" type="button" data-type="all">All</button>
            <button class="chip" type="button" data-type="essential">Essentials</button>
            <button class="chip" type="button" data-type="occasional">Occasional</button>
            <button class="chip" type="button" data-type="pantry">Pantry</button>
          </div>
        </div>
        <div class="list" id="item-list"></div>
      </section>
    </main>

    <footer class="footer">made with <span aria-hidden="true">&#9825;</span> on VibeCubby</footer>
  </div>

  <dialog id="app-dialog">
    <form class="modal" id="app-form" method="dialog">
      <div class="modal-head">
        <div>
          <h2 id="app-dialog-title">Add App</h2>
          <p class="subtle">A new thing for the shelf.</p>
        </div>
        <button class="icon-btn" type="button" data-close="app-dialog" aria-label="Close">X</button>
      </div>
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Path<input name="path" maxlength="120" placeholder="/boat-log"></label>
        <label>Category<input name="category" maxlength="40" value="Personal"></label>
        <label>Status<select name="status"><option value="live">Live</option><option value="draft">Draft</option><option value="needs-work">Needs Work</option></select></label>
        <label>Visibility<select name="visibility"><option value="private">Private</option><option value="pin">PIN</option><option value="public">Public</option></select></label>
        <label>Accent<input name="accent" maxlength="7" value="#315f4f"></label>
        <label class="span">URL<input name="url" maxlength="240" placeholder="/boat-log"></label>
        <label class="span">Notes<textarea name="notes" maxlength="220"></textarea></label>
      </div>
      <div class="modal-actions">
        <button class="primary" type="submit">Save</button>
        <button class="secondary" type="button" data-close="app-dialog">Cancel</button>
      </div>
    </form>
  </dialog>

  <dialog id="item-dialog">
    <form class="modal" id="item-form" method="dialog">
      <div class="modal-head">
        <div>
          <h2 id="item-dialog-title">Add Item</h2>
          <p class="subtle">Shared grocery item.</p>
        </div>
        <button class="icon-btn" type="button" data-close="item-dialog" aria-label="Close">X</button>
      </div>
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Quantity<input name="quantity" maxlength="60"></label>
        <label>Category<select name="category"></select></label>
        <label>List<select name="listType"><option value="essential">Essential</option><option value="occasional">Occasional</option><option value="pantry">Pantry</option></select></label>
        <label>Status<select name="status"><option value="need">Need</option><option value="low">Low</option><option value="have">Have</option><option value="bought">Bought</option><option value="skipped">Skipped</option></select></label>
        <label>Aisle<input name="aisle" maxlength="60"></label>
        <label class="span">Notes<textarea name="notes" maxlength="220"></textarea></label>
      </div>
      <div class="modal-actions">
        <button class="primary" type="submit">Save</button>
        <button class="secondary" type="button" data-close="item-dialog">Cancel</button>
      </div>
    </form>
  </dialog>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>
    var CUBBY_NAME = ${JSON.stringify(config.cubbyName)};
    var MEMBERS = ${JSON.stringify(config.members)};

    var state = {
      apps: [],
      items: [],
      categories: [],
      view: location.pathname === "/pantry" ? "pantry" : "shelf",
      status: "active",
      type: "all",
      member: MEMBERS[0],
      pin: ""
    };

    var $ = function(selector) { return document.querySelector(selector); };
    var $$ = function(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };

    init();

    async function init() {
      bindEvents();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(function() {});
      }
      await boot();
    }

    function bindEvents() {
      $("#login-form").addEventListener("submit", onLogin);
      $("#logout").addEventListener("click", logout);
      $("#add-app").addEventListener("click", function() { openAppDialog(); });
      $("#add-item").addEventListener("click", function() { openItemDialog(); });
      $("#app-form").addEventListener("submit", saveApp);
      $("#item-form").addEventListener("submit", saveItem);
      $$("[data-view]").forEach(function(button) {
        button.addEventListener("click", function() { setView(button.dataset.view); });
      });
      $$("[data-close]").forEach(function(button) {
        button.addEventListener("click", function() { $("#" + button.dataset.close).close(); });
      });
      $("#status-filters").addEventListener("click", function(event) {
        if (!event.target.dataset.status) return;
        state.status = event.target.dataset.status;
        setActive("#status-filters", "status", state.status);
        renderItems();
      });
      $("#type-filters").addEventListener("click", function(event) {
        if (!event.target.dataset.type) return;
        state.type = event.target.dataset.type;
        setActive("#type-filters", "type", state.type);
        renderItems();
      });
      $("#member-filters").addEventListener("click", function(event) {
        if (!event.target.dataset.member) return;
        state.member = event.target.dataset.member;
        setActive("#member-filters", "member", state.member);
      });
    }

    async function boot() {
      var session = await api("/api/session", { public: true });
      state.categories = session.categories || [];
      fillCategoryOptions();
      if (session.privateMode && !session.authenticated) {
        $("#login").classList.remove("hidden");
        $("#app").classList.add("hidden");
        return;
      }
      $("#login").classList.add("hidden");
      $("#app").classList.remove("hidden");
      await loadData();
      setView(state.view);
    }

    async function onLogin(event) {
      event.preventDefault();
      var pin = $("#pin-input").value.trim();
      $("#login-error").textContent = "";
      try {
        await api("/api/login", { method: "POST", body: { pin: pin }, public: true });
        state.pin = pin;
        await boot();
      } catch (error) {
        $("#login-error").textContent = error.message || "Could not unlock.";
      }
    }

    async function logout() {
      await api("/api/logout", { method: "POST", body: {}, public: true }).catch(function() {});
      state.pin = "";
      state.apps = [];
      state.items = [];
      $("#pin-input").value = "";
      await boot();
    }

    async function loadData() {
      var apps = await api("/api/apps");
      var items = await api("/api/pantry/items");
      state.apps = apps.apps || [];
      state.items = items.items || [];
      renderApps();
      renderItems();
    }

    function setView(view) {
      state.view = view;
      $$(".view").forEach(function(node) { node.classList.toggle("active", node.id === "view-" + view); });
      $$("[data-view]").forEach(function(node) { node.classList.toggle("active", node.dataset.view === view); });
      history.replaceState(null, "", view === "pantry" ? "/pantry" : "/");
    }

    function renderApps() {
      var live = state.apps.filter(function(app) { return app.status === "live"; }).length;
      var privateCount = state.apps.filter(function(app) { return app.visibility !== "public"; }).length;
      $("#stats").innerHTML = [
        stat(state.apps.length, "Apps on the shelf"),
        stat(live, "Live"),
        stat(privateCount, "Private or PIN"),
        stat(state.items.filter(function(item) { return item.status === "need" || item.status === "low"; }).length, "Pantry alerts")
      ].join("");

      if (!state.apps.length) {
        $("#app-grid").innerHTML = '<div class="empty">Nothing on the shelf yet. Vibe-code something and publish it here.</div>';
        return;
      }

      $("#app-grid").innerHTML = state.apps.map(function(app) {
        var url = app.url || app.path || "/";
        return '<article class="app-card">' +
          '<div class="app-top">' +
            '<div class="app-icon" style="background:' + escAttr(app.accent) + '">' + esc(iconLetter(app)) + '</div>' +
            '<div><h2>' + esc(app.name) + '</h2><p class="subtle">' + esc(app.notes || app.category) + '</p></div>' +
            '<span class="pill">' + esc(app.status) + '</span>' +
          '</div>' +
          '<div class="meta-row">' +
            '<span class="pill">' + esc(app.category) + '</span>' +
            '<span class="pill">' + esc(app.runtime) + '</span>' +
            '<span class="pill">' + esc(app.visibility) + '</span>' +
          '</div>' +
          '<div class="app-actions">' +
            '<button class="primary" type="button" data-open="' + escAttr(url) + '">Open</button>' +
            '<button class="secondary" type="button" data-copy="' + escAttr(url) + '">Copy Link</button>' +
            '<button class="secondary" type="button" data-edit-app="' + escAttr(app.id) + '">Edit</button>' +
          '</div>' +
        '</article>';
      }).join("");

      $$("[data-open]").forEach(function(button) {
        button.addEventListener("click", function() { location.href = button.dataset.open; });
      });
      $$("[data-copy]").forEach(function(button) {
        button.addEventListener("click", function() { copyUrl(button.dataset.copy); });
      });
      $$("[data-edit-app]").forEach(function(button) {
        button.addEventListener("click", function() {
          openAppDialog(state.apps.find(function(app) { return app.id === button.dataset.editApp; }));
        });
      });
    }

    function renderItems() {
      var items = state.items.slice();
      if (state.status === "active") {
        items = items.filter(function(item) { return item.status === "need" || item.status === "low"; });
      } else if (state.status !== "all") {
        items = items.filter(function(item) { return item.status === state.status; });
      }
      if (state.type !== "all") {
        items = items.filter(function(item) { return item.listType === state.type; });
      }

      if (!items.length) {
        $("#item-list").innerHTML = '<div class="empty">No matching items.</div>';
        return;
      }

      $("#item-list").innerHTML = items.map(function(item) {
        var details = [item.quantity, item.category, item.aisle, item.modifiedBy].filter(Boolean).join(" / ");
        return '<article class="item-row">' +
          '<div class="item-main">' +
            '<div class="item-title"><strong>' + esc(item.name) + '</strong><span class="pill status-' + escAttr(item.status) + '">' + esc(item.status) + '</span><span class="pill">' + esc(item.listType) + '</span></div>' +
            '<div class="item-detail">' + esc(details) + (item.notes ? " / " + esc(item.notes) : "") + '</div>' +
          '</div>' +
          '<div class="row-actions">' +
            statusButton(item, "need") +
            statusButton(item, "low") +
            statusButton(item, "have") +
            '<button class="secondary" type="button" data-edit-item="' + escAttr(item.id) + '">Edit</button>' +
          '</div>' +
        '</article>';
      }).join("");

      $$("[data-status-for]").forEach(function(button) {
        button.addEventListener("click", function() {
          updateItem(button.dataset.statusFor, { status: button.dataset.toStatus, modifiedBy: state.member });
        });
      });
      $$("[data-edit-item]").forEach(function(button) {
        button.addEventListener("click", function() {
          openItemDialog(state.items.find(function(item) { return item.id === button.dataset.editItem; }));
        });
      });
    }

    function statusButton(item, status) {
      var active = item.status === status ? " active" : "";
      return '<button class="chip' + active + '" type="button" data-status-for="' + escAttr(item.id) + '" data-to-status="' + escAttr(status) + '">' + esc(status) + '</button>';
    }

    function openAppDialog(app) {
      var form = $("#app-form");
      form.reset();
      $("#app-dialog-title").textContent = app ? "Edit App" : "Add App";
      form.id.value = app ? app.id : "";
      form.name.value = app ? app.name : "";
      form.path.value = app ? app.path : "";
      form.url.value = app ? app.url : "";
      form.category.value = app ? app.category : "Personal";
      form.status.value = app ? app.status : "live";
      form.visibility.value = app ? app.visibility : "private";
      form.accent.value = app ? app.accent : "#315f4f";
      form.notes.value = app ? app.notes : "";
      $("#app-dialog").showModal();
    }

    function openItemDialog(item) {
      var form = $("#item-form");
      form.reset();
      $("#item-dialog-title").textContent = item ? "Edit Item" : "Add Item";
      form.id.value = item ? item.id : "";
      form.name.value = item ? item.name : "";
      form.quantity.value = item ? item.quantity : "";
      form.category.value = item ? item.category : "Other";
      form.listType.value = item ? item.listType : "occasional";
      form.status.value = item ? item.status : "need";
      form.aisle.value = item ? item.aisle : "";
      form.notes.value = item ? item.notes : "";
      $("#item-dialog").showModal();
    }

    async function saveApp(event) {
      event.preventDefault();
      var body = formBody(event.target);
      var method = body.id ? "PATCH" : "POST";
      var path = body.id ? "/api/apps/" + encodeURIComponent(body.id) : "/api/apps";
      await api(path, { method: method, body: body });
      $("#app-dialog").close();
      await loadData();
      toast("App saved.");
    }

    async function saveItem(event) {
      event.preventDefault();
      var body = formBody(event.target);
      body.modifiedBy = state.member;
      var method = body.id ? "PATCH" : "POST";
      var path = body.id ? "/api/pantry/items/" + encodeURIComponent(body.id) : "/api/pantry/items";
      await api(path, { method: method, body: body });
      $("#item-dialog").close();
      await loadData();
      toast("Item saved.");
    }

    async function updateItem(id, patch) {
      var response = await api("/api/pantry/items/" + encodeURIComponent(id), { method: "PATCH", body: patch });
      state.items = state.items.map(function(item) { return item.id === id ? response.item : item; });
      renderApps();
      renderItems();
    }

    async function api(path, options) {
      options = options || {};
      var headers = { "Content-Type": "application/json" };
      if (state.pin) headers["x-app-pin"] = state.pin;
      var response = await fetch(path, {
        method: options.method || "GET",
        headers: headers,
        credentials: "same-origin",
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      var text = await response.text();
      var data = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data;
    }

    function fillCategoryOptions() {
      var select = $("#item-form select[name='category']");
      select.innerHTML = state.categories.map(function(category) {
        return '<option value="' + escAttr(category) + '">' + esc(category) + '</option>';
      }).join("");
    }

    function formBody(form) {
      var data = new FormData(form);
      var body = {};
      data.forEach(function(value, key) { body[key] = String(value).trim(); });
      return body;
    }

    function setActive(root, key, value) {
      $$(root + " [data-" + key + "]").forEach(function(node) {
        node.classList.toggle("active", node.dataset[key] === value);
      });
    }

    function stat(value, label) {
      return '<div class="stat"><strong>' + esc(String(value)) + '</strong><span>' + esc(label) + '</span></div>';
    }

    async function copyUrl(url) {
      var absolute = url.indexOf("http") === 0 ? url : location.origin + url;
      if (navigator.share) {
        try {
          await navigator.share({ title: CUBBY_NAME, url: absolute });
          return;
        } catch (error) {}
      }
      await navigator.clipboard.writeText(absolute);
      toast("Link copied.");
    }

    function iconLetter(app) {
      return (app.name || "A").slice(0, 1).toUpperCase();
    }

    function toast(message) {
      var node = $("#toast");
      node.textContent = message;
      node.classList.add("show");
      setTimeout(function() { node.classList.remove("show"); }, 1800);
    }

    function esc(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function escAttr(value) {
      return esc(value).split(String.fromCharCode(96)).join("&#96;");
    }
  </script>
</body>
</html>`;
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(value) {
  return esc(value).replace(/`/g, "&#96;");
}
