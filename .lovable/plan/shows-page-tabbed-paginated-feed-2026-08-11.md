# Shows Page: Tabbed + Paginated Feed

Restructure `/shows` from a two-column dump (10 Mario episodes on the left, all 15 Wh0 Plays Sessions on the right) into a single, focused feed with brand tabs and pagination.

## What the page will look like

- One heading, then a tab bar: **All** · **Future Dance Anthems** · **Wh0 Plays Sessions**
- Below it, a single full-width grid of episode cards (2 columns on desktop, 1 on mobile)
- **10 episodes per page** with numbered pagination (Previous · 1 2 3 … · Next) at the bottom
- "All" merges both shows sorted newest first, so the newest content is always the first thing visible
- Each card keeps its existing look: artwork, episode number badge, title, date, duration, share button, and link to the dedicated episode page

## Behaviour details

- The active tab and page are stored in the URL (`/shows?show=wh0&page=2`) so links are shareable and the browser back button works
- Switching tabs resets to page 1 and scrolls back to the top of the list
- Mario episodes are pulled from the RSS feed as today, but the page will keep the full list instead of trimming to the latest 10 (pagination handles the volume)
- Wh0 Plays Sessions stay a hard-coded list for now; adding a new one is still a single entry
- In-feed ads keep appearing after every 5th card within a page
- Upcoming (not yet aired) episodes keep their existing status badge and sort to the top of their show

## Technical notes

- All work stays in `src/pages/Shows.tsx`; extract the episode card and the Wh0 session list into small local components/data files so the page file stops growing
- Move the inline `guestShows` array into `src/data/wh0Sessions.ts` and the shared card markup into `src/components/shows/ShowEpisodeCard.tsx`
- Use the existing shadcn `Tabs` and `Pagination` components; tab/page state read from `useSearchParams`
- SEO: `/shows` keeps its canonical URL; paginated views (`?page=2+`) get `noindex, follow` via the existing `SEO` component so the sitemap and index stay clean, while individual episode pages remain the indexable targets
- No database or routing changes; existing `/episode/:n` and `/show/wh0-plays-sessions/:n` routes are untouched
