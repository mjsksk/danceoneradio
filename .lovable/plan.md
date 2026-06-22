## Problem

Returning visitors keep seeing the old site after a deploy and have to hard-refresh. Root cause is in our service worker (`public/sw.js`) and how we register it in `src/main.tsx`.

Three issues compound:

1. **Install-time precache references hashed filenames** (e.g. `/assets/dance-one-logo-DP6h_tTr.png`). Every new build produces new hashes, so on the very first visit after a deploy `cache.addAll(STATIC_ASSETS)` 404s and the whole install rejects. The new SW never activates, so the auto-reload-on-`controllerchange` path never fires for that user — they stay on the old SW serving old chunks.
2. **No update check after the initial page load.** We call `registration.update()` once on `window load`. A user who keeps the tab open (or just revisits via bfcache) never asks the server whether a new SW exists, so they keep getting the cached version.
3. **`SKIP_WAITING` is only posted from the brand-new-install branch.** If a waiting worker was already sitting there from a previous session, it never gets told to activate, so the page keeps booting under the old controller.

## Fix

### `public/sw.js`
- Bump `CACHE_NAME` to `dance-one-radio-v9`.
- Remove all hashed `/assets/*` filenames from `STATIC_ASSETS`. Keep only stable paths (`/lovable-uploads/...`, favicon). Hashed build assets are already cached on-demand by the runtime `fetch` handler — precaching them by name is what breaks every deploy.
- Wrap `cache.addAll` in `Promise.allSettled` per-URL so a single 404 can never reject install again.
- On `activate`, after cleaning old caches, call `self.clients.claim()` (already done) AND notify all clients with `postMessage({ type: 'SW_ACTIVATED' })` so the page can reload deterministically.

### `src/main.tsx` (registration block)
- On registration, if `registration.waiting` exists, immediately `postMessage({ type: 'SKIP_WAITING' })` (already done) — keep.
- Also post `SKIP_WAITING` whenever an `updatefound` worker reaches the `installed` state, regardless of whether `navigator.serviceWorker.controller` is set (covers the "waiting from previous session" case).
- Add a periodic update probe:
  - `setInterval(() => registration.update(), 60 * 60 * 1000)` (hourly).
  - Call `registration.update()` on `visibilitychange` when the tab becomes visible, throttled to once every 5 min.
- Keep the existing `controllerchange → location.reload()` guard (this is what makes the update visible without a hard refresh).

### No other files change
No changes to `netlify.toml`, build config, or React code. The CSP, cache headers, and SPA routing already behave correctly; the regression is entirely in the SW lifecycle.

## Result
After this ships once, the next deploy will:
1. Install the new SW successfully (no hashed-filename 404s).
2. Get picked up within an hour, or as soon as the user switches back to the tab.
3. Auto-reload the page exactly once when the new SW takes control — no hard refresh needed.

Existing users still on `v8` will pick this up on their next normal page load, and from then on updates land automatically.