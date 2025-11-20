# Episode Automation System

This document explains how to use the automated episode creation system for Dance One Radio podcast episodes.

## Overview

The episode automation system streamlines the process of creating new episode pages by:
- ✅ Automatically fetching episode metadata from the RSS feed
- ✅ Generating complete episode pages with full SEO configuration
- ✅ Updating routing configuration automatically
- ✅ Updating prerender configuration for static HTML generation
- ✅ Preserving all template features (audio player, progress tracking, authentication, social sharing, etc.)
- ✅ Providing CSV import tool for track listings

## System Components

### 1. Episode Generator Script (`scripts/generate-episode.ts`)
The main automation script that:
- Fetches the latest episode from the RSS feed
- Parses episode metadata (number, title, date, duration, audio URL, description)
- Generates a new episode page file
- Updates `src/App.tsx` with routing
- Updates `scripts/generate-prerender.ts` with SEO metadata

### 2. CSV Track Importer (`src/components/admin/CSVTrackImporter.tsx`)
A React component that:
- Allows CSV file upload with track listings
- Parses CSV data (Artist, Title format)
- Generates JSX code for track listings
- Provides copy-to-clipboard functionality

## How to Use

### Step 1: Generate New Episode Page

When a new episode is published to your RSS feed, run the generator script:

```bash
npm run generate-episode
```

Or manually:

```bash
npx tsx scripts/generate-episode.ts
```

**What happens:**
1. Script fetches RSS feed from `https://www.blubrry.com/feeds/futureDanceAnthems.xml`
2. Parses the most recent episode data
3. Checks if episode already exists (skips if it does)
4. Creates `src/pages/Episode[N].tsx` with:
   - Full SEO configuration (title, description, Open Graph, Twitter Card, JSON-LD)
   - Audio player with progress tracking
   - Authentication integration
   - Social sharing buttons
   - Responsive design
   - Ad placement
   - Apple Podcasts link
5. Updates `src/App.tsx` with import and route
6. Updates `scripts/generate-prerender.ts` with prerender configuration

**Output:**
```
🚀 Starting automated episode generation...

Fetching RSS feed...
✓ Fetched RSS feed

📻 Found Episode 396: Anthems of the week 396
   Date: November 20, 2025
   Duration: 1h 45m
   Audio: https://media.blubrry.com/futuredanceanthems/...

📝 Generating episode file...
✓ Created src/pages/Episode396.tsx

🔄 Updating routing configuration...
✓ Updated App.tsx routing

🔧 Updating prerender configuration...
✓ Updated prerender configuration

✅ Episode generation complete!

📋 Next steps:
   1. Review the generated file: src/pages/Episode396.tsx
   2. Import track listing CSV to add tracks
   3. Test the episode page at /episode/396
   4. Commit and deploy the changes
```

### Step 2: Import Track Listing

After generating the episode page, add the track listing:

#### Option A: Using the CSV Importer Component (Recommended)

1. **Access the CSV Importer:**
   - Navigate to any page where you've added the `<CSVTrackImporter />` component
   - Or temporarily add it to a test page:
   ```tsx
   import CSVTrackImporter from '@/components/admin/CSVTrackImporter';
   
   // Add to your component
   <CSVTrackImporter />
   ```

2. **Prepare Your CSV File:**
   - Format: `Artist, Title` (one track per line)
   - Example:
   ```csv
   Above & Beyond,Peace of Mind
   Prospa,Prayer
   KETTAMA,The Answer
   Hot Since 82,Buggin
   ```
   - Supports both comma-separated (CSV) and tab-separated (TSV) formats
   - Leading/trailing quotes are automatically removed

3. **Import and Copy:**
   - Click the upload area or drag your CSV file
   - Preview the parsed tracks
   - Click "Copy JSX" to copy the generated code

4. **Update Episode File:**
   - Open `src/pages/Episode[N].tsx` in your editor
   - Find the Track Listing section:
   ```tsx
   <div className="space-y-2 font-['Rajdhani']">
     {/* TODO: Add track listing here after CSV import */}
     <p className="text-muted-foreground italic">
       Track listing will be added after CSV import
     </p>
   </div>
   ```
   - Replace the TODO section with the copied JSX:
   ```tsx
   <div className="space-y-2 font-['Rajdhani']">
     <p key={1}>1. Above & Beyond - Peace of Mind</p>
     <p key={2}>2. Prospa - Prayer</p>
     <p key={3}>3. KETTAMA - The Answer</p>
     <p key={4}>4. Hot Since 82 - Buggin</p>
   </div>
   ```

#### Option B: Manual Track Entry

If you prefer to manually add tracks:

```tsx
<div className="space-y-2 font-['Rajdhani']">
  <p>1. Artist Name - Track Title</p>
  <p>2. Artist Name - Track Title</p>
  <p>3. Artist Name - Track Title</p>
</div>
```

### Step 3: Review and Test

1. **Review the generated page:**
   - Check `src/pages/Episode[N].tsx` for accuracy
   - Verify episode metadata (title, date, duration)
   - Confirm audio URL is correct

2. **Test locally:**
   - Start dev server: `npm run dev`
   - Navigate to `/episode/[N]`
   - Test audio player
   - Test progress tracking (requires authentication)
   - Verify track listing displays correctly
   - Check social sharing buttons
   - Test responsive design

3. **Verify SEO:**
   - View page source
   - Confirm meta tags are present
   - Test social sharing preview using [OpenGraph.xyz](https://www.opengraph.xyz/)

### Step 4: Deploy

```bash
git add .
git commit -m "Add Episode [N]: [Title]"
git push
```

The episode will be automatically deployed with:
- Frontend code (episode page, routing)
- Prerendered static HTML for SEO
- All metadata and structured data

## What Gets Automated

### ✅ Automatically Generated
- Episode page file creation
- Episode number extraction
- Title and description
- Publish date formatting
- Duration calculation and formatting
- Audio URL extraction
- SEO metadata (all tags)
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data
- Canonical URL
- Routing configuration
- Prerender configuration
- Template features:
  - Audio player integration
  - Progress tracking hooks
  - Authentication integration
  - Social sharing component
  - Login prompt
  - Navigation and footer
  - Responsive design
  - Ad placement
  - Apple Podcasts link

### 📝 Manual Steps Required
- Track listing import (via CSV or manual entry)
- Review and verification
- Deployment approval

## RSS Feed Data Source

**Feed URL:** `https://www.blubrry.com/feeds/futureDanceAnthems.xml`

**Extracted Data:**
- Episode number (from title)
- Episode title
- Description (cleaned HTML)
- Audio URL (from enclosure)
- Duration (from iTunes tags, converted to "Xh Xm" format)
- Publish date (formatted as "Month Day, Year")

**Note:** The RSS feed is the authoritative source for episode metadata. Always verify the feed contains accurate information before running the generator.

## File Structure

```
project/
├── scripts/
│   ├── generate-episode.ts          # Main generator script
│   └── generate-prerender.ts        # Prerender config (auto-updated)
├── src/
│   ├── components/
│   │   └── admin/
│   │       └── CSVTrackImporter.tsx # CSV import component
│   ├── pages/
│   │   ├── Episode395.tsx           # Template reference
│   │   └── Episode396.tsx           # Generated episode
│   └── App.tsx                      # Routes (auto-updated)
└── EPISODE-AUTOMATION.md            # This document
```

## Troubleshooting

### Episode Already Exists
If you see "Episode already exists" but want to regenerate:
1. Delete the existing file: `src/pages/Episode[N].tsx`
2. Remove the route from `src/App.tsx`
3. Remove the entry from `scripts/generate-prerender.ts`
4. Run the generator again

### RSS Feed Parse Error
If episode data can't be parsed:
1. Check RSS feed is accessible: `curl https://www.blubrry.com/feeds/futureDanceAnthems.xml`
2. Verify feed contains latest episode
3. Check episode title format matches pattern (e.g., "Anthems of the week 396")
4. Ensure feed XML is valid

### Missing Track Listing
If tracks don't appear:
1. Verify CSV format: `Artist, Title`
2. Check for proper line breaks
3. Ensure JSX was copied to correct location in episode file
4. Check for syntax errors in the pasted JSX

### Audio Player Not Working
1. Verify audio URL is correct in RSS feed
2. Check browser console for CORS errors
3. Test audio URL directly in browser
4. Ensure URL uses HTTPS

### Progress Tracking Not Saving
1. User must be authenticated
2. Check Supabase connection
3. Verify `episode_listening_progress` table exists
4. Check browser console for errors

## CSV Format Examples

### Example 1: Comma-Separated (CSV)
```csv
Above & Beyond,Peace of Mind
Prospa,Prayer
KETTAMA,The Answer
Hot Since 82,Buggin
John Summit,Shiver
```

### Example 2: Tab-Separated (TSV)
```
Above & Beyond	Peace of Mind
Prospa	Prayer
KETTAMA	The Answer
Hot Since 82	Buggin
John Summit	Shiver
```

### Example 3: With Quotes
```csv
"Above & Beyond","Peace of Mind"
"Prospa","Prayer"
"KETTAMA","The Answer"
```

All formats are automatically handled by the CSV importer.

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "generate-episode": "tsx scripts/generate-episode.ts",
    "prerender": "tsx scripts/generate-prerender.ts"
  }
}
```

## SEO Features Preserved

Every generated episode includes:
- ✅ Document title optimization
- ✅ Meta description (155 characters)
- ✅ Keywords meta tag
- ✅ Open Graph tags (title, description, image, URL, type, site_name)
- ✅ Twitter Card tags (card, title, description, image, site)
- ✅ Robots meta tag
- ✅ Canonical URL
- ✅ JSON-LD structured data (WebPage + RadioStation)
- ✅ Prerendered static HTML

## Support

For issues or questions:
1. Check this documentation
2. Review the generated episode file
3. Compare with template file (`Episode395.tsx`)
4. Check RSS feed data
5. Review console logs for errors

## Future Enhancements

Potential improvements:
- [ ] Automatic deployment trigger
- [ ] Bulk episode import
- [ ] Track listing API integration
- [ ] Episode validation checks
- [ ] Automated testing
- [ ] Image upload for episode-specific artwork
- [ ] Analytics integration
