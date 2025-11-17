import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escape function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate URL format
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const episodeId = url.searchParams.get('episode') || ''
    const showsUrl = url.searchParams.get('url') || ''
    
    // Validate and sanitize inputs
    if (showsUrl && !isValidUrl(showsUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const safeUrl = escapeHtml(showsUrl)
    const safeEpisodeId = escapeHtml(episodeId)
    
    // Default meta data
    let title = "Dance One Radio - The Castle of Dance"
    let description = "Live stream of the newest dance and electronic music"
    let image = "/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
    
    if (episodeId && showsUrl.includes('shows')) {
      try {
        // Fetch RSS feed to get episode data
        const rssResponse = await fetch('https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml')
        const rssText = await rssResponse.text()
        
        // Parse RSS to extract episode information
        const titleMatch = rssText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)
        const descriptionMatch = rssText.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g)
        
        if (titleMatch && titleMatch[1]) {
          const episodeTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '')
          title = `${episodeTitle} - Future Dance Anthems with Mario`
        }
        
        if (descriptionMatch && descriptionMatch[1]) {
          const episodeDesc = descriptionMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').substring(0, 120)
          description = `Listen to the latest episode: "${episodeTitle}". ${episodeDesc}...`
        }
        
        // Use shows background image for better visual appeal
        image = "/assets/shows-bg-optimized.jpg"
      } catch (error) {
        console.error('Error fetching episode data:', error)
      }
    }

    // Sanitize title and description for HTML output
    const safeTitle = escapeHtml(title)
    const safeDescription = escapeHtml(description)
    
    // Generate HTML with proper Open Graph meta tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="https://danceoneradio.com${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Dance One Radio">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${safeUrl}">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="https://danceoneradio.com${image}">
    <meta name="twitter:site" content="@DanceOneRadio">
    
    <!-- Redirect to actual page after meta tags are processed -->
    <script>
        // Redirect after 2 seconds to allow crawlers to read meta tags
        setTimeout(() => {
            window.location.href = '${safeUrl}';
        }, 2000);
    </script>
    
    <!-- Immediate redirect for non-crawler traffic -->
    <meta http-equiv="refresh" content="0;url=${safeUrl}">
</head>
<body>
    <p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>...</p>
</body>
</html>`

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error in og-meta-generator:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})