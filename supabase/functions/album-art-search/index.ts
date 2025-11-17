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

    // Rate limiting: 30 requests per minute per IP
    const clientId = getClientIdentifier(req)
    const rateLimitResult = await checkRateLimit(
      supabase,
      {
        endpoint: 'album-art-search',
        maxRequests: 30,
        windowMs: 60000
      },
      clientId,
      req.headers.get('user-agent') || undefined
    )

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          } 
        }
      )
    }

    const { query } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Search iTunes API (no authentication required)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`
    const itunesResponse = await fetch(itunesUrl)
    
    if (!itunesResponse.ok) {
      return new Response(
        JSON.stringify({ imageUrl: null }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const data = await itunesResponse.json()
    
    if (data.results && data.results.length > 0) {
      const track = data.results[0]
      const artworkUrl = track.artworkUrl100?.replace('100x100', '600x600')
      return new Response(
        JSON.stringify({ imageUrl: artworkUrl }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ imageUrl: null }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in album-art-search function:', error)
    return new Response(
      JSON.stringify({ imageUrl: null, error: error.message }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
