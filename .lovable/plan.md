
# EDM News Feed Implementation Plan

## Overview
Build a comprehensive EDM news aggregation system that fetches, stores, and displays daily-updated dance music news from multiple sources. The system will include a main news page with category subpages, database storage for articles, and an automated daily fetch via Supabase cron jobs.

---

## Architecture

```text
+-------------------+     +----------------------+     +------------------+
|   News Sources    |     |  Edge Function       |     |    Database      |
|   (RSS Feeds)     | --> |  edm-news-fetcher    | --> |  edm_news_articles|
|   - EDM.com       |     |  (Daily Cron)        |     |                  |
|   - Mixmag        |     +----------------------+     +------------------+
|   - DJ Mag        |               |                          |
+-------------------+               v                          v
                           +----------------------+     +------------------+
                           |  Manual Trigger      |     |  Frontend Pages  |
                           |  (Admin Panel)       |     |  /news/*         |
                           +----------------------+     +------------------+
```

---

## Database Schema

### New Table: `edm_news_articles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Article headline |
| `slug` | text | URL-friendly identifier |
| `summary` | text | Short rich summary (200-300 chars) |
| `content` | text | Full article content (optional) |
| `category` | enum | headline, release, event, artist, industry |
| `source_url` | text | Original article URL |
| `source_name` | text | Source publication name |
| `image_url` | text | Featured image URL (optional) |
| `published_at` | timestamptz | Original publish date |
| `fetched_at` | timestamptz | When we fetched it |
| `is_featured` | boolean | Featured on homepage |
| `tags` | text[] | Additional tags for filtering |
| `created_at` | timestamptz | Record creation time |

### Enum: `news_category`
- `headline` - Major industry news
- `release` - New music releases
- `event` - Festival/event announcements
- `artist` - Artist spotlights and news
- `industry` - Scene and culture updates

---

## Frontend Components

### Pages to Create

1. **`/news`** - Main news hub with tabbed navigation
   - Shows featured stories, latest headlines
   - Links to category subpages
   
2. **`/news/top-stories`** - Today's top headlines
3. **`/news/artists-releases`** - Artist spotlights and new releases
4. **`/news/festivals-events`** - Festival and event roundups
5. **`/news/industry-culture`** - Scene and culture updates

### Component Structure

```text
src/pages/
  News.tsx                    # Main news hub
  NewsTopStories.tsx          # Today's top stories
  NewsArtistsReleases.tsx     # Artists & releases
  NewsFestivalsEvents.tsx     # Festivals & events
  NewsIndustryCulture.tsx     # Industry & culture

src/components/news/
  NewsCard.tsx                # Individual article card
  NewsCategorySection.tsx     # Section with category header
  NewsFeaturedHero.tsx        # Hero section for featured story
  NewsGrid.tsx                # Grid layout for articles
  NewsFilters.tsx             # Date/category filters
  NewsSkeleton.tsx            # Loading skeleton
```

### Design Elements
- Mobile-first responsive grid layout
- Card-based article display with image, title, date, summary, and source
- Category color-coding (neon accent colors matching site theme)
- Smooth animations using Framer Motion
- "Read More" links to original sources (opens in new tab)

---

## Edge Function: `edm-news-fetcher`

### Responsibilities
1. Fetch RSS feeds from whitelisted EDM news sources
2. Parse and extract article data
3. Auto-categorize articles by keywords
4. Deduplicate by title + source URL
5. Store new articles in database
6. Run daily via Supabase cron job

### RSS Sources to Add to Whitelist
- `www.edm.com` - Main EDM news
- `mixmag.net` - DJ culture and news
- `djmag.com` - Industry news
- `dancingastronaut.com` - Electronic music news
- `youredm.com` - EDM community news

### Auto-Categorization Logic
```text
Keywords → Category mapping:
- "festival", "tour", "announce", "lineup" → event
- "release", "single", "album", "EP", "track" → release
- "DJ", "producer", "artist" → artist
- "industry", "streaming", "label" → industry
- Default → headline
```

---

## Cron Job Setup

### Daily News Fetch (7:00 AM UTC)
```sql
SELECT cron.schedule(
  'daily-edm-news-fetch',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/edm-news-fetcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object('source', 'cron')
  );
  $$
);
```

---

## Implementation Steps

### Phase 1: Database Setup
1. Create `news_category` enum type
2. Create `edm_news_articles` table with proper indexes
3. Add RLS policies (public read, service role write)
4. Create index on `published_at` for efficient queries

### Phase 2: Edge Function
1. Create `supabase/functions/edm-news-fetcher/index.ts`
2. Add RSS domains to whitelist in `rss-feed-fetch` or create dedicated fetcher
3. Implement parsing, categorization, and deduplication logic
4. Add rate limiting and error handling
5. Deploy and test manually

### Phase 3: Frontend Pages
1. Create main `/news` page with hero and category tabs
2. Build reusable `NewsCard` and `NewsGrid` components
3. Implement category subpages
4. Add React Query hooks for data fetching
5. Style with Tailwind matching existing cyber/neon theme

### Phase 4: Navigation & SEO
1. Add "News" to main navigation
2. Implement SEO component with news-specific meta tags
3. Add structured data (NewsArticle schema)
4. Update sitemap

### Phase 5: Automation
1. Set up daily cron job for news fetching
2. Add manual fetch trigger in admin panel
3. Implement cleanup job for old articles (optional)

---

## Technical Details

### React Query Hook Example
```typescript
export function useNewsArticles(category?: string, limit = 20) {
  return useQuery({
    queryKey: ['news', category, limit],
    queryFn: async () => {
      let query = supabase
        .from('edm_news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### SEO Keywords
- EDM news
- Dance music updates
- Festival announcements
- Electronic music news
- DJ news and releases
- Rave culture updates

---

## File Changes Summary

### New Files
- `supabase/functions/edm-news-fetcher/index.ts` - News fetching edge function
- `src/pages/News.tsx` - Main news hub page
- `src/pages/NewsTopStories.tsx` - Top stories subpage
- `src/pages/NewsArtistsReleases.tsx` - Artists & releases subpage
- `src/pages/NewsFestivalsEvents.tsx` - Events subpage
- `src/pages/NewsIndustryCulture.tsx` - Industry subpage
- `src/components/news/NewsCard.tsx` - Article card component
- `src/components/news/NewsGrid.tsx` - Grid layout component
- `src/components/news/NewsFeaturedHero.tsx` - Featured story hero
- `src/components/news/NewsSkeleton.tsx` - Loading states
- `src/hooks/useNewsArticles.tsx` - Data fetching hook

### Modified Files
- `src/App.tsx` - Add news routes
- `src/components/Navigation.tsx` - Add News link
- `supabase/config.toml` - Add edge function config
- `supabase/functions/rss-feed-fetch/index.ts` - Extend whitelist OR create new function
- `scripts/generate-prerender.ts` - Add news pages
- `public/sitemap.xml` - Add news URLs

### Database Migration
- Create `news_category` enum
- Create `edm_news_articles` table
- Add RLS policies
- Set up daily cron job

---

## Notes

- The RSS whitelist in `rss-feed-fetch` will need to be extended to include EDM news domains
- Articles link to original sources rather than hosting full content (respecting copyright)
- Consider adding a "last updated" timestamp display on the news page
- Future enhancement: Add user favorites/bookmarks for logged-in users
