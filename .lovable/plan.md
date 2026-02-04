
## What’s happening (root cause)
- Facebook (and most social scrapers) **only read the first HTML response** and **do not run your React app**.
- On Lovable hosting, requests like **`/share/episode/402`** are currently being handled like a normal SPA route (served the app shell), so the scraper only sees the **default homepage `<head>` tags** (canonical + OG tags pointing to `/`).
- Even though we created `public/share/episode/402/index.html`, Lovable’s hosting behavior is not reliably serving nested “directory index” HTML as a standalone document for crawlers at `/share/episode/402`.

Result: Facebook keeps showing homepage preview.

## Goal
Make the URL that Facebook scrapes resolve to a **real static HTML document** containing episode-specific OG/Twitter tags, **without relying on redirects rules** (Lovable doesn’t support Netlify `_redirects`).

## Key constraint / decision
On Lovable hosting, “pretty” share URLs like:
- `/share/episode/402`
generally require server rewrite support (serve `.../index.html`) which we don’t have.

So the most reliable approach is:
- use a **root-level static HTML file** per share target (these are served as true static files), e.g.
  - `https://danceoneradio.com/share-episode-402.html`

This does introduce `.html`, but it is the most dependable way to ensure the crawler sees the correct meta tags.

## Implementation approach (recommended)
### A) Generate root-level share HTML files at build time
Update `scripts/generate-prerender.ts` so that for each route it already knows about (including `/episode/402`), it also outputs a root-level share file like:

- `/episode/402` → `dist/share-episode-402.html`
- `/about` → `dist/share-about.html`
- `/` → `dist/share.html` (or `dist/share-home.html`)

Each file contains:
- `<meta property="fb:app_id" ...>`
- full OG + Twitter tags for that route
- `<meta http-equiv="refresh" ...>` redirect to the canonical URL

Why this works:
- Root-level static `.html` assets are consistently served as static files (we already have evidence with `/static-player.html`).

### B) Update SocialShare to use the working share URL for social platforms
Update `src/components/SocialShare.tsx` so it computes two URLs:
- `canonicalUrl` (the real page): `https://danceoneradio.com/episode/402`
- `socialPreviewUrl` (the crawler-friendly static HTML): `https://danceoneradio.com/share-episode-402.html`

Then:
- Facebook / X / WhatsApp / native share should use `socialPreviewUrl`
- “Copy Link” should copy **canonicalUrl** (so humans get the clean URL)

This keeps user-facing links clean while still getting correct previews.

### C) Keep your existing `/public/share/...` files optional
We can keep (or remove) `public/share/episode/402/index.html`, but it won’t be relied on for previews anymore.

## Files to change (once you approve)
1) `scripts/generate-prerender.ts`
- Add a helper to convert route paths into safe filenames:
  - `/episode/402` → `share-episode-402.html`
- Write the generated share HTML to `dist/<filename>` (root-level)
- Continue generating `dist/share/...` if you want, but root-level becomes the canonical share mechanism.

2) `src/components/SocialShare.tsx`
- Replace current `/share${pathname}` logic with:
  - a deterministic mapping to the root-level share file for social networks
  - copy-to-clipboard uses the original page URL
- Optional: add a small “(Best preview for Facebook)” note or a second menu item like “Copy Social Preview Link”.

## Verification steps (end-to-end)
After Publish → Update:
1) Open `https://danceoneradio.com/share-episode-402.html` in a browser:
   - you should briefly see “Redirecting…” then land on `/episode/402`
2) Facebook Sharing Debugger:
   - paste `https://danceoneradio.com/share-episode-402.html`
   - click “Scrape Again”
   - confirm OG title/description/image match Episode 402
3) In the app, go to Episode 402 → Share:
   - Facebook/X/WhatsApp should share the `share-episode-402.html` URL
   - “Copy Link” should copy `/episode/402`

## Backup option (if you absolutely must avoid `.html`)
If you decide `.html` is unacceptable, the only robust alternative on Lovable hosting is to share a Supabase Edge Function URL (e.g. `/functions/v1/og-meta-generator?...`) that returns an HTML document with OG tags and redirects. This would keep “no .html”, but the link domain would be `supabase.co` (not `danceoneradio.com`). I can implement this fallback if you want, but the root-level `.html` files are the cleanest on your own domain.
