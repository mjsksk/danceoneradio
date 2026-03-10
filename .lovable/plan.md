

# Plan: Optimize Ad Placements + Add Affiliate Links to Tracklists

## 1. Optimize Ad Placement

### Problem
All pages use the same AdSense slot ID `6777392184`. Several pages (News sub-pages, Merch, Account, Downloads, PlayerPage) have no ads at all. Some high-traffic pages like Shows and episode pages only have one ad unit.

### Changes

**Create distinct ad slot constants** in a new `src/config/adSlots.ts`:
- `SLOT_HEADER` — top-of-page placement
- `SLOT_IN_CONTENT` — mid-content placement  
- `SLOT_BETWEEN_EPISODES` — between episode cards on Shows page
- `SLOT_TRACKLIST` — after tracklist on episode pages
- `SLOT_GALLERY` — gallery pages
- `SLOT_SIDEBAR` — utility/info pages

Note: These will still use the same publisher ID but different slot IDs should be created in AdSense. For now, we'll use the existing slot but differentiate the `data-ad-format` and positioning so when new slots are created in AdSense, only one file needs updating.

**Add ads to pages that currently lack them:**
- `Shows.tsx` — Add a second ad after every 5th episode in the list
- `News.tsx`, `NewsTopStories.tsx`, `NewsFestivalsEvents.tsx`, `NewsIndustryCulture.tsx`, `NewsArtistsReleases.tsx` — Add in-content ad
- `Merch.tsx` — Add ad above product grid
- All 18 episode pages — Add a second ad after the tracklist section

**Vary ad formats** per placement:
- Hero/header areas: `format="horizontal"`
- Between episodes: `format="fluid"` with `layout="in-article"`
- After tracklists: `format="rectangle"`

## 2. Affiliate Links on Tracklists

### Approach
Add Beatport and Apple Music search links to every track in the tracklist across all 18 episode pages. These are search URLs (no affiliate account needed to start — they can be upgraded to proper affiliate links later).

### Changes

**Create `src/components/TrackAffiliateLinks.tsx`:**
- Takes `title` and `artist` props
- Renders small icon buttons linking to:
  - Beatport search: `https://www.beatport.com/search?q={artist}+{title}`
  - Apple Music search: `https://music.apple.com/us/search?term={artist}+{title}`
  - Amazon Music search: `https://music.amazon.com/search/{artist}+{title}`
- Opens in new tab with `rel="noopener noreferrer"`
- Styled as subtle icon links that appear on hover (matching existing `group-hover` pattern)

**Update all 18 episode pages** (`Episode389.tsx` through `Episode406.tsx`):
- Import `TrackAffiliateLinks`
- Replace the static `Music` icon in each track card with the affiliate links component
- The links replace the existing music icon area (right side of track card, lines ~305-307 in Episode406)

### Files to create
- `src/config/adSlots.ts` — Centralized ad slot configuration
- `src/components/TrackAffiliateLinks.tsx` — Affiliate link icons component

### Files to modify
- All 18 episode pages — Add affiliate links + second ad after tracklist
- `src/pages/Shows.tsx` — Interleave ads between episodes
- `src/pages/News.tsx` and 4 news sub-pages — Add ad placements
- `src/pages/Merch.tsx` — Add ad placement
- `src/components/GoogleAds.tsx` — No changes needed (already supports all formats)

### Visual preview of track card with affiliate links
```text
┌─────────────────────────────────────────────────┐
│ (1)  Home                        🟢 🍎 🛒      │
│      Rossi. · Night Tapes       [BP] [AM] [AZ]  │
└─────────────────────────────────────────────────┘
```
The affiliate icons appear where the Music icon currently is, visible on hover.

