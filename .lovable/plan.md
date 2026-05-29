# Track Preview Play Tracking

Record every time a visitor clicks the play button on a track in the "Last Played Tracks" section (preview play), regardless of login state, and show it in the admin area.

## What gets recorded

For each preview play:
- Track title + artist (and `radio_track_history.id` when available)
- Timestamp
- Anonymous visitor hash (same hash used by `site_visits`, so we can count unique listeners without identifying anyone)
- Country / country code (from Cloudflare/Edge headers, like `track-visit`)
- `user_id` if the visitor happens to be logged in (nullable)
- Page path the play happened on (`/`, `/tracks`, `/desktop`, etc.)
- User agent (truncated)

## Database

New table `public.track_preview_plays` with the columns above. RLS:
- No public SELECT
- Admin SELECT via `has_role(auth.uid(), 'admin')`
- No direct INSERT from clients — writes only via edge function using the service role

Two admin RPCs (security definer, admin-gated, like the existing analytics RPCs):
- `get_track_play_summary(start_date, end_date)` → total plays, unique listeners, top country
- `get_track_play_analytics(start_date, end_date)` → per-track aggregation: title, artist, total plays, unique listeners, last played

A daily cleanup function `cleanup_old_track_plays()` to drop rows older than 90 days (matches `site_visits` retention).

## Edge function

New `supabase/functions/track-preview-play` (`verify_jwt = false`):
- Accepts POST `{ trackId?, title, artist, pagePath }`
- Validates input with Zod
- Extracts country from `cf-ipcountry` / `x-country` headers (same approach as `track-visit`)
- Computes visitor hash from IP + UA (same approach as `track-visit`)
- Reads optional `Authorization` header to capture `user_id` when present
- Rate-limited per visitor hash (max ~30 plays/min) using `api_request_log`
- Inserts row via service-role client

## Frontend

`src/components/TracksSection.tsx`:
- On successful `audioRef.play()`, fire-and-forget call to the edge function with the track info and `window.location.pathname`. No await — must not block the audio.
- Debounce per `trackId` for 5s so a single click doesn't double-record on replay events.

No other UI changes for visitors.

## Admin UI

New component `src/components/admin/TrackPlayAnalytics.tsx`, mounted on the existing admin page next to `ListenerAnalytics`:
- Same date-range filter pattern (All / 7d / 30d / 90d / custom)
- Summary cards: Total Plays, Unique Listeners, Top Country
- Table: Track, Artist, Plays, Unique Listeners, Last Played
- Uses the two new RPCs

## Optional notification

You said "I want to receive a notification". The cleanest fit with what's already in the project is a **push notification to admins** via the existing `send-push-notification` flow. I'll add this only if you confirm — otherwise the admin dashboard is the source of truth. Two options:

1. **Dashboard only** (default in this plan) — see plays in admin, no push spam.
2. **Push to admin on every play** — calls `send-push-notification` from the edge function, targeted to admin push subscriptions only. Can be noisy if traffic is high.
3. **Hourly digest push** — a cron'd edge function summarizes plays in the last hour and pushes once.

Tell me which notification mode you want and I'll fold it in before building.

## Files

New:
- `supabase/functions/track-preview-play/index.ts`
- `src/components/admin/TrackPlayAnalytics.tsx`
- Migration: `track_preview_plays` table + grants + RLS + RPCs + cleanup function

Edited:
- `src/components/TracksSection.tsx` — fire tracking call on play
- `supabase/config.toml` — register new function with `verify_jwt = false`
- `src/pages/Admin.tsx` — mount the new analytics component
