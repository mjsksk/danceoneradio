# Create Future Dance Anthems Pages Ahead of the RSS Feed

## Answer to your question

Yes — we can create the page before the episode appears in the RSS feed, and you will **not** end up with two pages for the same show. Here is why:

- Each show gets exactly **one permanent web address**: `/episode/426` (and so on).
- The Shows page feed is built entirely from the RSS feed. When the new episode is published to RSS, the feed shows **one card** for it, keyed by its episode number — and that card links to the dedicated page we created.
- So the page exists early (great for sharing, SEO indexing, and scheduling), and the moment the RSS feed catches up, everything links together automatically. No second page is ever created.

## What I'll build (per new FDA episode)

1. Create `src/pages/Episode426.tsx` (and future numbers) from the existing template with:
   - Correct broadcast date, tracklist (from the list you paste), SEO metadata, cover art, share buttons, navigation
   - Play button left in a safe state until the RSS enclosure URL exists; once the feed publishes the episode, I'll fill in the real audio URL
2. Register the route in `AnimatedRoutes.tsx` and add the number to `availableEpisodePages` in `Shows.tsx`
3. Add the sitemap entry so search engines can find and index the page early
4. Insert the tracks into the database so the tracklist renders

## Optional extra

- If you want the upcoming episode to be **visible on the Shows page before the RSS feed updates**, I can add a manual "upcoming" card (like the Wh0 sessions use). It would appear with an "Upcoming" badge and disappear automatically once RSS takes over — still one page, one link. Say the word if you want this.

## Workflow going forward

Just tell me: "new Future Dance Anthems episode, tracklist: ..." and I'll do the rest — page, date, routing, sitemap, and track data. When the RSS feed later publishes the episode, I'll update the audio link so the play button works.
