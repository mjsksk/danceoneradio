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
];

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  
  // Skip if already requesting an HTML file directly
  if (url.pathname.endsWith('.html')) {
    return context.next();
  }
  
  // Skip for static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.mp3', '.mp4', '.webm', '.webp', '.json', '.xml', '.txt'];
  const isStaticAsset = staticExtensions.some(ext => url.pathname.endsWith(ext));
  
  if (isStaticAsset) {
    return context.next();
  }
  
  // Skip asset directories
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.startsWith('/lovable-uploads/') || 
      url.pathname.startsWith('/downloads/')) {
    return context.next();
  }
  
  // Check if request is from a bot
  const isBot = BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
  
  // For bots, fetch the prerendered HTML directly
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
    
    try {
      // Fetch the prerendered file from origin
      const prerenderUrl = new URL(prerenderPath, url.origin);
      const response = await fetch(prerenderUrl.toString(), {
        headers: {
          'Accept': 'text/html',
        }
      });
      
      // If prerendered file exists and is HTML, serve it
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const html = await response.text();
          
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Prerender': 'true',
              'X-Bot-Detected': userAgent.substring(0, 50),
              'Cache-Control': 'public, max-age=3600',
            }
          });
        }
      }
    } catch (error) {
      // If prerendered file doesn't exist, fall through to SPA
      console.log(`Prerender fetch failed for: ${prerenderPath}`, error);
    }
  }
  
  // For regular users or if prerender fails, continue with normal SPA routing
  return context.next();
}

export const config = {
  path: "/*",
};
