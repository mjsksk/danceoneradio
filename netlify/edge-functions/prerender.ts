import type { Context } from "https://edge.netlify.com";

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
  // Generic crawlers
  'crawler',
  'spider',
  'robot',
];

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  
  // Check if request is from a bot
  const isBot = BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  // Skip for static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.mp3', '.mp4', '.webm', '.webp'];
  const isStaticAsset = staticExtensions.some(ext => url.pathname.endsWith(ext));
  
  if (isStaticAsset) {
    return context.next();
  }
  
  // For bots, try to serve prerendered HTML with correct SEO metadata
  if (isBot) {
    const pathname = url.pathname;
    
    // Build the path to the prerendered file
    let prerenderPath: string;
    if (pathname === '/' || pathname === '') {
      prerenderPath = '/index.html';
    } else {
      // Remove trailing slash if present
      const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      prerenderPath = `${cleanPath}/index.html`;
    }
    
    // Try to fetch the prerendered file
    try {
      const response = await context.rewrite(prerenderPath);
      
      // If prerendered file exists, serve it
      if (response.status === 200) {
        // Add header to indicate this was served from prerender
        const headers = new Headers(response.headers);
        headers.set('X-Prerender', 'true');
        headers.set('X-Bot-Detected', userAgent.substring(0, 100));
        
        return new Response(response.body, {
          status: 200,
          headers
        });
      }
    } catch (error) {
      // If prerendered file doesn't exist, fall through to SPA
      console.log(`Prerender file not found for: ${prerenderPath}`);
    }
  }
  
  // For regular users or if prerender fails, continue with normal SPA routing
  return context.next();
}

export const config = {
  path: "/*",
  excludedPath: [
    "/assets/*",
    "/*.js",
    "/*.css",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.gif",
    "/*.svg",
    "/*.ico",
    "/*.woff",
    "/*.woff2",
    "/*.mp3",
    "/*.mp4",
    "/lovable-uploads/*",
    "/downloads/*"
  ]
};
