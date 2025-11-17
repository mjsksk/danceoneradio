import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Whitelist of allowed RSS feed domains
const ALLOWED_DOMAINS = [
  'feeds.blubrry.com',
  'feeds.podbean.com',
  'feeds.transistor.fm',
  'feeds.libsyn.com',
  'feeds.soundcloud.com',
  'feeds.buzzsprout.com',
  'anchor.fm',
  'podcasts.apple.com'
]

function validateRssUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString)
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' }
    }
    
    // Check against domain whitelist
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    )
    
    if (!isAllowed) {
      return { valid: false, error: 'Domain not in allowed list' }
    }
    
    // Block private IP ranges and localhost
    const hostname = url.hostname.toLowerCase()
    const privatePatterns = [
      /^127\./,           // 127.0.0.0/8 (localhost)
      /^10\./,            // 10.0.0.0/8 (private)
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (private)
      /^192\.168\./,      // 192.168.0.0/16 (private)
      /^169\.254\./,      // 169.254.0.0/16 (link-local/cloud metadata)
      /^localhost$/i,
      /^0\.0\.0\.0$/
    ]
    
    if (privatePatterns.some(pattern => pattern.test(hostname))) {
      return { valid: false, error: 'Access to private IP ranges is not allowed' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Rate limiting - 10 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await checkRateLimit(
      supabase,
      {
        endpoint: 'rss-feed-fetch',
        maxRequests: 10,
        windowMs: 60000
      },
      clientIp,
      req.headers.get('user-agent') || undefined
    )

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`)
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
      )
    }

    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'RSS URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate URL for SSRF protection
    const validation = validateRssUrl(url)
    if (!validation.valid) {
      console.warn(`Invalid RSS URL rejected: ${url}, reason: ${validation.error}`)
      return new Response(
        JSON.stringify({ error: `Invalid URL: ${validation.error}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔄 Fetching RSS feed from:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dance One Radio RSS Reader/1.0'
      },
      // Set timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlContent = await response.text()
    console.log('✅ RSS feed fetched successfully, length:', xmlContent.length)

    return new Response(
      JSON.stringify({ content: xmlContent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ RSS fetch error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})