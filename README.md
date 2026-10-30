# NightRounds website

Static Astro site for NightRounds Technology Group LLC. Built per the Agency Packet v1.2.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Editing content (Owner self-serve)

| What | Where |
| --- | --- |
| Prices, phone, email, booking link, coverage window, service names | `src/data/site.ts` |
| Blog posts | `src/content/blog/*.md` (set `draft: false` to publish) |
| Owner photo | `public/images/`, then set `owner.photo` in `src/data/site.ts` |
| Checklist PDF | `public/downloads/care-facility-it-hipaa-readiness-checklist.pdf` |

Any value left as `null` in `site.ts` shows a neutral "published soon" label, never an invented number.

### The 2 AM claim

`coverage.confirmed` in `src/data/site.ts` is `false`, so the site shows the fallback line
"IT support built for your overnight shift." Flip it to `true` only after the coverage plan, backup
responder, customer time zones, and a 2 AM test call are confirmed (packet sections 14 and 17).

## Structure

- `src/pages/` — one file per page. Service detail pages use `src/layouts/ServicePage.astro`; copy one to add a Phase 2 service.
- `src/components/` — header, footer, forms, cards.
- `src/styles/global.css` — design tokens. Palette A (Night Teal) is the default; B (Harbor Navy) is previewable at `/brand`.
- `functions/api/inquiry.js` — Cloudflare Pages Function for all forms: Turnstile, validation, rate limit, dedupe, delivery to Microsoft 365 via Graph.
- `public/_headers` — security headers and CSP.

## Design preview (GitHub Pages)

Review link: https://oskarlazcano.github.io/nightrounds/ (noindexed; forms show a "not connected" notice).
It serves the `gh-pages` branch and does not update on its own. To refresh it after changes, from Git Bash:

```bash
PUBLIC_PREVIEW=true npx astro build
MSYS_NO_PATHCONV=1 node scripts/rebase.mjs /nightrounds
touch dist/.nojekyll
cd dist && git init -b gh-pages && git add -A && git commit -m "Preview build" && git push -f https://github.com/oskarlazcano/nightrounds.git gh-pages; rm -rf .git
```

## Before launch (Owner)

- Domain: replace `nightrounds.example` in `astro.config.mjs` and `src/data/site.ts`.
- Cloudflare secrets for the form function (listed at the top of `functions/api/inquiry.js`) and the Turnstile site key in `site.ts`.
- Microsoft Bookings URL, contact email and phone, prices, coverage window.
- Owner photo, checklist PDF, legal page text, and `public/og.png` (1200×630 social image).
- Licensed stock photography, if used.
