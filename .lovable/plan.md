

# Visitor Analytics for Admin Dashboard

## Overview
Add a visitor tracking system that logs every page visit with the visitor's country (detected server-side via IP geolocation) and a fingerprint-based returning visitor flag. The data is displayed as a new section on the admin dashboard.

## How It Works

1. **Visitor hits any page** -- the frontend sends a lightweight request to a new edge function
2. **Edge function** detects the visitor's country from their IP address using a free geolocation API, generates a visitor fingerprint hash, and stores the visit in a new `site_visits` table
3. **Admin dashboard** shows a summary card and a country breakdown table, with new/returning visitor counts

## Technical Details

### 1. Database -- new `site_visits` table

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| visitor_hash | text | SHA-256 of IP + User-Agent (privacy-safe, no raw IP stored) |
| country | text | Country name from geolocation |
| country_code | text | ISO country code (e.g., "US") |
| page_path | text | Which page was visited |
| is_returning | boolean | True if visitor_hash already exists |
| visited_at | timestamptz | Defaults to now() |

RLS: No public SELECT (admin-only via a database function, similar to listener analytics).

### 2. Database functions (admin-only)

- `get_visitor_analytics(start_date, end_date)` -- returns country, total visits, unique visitors, returning visitors, grouped by country
- `get_visitor_summary(start_date, end_date)` -- returns total visits, unique visitors, returning visitors, top country

### 3. Edge Function: `track-visit`

- Receives `{ page_path }` from the frontend
- Extracts IP from request headers (`x-forwarded-for` / `x-real-ip`)
- Calls a free IP geolocation API (e.g., `ip-api.com`) to get country
- Computes a SHA-256 hash of IP + User-Agent for visitor fingerprinting
- Checks if this hash already exists in the table to set `is_returning`
- Inserts the record using the service role client
- No JWT required (public endpoint, fires on every page load)

### 4. Frontend: `useVisitorTracking` hook

- Called once on app mount (in `App.tsx` or a layout component)
- Sends `POST` to the `track-visit` edge function with the current page path
- Fires only once per session (uses `sessionStorage` flag to avoid duplicates)

### 5. Frontend: `VisitorAnalytics` admin component

- New component at `src/components/admin/VisitorAnalytics.tsx`
- Summary cards: Total Visits, Unique Visitors, Returning Visitors, Top Country
- Country breakdown table with columns: Country, Visits, Unique Visitors, Returning, percentage bar
- Same date range filter pattern as the existing `ListenerAnalytics` component (preset + custom range)
- Added to the Admin page alongside the existing analytics sections

### 6. Config

- Add `track-visit` to `supabase/config.toml` with `verify_jwt = false`

### Files to create/modify

| Action | File |
|---|---|
| Create | `supabase/functions/track-visit/index.ts` |
| Create | `src/components/admin/VisitorAnalytics.tsx` |
| Create | `src/hooks/useVisitorTracking.tsx` |
| Modify | `src/App.tsx` -- add the tracking hook |
| Modify | `src/pages/Admin.tsx` -- add VisitorAnalytics component |
| Modify | `supabase/config.toml` -- add track-visit config |
| Migration | New table `site_visits` + RLS + two database functions |

