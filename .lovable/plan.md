

# Plan: Fix Social Sharing Metadata for All Pages

## Problem Analysis

When pages are shared on social media (Facebook, Twitter, WhatsApp, etc.), they display the home page metadata instead of page-specific information. This happens because:

1. Social media crawlers do not run JavaScript
2. The current setup serves `index.html` (with home page metadata) for all routes via SPA routing
3. While page-specific SEO metadata exists in the `generate-prerender.ts` script, the prerendered files are not being served to crawlers

## Solution Overview

Modify the Netlify configuration to serve prerendered HTML files (with correct metadata) to bot/crawler requests while maintaining SPA behavior for regular users.

## Implementation Steps

### Step 1: Update Netlify Configuration

Add crawler detection to serve prerendered HTML files to social media bots:

```text
+-------------------------------+
|   Request from User/Bot       |
+-------------------------------+
              |
              v
+-------------------------------+
|   Is this a crawler bot?      |
|   (Facebook, Twitter, etc.)   |
+-------------------------------+
        |             |
       Yes           No
        |             |
        v             v
+----------------+  +------------------+
| Serve static   |  | Serve index.html |
| prerendered    |  | (SPA routing)    |
| HTML with SEO  |  |                  |
+----------------+  +------------------+
```

**Changes to `netlify.toml`:**
- Add edge function or redirect rules to detect crawler user agents
- Route crawlers to prerendered HTML files with proper meta tags
- Keep regular users on SPA routing

### Step 2: Update Prerender Script

Ensure all pages are covered and generate properly in the dist folder:

**Add missing routes to `scripts/generate-prerender.ts`:**
- `/gallery/love-parade-2005`
- `/gallery/love-parade-2006`
- `/news`
- `/news/top-stories`
- `/news/artists-releases`
- `/news/festivals-events`
- `/news/industry-culture`
- `/account`
- `/auth`

### Step 3: Create Edge Function for Bot Detection (Alternative to Netlify redirects)

Create a Netlify Edge Function that:
1. Detects crawler user agents (facebookexternalhit, Twitterbot, LinkedInBot, WhatsApp, etc.)
2. Serves the appropriate prerendered HTML file with correct metadata
3. Falls back to SPA routing for regular users

### Step 4: Verify Existing SEO Component Usage

All pages already have proper SEO component usage with page-specific metadata. Ensure consistency:

| Page | Image | Status |
|------|-------|--------|
| Episodes | `/lovable-uploads/mario-show.jpg` | Correct |
| Shows | `/lovable-uploads/mario-show.jpg` | Correct |
| Gallery | `/assets/love-parade-2006.png` | Correct |
| News | Default logo | Needs image |
| About | Default logo | Needs image |

---

## Technical Details

### Netlify Edge Function (Recommended Approach)

Create `netlify/edge-functions/prerender.ts`:

```typescript
const BOTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Discordbot'
];

export default async (request: Request, context: any) => {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  if (isBot) {
    const url = new URL(request.url);
    // Try to serve prerendered file
    const prerenderPath = url.pathname === '/' 
      ? '/index.html' 
      : `${url.pathname}/index.html`;
    // Attempt to fetch prerendered version
    return context.rewrite(prerenderPath);
  }
  
  return context.next();
};
```

### Files to be Modified

1. **`netlify.toml`** - Add edge function configuration
2. **`netlify/edge-functions/prerender.ts`** - New file for bot detection
3. **`scripts/generate-prerender.ts`** - Add missing routes
4. **Various page components** - Add missing `image` props to SEO components where needed

### Prerender Routes to Add

```typescript
// Add to generate-prerender.ts routes array:
{ path: '/gallery/love-parade-2005', title: '...', image: '/assets/love-parade-2005.jpg' },
{ path: '/gallery/love-parade-2006', title: '...', image: '/assets/love-parade-2006.png' },
{ path: '/news', title: 'EDM News...', image: '/lovable-uploads/c8f83eb5-...' },
{ path: '/news/top-stories', title: '...', image: '...' },
// etc.
```

---

## Expected Outcome

After implementation:
- Sharing an Episode page will show "Anthems of the week 402" with mario-show.jpg image
- Sharing the Gallery page will show "Photo Galleries - Love Parade" with the Love Parade image
- Each page will display its unique title and description on social platforms
- Regular users will experience no change in SPA functionality

## Testing

1. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Use Twitter Card Validator: https://cards-dev.twitter.com/validator
3. Test sharing links on WhatsApp and other platforms
4. Verify bots receive HTML with correct og:image, og:title, og:description

