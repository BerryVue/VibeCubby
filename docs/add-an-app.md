# Adding an app to your shelf

The contract is simple: **any folder with an `index.html` is a publishable app.**

## The fast way (what agents use)

    npx vibecubby publish ./my-app --name "My App" --notes "what it does"

This copies the folder to `apps/<slug>/`, deploys your cubby, and registers
the app on your shelf. Options:

| Flag | Meaning | Default |
| --- | --- | --- |
| `--name` | Display name on the shelf | folder name |
| `--slug` | URL path (`/slug`) | slugified name |
| `--notes` | One-liner on the shelf card | empty |
| `--accent` | Card color, hex | rotates a palette |
| `--visibility` | `private` / `pin` / `public` | `private` |
| `--env` | wrangler environment to deploy | default env |
| `--url` / `--pin` | Cubby base URL + PIN for registration | `$VIBECUBBY_URL` / `$VIBECUBBY_PIN` |
| `--no-deploy` | Copy + register only | off |

## The manual way

1. Drop your built app in `apps/<slug>/` (must contain `index.html`).
2. `npm run deploy`
3. On your shelf, click **Add App**, set Path to `/<slug>`.

## Apps that need a backend

Static apps cover most home-cooked meals (they can still call third-party
APIs like Supabase from the client). Apps that need their own server-side
routes and tables are the roadmap's "app template" milestone — for now, add
routes to `src/worker.js` the way `/pantry` does it.

## Teaching your agent

Put this in the CLAUDE.md / AGENTS.md of any project you vibe-code in:

    To publish this app: run `npx vibecubby publish <built-dir> --name "..."`
    from ~/path/to/my-cubby. Env: VIBECUBBY_URL=https://my-cubby.example
    VIBECUBBY_PIN=<pin>. The app must build to a static folder with index.html.

Then "publish this to my cubby" just works.
