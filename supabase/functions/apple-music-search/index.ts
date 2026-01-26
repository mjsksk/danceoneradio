import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getClientIdentifier } from '../_shared/rateLimiter.ts'

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
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Rate limiting - 200 requests per minute per IP (album art fetching can be bursty)
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      supabase,
      {
        endpoint: 'apple-music-search',
        maxRequests: 200,
        windowMs: 60000
      },
      clientId,
      req.headers.get('user-agent') || undefined
    );

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for client: ${clientId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(rateLimitResult.retryAfter / 1000)
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfter / 1000))
          }
        }
      );
    }

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