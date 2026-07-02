# Pointing your own domain at your cubby

Your cubby starts on a free `*.workers.dev` URL. A custom domain makes it
feel like a real place — `cubby.yourname.com` or `yourname.club`, whatever
feels like home.

## Steps

1. **Get your domain onto Cloudflare.** Either register it there
   (Domain Registration → at-cost pricing, zero config), or add your
   existing domain as a zone (Add a domain → Free plan) and switch
   nameservers at your registrar.
2. **Add routes to `wrangler.toml`:**

       [[routes]]
       pattern = "cubby.yourname.com"
       custom_domain = true

   (For a personal environment, see the `env.jonathan` example in the
   repo's `wrangler.toml`.)
3. **Deploy:** `npm run deploy`. Cloudflare creates the DNS record and the
   SSL certificate automatically. First-time certificates can take a few
   minutes to an hour.

## Free-plan notes

- Single-level subdomains (`cubby.yourname.com`) are covered by the free
  universal certificate. Two-level ones (`a.b.yourname.com`) are not —
  avoid them.
- You can claim several names for the same cubby (e.g. a short alias) and
  redirect them with the `redirects` map in `vibecubby.config.json`.
