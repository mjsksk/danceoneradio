
The user uploaded a CSV (410.csv) with 14 tracks and wants to automate Episode 410. Standard flow per EPISODE-AUTOMATION.md: run `npm run generate-episode` to fetch RSS metadata + create the page, then sync the uploaded CSV tracks into the `show_tracks` table for episode 410.

Also need to fix the lingering build error: `newsletter-subscribe/index.ts` still imports `npm:resend@2.0.0` (same issue we fixed in newsletter-campaign).

## Plan: Automate Episode 410

### 1. Generate Episode 410 page
Run `npm run generate-episode` which will:
- Fetch latest episode from the Blubrry RSS feed
- Create `src/pages/Episode410.tsx` with full SEO, audio player, complete audio URL with tracking params
- Update `src/App.tsx` routing
- Update `scripts/generate-prerender.ts`

### 2. Import the 14-track CSV into the database
Copy the uploaded `410.csv` to a temp path, parse it, and insert into `show_tracks` (episode_number=410). Tracks will auto-render via `<EpisodeTracklist />` with Amazon/Beatport affiliate links.

Track list to insert (artist – title, length in seconds):
1. Klubbheads Present Dayne W Johnson – Dreaming (303s)
2. LP Giobbi – Spirit Higher (288s)
3. MJ Cole x PinkPantheress – Still Sincere (MK Dub) (316s)
4. Anyma, LISA – Bad Angel (150s)
5. Steven Caretti – Smooth (307s)
6. Collect 200 – Pull Up (156s)
7. Riordan, Bushbaby – Strong Rhyme (320s)
8. Carlita – Patchwork (189s)
9. Gorgon City & Taet – Second Nature (285s)
10. Sh Sosa – Connections (126s)
11. Justin Jay, EVA – Do I Like You Like That (161s)
12. Tommy Phillips – Million Things (422s)
13. Route 94 – 4Get The Girl (285s)
14. The Second Voice – Let Me Be (156s)

### 3. Fix newsletter-subscribe build error
Refactor `supabase/functions/newsletter-subscribe/index.ts` to use direct `fetch` against `https://api.resend.com/emails` instead of `npm:resend@2.0.0` (same fix applied to newsletter-campaign and submit-song-request).

### 4. Validate
Run `npm run validate-episodes` to confirm Episode 410 passes integrity checks.

No manual file authoring — all per project standards.
