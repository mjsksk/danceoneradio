

## Plan: Create Wh0 Plays Sessions Episode 224 Page

### What gets built

A new guest show page at `/show/wh0-plays-sessions/224` following the exact same pattern as Episodes 222 and 223, with 15 tracks and timestamps.

### Changes

**1. Create `src/pages/Wh0PlaysSession224.tsx`**
- Clone the Episode 223 template
- 15 tracks with the provided tracklist and timestamps
- Reuse existing artwork image (will use the same `wh0-plays-bad-intentions.jpg` or the sessions logo — since you said "add existing picture", I'll use the sessions logo `/images/wh0-plays-sessions-logo.jpg`)
- Title: "Wh0 Plays Sessions 224"
- No subtitle/theme name provided, so it will just show "Mixed by Wh0"
- Labels left as empty strings (not provided)

**2. Update `src/components/AnimatedRoutes.tsx`**
- Add import for `Wh0PlaysSession224`
- Add route: `/show/wh0-plays-sessions/224`

**3. Update `src/pages/Shows.tsx`**
- Add Episode 224 entry to the guest shows array (at the top, as the newest)
- Subtitle: "15 tracks • Mark Knight, Wh0, Low Steppa & more"
- Broadcast date: April 10, 2026 (next in the weekly sequence after April 3)

**4. Fix build error** in `supabase/functions/newsletter-campaign/index.ts`
- The `npm:resend@2.0.0` import is causing a Deno build error — will switch to direct `fetch` against the Resend API (same pattern used in `submit-song-request`), removing the npm import.

### No other changes needed
- Routing, SEO, affiliate links, ads all come from the template automatically.

