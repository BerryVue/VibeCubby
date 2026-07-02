# Contributing to VibeCubby

Hi! This project is young and small on purpose. The bar for a good PR:

- **Themes are the most-wanted contribution.** A theme is ~40 lines in
  `src/ui.js` (tokens + a few personality overrides). Make something only
  you would make.
- **Keep the worker dependency-free.** The whole cubby is one Worker, one
  D1 database, and static files. If a feature needs a framework, it
  probably belongs in an app on the shelf, not in the shelf.
- **Phone-first.** Every change should look right at 390px wide.
- **Run the checks** before opening a PR:

      npm test                 # smoke test against a fake D1
      node --check src/worker.js src/ui.js

- **Be kind.** The guestbook rules of the old internet apply.

## Local development

    npm run dev     # local preview on http://127.0.0.1:8787, PIN 734921

## What we're not building (for now)

Multi-tenancy, hosted accounts, billing, moderation. Each cubby is
self-hosted by its owner — that constraint is the product.
