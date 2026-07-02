# 🏠 VibeCubby

**A self-hosted shelf for your homemade apps.**

You vibe-coded something useful. Now it needs a home that isn't localhost.
VibeCubby gives every app you make a real URL, a cozy shelf, and a place your
family can actually use it — on YOUR Cloudflare account, published from
whatever AI agent you already use.

[DEMO GIF — the money shot: "publish this to my cubby" → live on a phone]

▶️ **[90-second demo video]([LINK])**

## Why this exists

Apps can be home-cooked meals. You shouldn't need to buy a domain, wire up
auth, configure a database, and set up a deploy pipeline every time you make
a grocery list for your household. VibeCubby is the missing last step of
vibe coding: **publish → share → actually use.**

- 🏡 **Yours, actually.** Runs on your own Cloudflare account (free tier).
  Your data lives in your D1 database. Export everything, always.
- 🤖 **Any agent.** Publish from Claude Code, Codex, Cursor — anything that
  can run a command. No lock-in to one AI vendor.
- 👵 **For your people, not just you.** Every app is a link your mom can
  open. PWA install, no accounts, optional PIN for private circles.
- 🎨 **Make it YOURS.** Full theming. Your cubby should look like you —
  glitter allowed. Good design is the flex here, not clever code.

## Quickstart (10 minutes, free)

Prereqs: a free [Cloudflare account](https://dash.cloudflare.com/sign-up), Node 18+.

    git clone https://github.com/REPLACE_WITH_REPO/vibecubby my-cubby
    cd my-cubby
    npm install
    npm run setup

Setup logs you into Cloudflare (browser approval), creates your free D1
database, asks you to pick a door PIN, and deploys. Your cubby is live at
`<your-subdomain>.workers.dev` — point your own domain at it whenever you
like (see [docs/custom-domains.md](docs/custom-domains.md)).

Make it yours: edit `vibecubby.config.json` (name, tagline, people, theme)
and run `npm run deploy`.

## Publish from your agent

Tell Claude Code (or any agent that can run commands):

> "Publish this app to my cubby."

Give your agent this one-time context (drop it in your project's CLAUDE.md or
AGENTS.md):

    To publish a static app to my cubby, run from the vibecubby repo:
      npx vibecubby publish <path-to-built-app> --name "App Name" --notes "one-liner"
    My cubby: VIBECUBBY_URL=https://REPLACE.workers.dev VIBECUBBY_PIN=<pin>

The CLI copies the app into `apps/<slug>/`, deploys, and registers it on
your shelf. Humans are also allowed to run it.

## Adding apps

Any folder with an `index.html` is publishable — that's the whole contract.
`apps/decision-spinner/` is a complete example. See
[docs/add-an-app.md](docs/add-an-app.md).

## Theming

Three built-in themes, chosen in `vibecubby.config.json`:

- **hearth** — warm paper & terracotta. Software as a home-cooked meal.
- **arcade** — dark CRT neon. For the night people.
- **zine** — paper, stickers & marker. Full MySpace-era heart.

Every color, corner, and shadow is a CSS token in `src/ui.js` — themes are
~40 lines each. PRs with new themes are extremely welcome.

## Private circles

Set a PIN during setup and the whole cubby is private to people you share
the PIN with (family, friends). Individual apps can be marked public later.
Session cookies last 30 days, so it feels like an installed app, not a login
screen.

## How is this different from GitHub Spark / Lovable / Val Town?

Honest answer: those are excellent *builders* with hosting attached — and
they host your apps on *their* platform, in *their* style, tied to *their*
tool. VibeCubby is the opposite bet: you bring any agent, you own the infra,
and the shelf is an expression of you. If you want a managed platform, use
theirs. If you want a home, build a cubby.

## Roadmap (maybes, not promises)

Community jams · remix lineage ("forked from Maria's grocery list") ·
a public directory of cubbies · an MCP server for agent-native publishing ·
more themes. Open an issue; the roadmap is a conversation.

## Contributing · License

MIT. PRs welcome — especially themes. Be kind.

Made by [Jonathan Rosenberry](https://berryvuestudios.com) — filmmaker who fell into building.
