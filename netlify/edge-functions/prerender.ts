import type { Context } from "https://edge.netlify.com";

// Version for debugging deployments - update on every change
const VERSION = "v5.0.1";
const DEPLOYED_AT = new Date().toISOString();

// List of known social media and search engine bots that need prerendered content
const BOTS = [
  // Social Media
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Pinterest',
  'Discordbot',
  'Viber',
  'Snapchat',
  'Line',
  // Search Engines
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'YandexBot',
  'DuckDuckBot',
  // Preview Services
  'Embedly',
  'outbrain',
  'W3C_Validator',
  'vkShare',
  'redditbot',
  'Applebot',
];

// Route to metadata mapping - must match generate-prerender.ts
const ROUTE_METADATA: Record<string, { title: string; description: string; image: string }> = {
  '/': {
    title: 'Dance One Radio - The Castle of Dance | Live Electronic & Dance Music Stream',
    description: 'Listen to Dance One Radio - Live streaming the newest dance, electronic, trance, house, and EDM music 24/7. Your ultimate castle of dance music with DJ mixes, podcasts, and exclusive shows.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  '/shows': {
    title: 'DJ Shows & Podcasts - Dance One Radio',
    description: 'Listen to exclusive DJ mixes, podcasts, and radio shows from Dance One Radio. New episodes weekly featuring the best electronic and dance music.',
    image: '/lovable-uploads/mario-show.jpg'
  },
  '/gallery': {
    title: 'Photo Galleries - Love Parade Events | Dance One Radio',
    description: 'Browse photo galleries from historic Love Parade events in San Francisco and Berlin. Relive the magic of electronic music culture.',
    image: '/assets/love-parade-2006.png'
  },
  '/about': {
    title: 'About Dance One Radio - Electronic Dance Music Station',
    description: 'Learn about Dance One Radio\'s history, mission, and the passionate team behind your favorite electronic dance music station.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  '/contact': {
    title: 'Contact Dance One Radio - Get in Touch',
    description: 'Contact Dance One Radio for inquiries, partnerships, DJ bookings, or to submit your music.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  '/player': {
    title: 'Live Radio Player - Dance One Radio',
    description: 'Listen live to Dance One Radio streaming the newest electronic and dance music 24/7.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
  '/news': {
    title: 'EDM News & Updates - Dance One Radio',
    description: 'Stay updated with the latest electronic dance music news, artist announcements, festival updates, and industry insights.',
    image: '/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png'
  },
};

// Generate episode metadata dynamically
function getEpisodeMetadata(episodeNumber: number) {
  return {
    title: `Anthems of the week ${episodeNumber} - Future Dance Anthems with Mario | Dance One Radio`,
    description: `Episode ${episodeNumber} featuring the latest electronic dance music tracks and unreleased anthems.`,
    image: '/lovable-uploads/mario-show.jpg'
  };
}

// Generate HTML with correct metadata
function generateHTML(pathname: string, origin: string): string {
  let metadata = ROUTE_METADATA[pathname];
  
  // Check for episode routes
  const episodeMatch = pathname.match(/^\/episode\/(\d+)$/);
  if (episodeMatch) {
    const episodeNumber = parseInt(episodeMatch[1], 10);
    metadata = getEpisodeMetadata(episodeNumber);
  }
  
  // Fallback to homepage metadata
  if (!metadata) {
    metadata = ROUTE_METADATA['/'];
  }
  
  const fullUrl = `${origin}${pathname}`;
  const imageUrl = metadata.image.startsWith('http') ? metadata.image : `${origin}${metadata.image}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.png" type="image/png">
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}" />
    <link rel="canonical" href="${fullUrl}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="fb:app_id" content="111030096697" />
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Dance One Radio" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@DanceOneRadio" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:creator" content="@DanceOneRadio" />
    
    <!-- Prerender Version -->
    <meta name="prerender-version" content="${VERSION}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${metadata.title}",
      "description": "${metadata.description}",
      "url": "${fullUrl}",
      "image": "${imageUrl}",
      "publisher": {
        "@type": "RadioStation",
        "name": "Dance One Radio",
        "url": "${origin}"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <h1>${metadata.title}</h1>
      <p>${metadata.description}</p>
    </noscript>
  </body>
</html>`;
}

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Debug override: add ?__prerender=1 to force prerendered response
  const forcePrerender = url.searchParams.has('__prerender');
  
  console.log(`[${VERSION}] Request: ${pathname}, UA: ${userAgent.substring(0, 80)}, forcePrerender: ${forcePrerender}`);
  
  // Skip for static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.mp3', '.mp4', '.webm', '.webp', '.json', '.xml', '.txt', '.html'];
  const isStaticAsset = staticExtensions.some(ext => pathname.endsWith(ext));
  
  if (isStaticAsset && !forcePrerender) {
    return context.next();
  }
  
  // Skip asset directories
  if (pathname.startsWith('/assets/') || 
      pathname.startsWith('/lovable-uploads/') || 
      pathname.startsWith('/downloads/')) {
    if (!forcePrerender) {
      return context.next();
    }
  }
  
  // Check if request is from a bot
  const isBot = BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  console.log(`[${VERSION}] isBot: ${isBot}, forcePrerender: ${forcePrerender}, pathname: ${pathname}`);
  
  // For bots OR debug override, generate and serve HTML with correct metadata directly
  if (isBot || forcePrerender) {
    const html = generateHTML(pathname, url.origin);
    
    console.log(`[${VERSION}] Serving prerendered HTML for: ${pathname}`);
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerender': 'true',
        'X-Prerender-Version': VERSION,
        'X-Prerender-Deployed': DEPLOYED_AT,
        'X-Bot-Detected': isBot ? userAgent.substring(0, 50) : 'debug-override',
        'X-Prerender-Pathname': pathname,
        'Cache-Control': forcePrerender ? 'no-cache' : 'public, max-age=3600',
      }
    });
  }
  
  // For regular users, continue with SPA routing
  return context.next();
}

export const config = {
  path: "/*",
};
