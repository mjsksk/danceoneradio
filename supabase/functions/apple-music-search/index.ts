import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Get Apple Music API token from Supabase secrets
    const appleToken = Deno.env.get('APPLE_MUSIC_TOKEN')
    
    if (!appleToken) {
      console.error('Apple Music token not configured')
      return new Response(
        JSON.stringify({ error: 'Apple Music API not configured' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Search Apple Music API
    const appleResponse = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}&types=songs&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${appleToken}`,
          'Music-User-Token': '', // Optional: for user-specific requests
        }
      }
    )

    if (!appleResponse.ok) {
      console.error('Apple Music API error:', appleResponse.status, appleResponse.statusText)
      return new Response(
        JSON.stringify({ error: 'Apple Music API request failed' }),
        { 
          status: appleResponse.status, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const data = await appleResponse.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in apple-music-search function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})