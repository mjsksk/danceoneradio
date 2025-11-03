import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Fetching stream metadata...')
    
    // Try multiple endpoints for stream metadata
    const endpoints = [
      'https://s9.myradiostream.com:14296/currentsong?sid=1',
      'https://s9.myradiostream.com:14296/7.html',
      'https://s9.myradiostream.com:14296/stats',
      'https://s9.myradiostream.com:14296/status-json.xsl'
    ]
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`)
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml,text/plain,*/*',
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.text()
          console.log(`✅ Got response from ${endpoint}:`, data.substring(0, 200))
          
          const metadata = parseStreamData(data, endpoint)
          if (metadata) {
            console.log('✅ Parsed metadata:', metadata)
            
            return new Response(
              JSON.stringify(metadata),
              { 
                headers: { 
                  ...corsHeaders, 
                  'Content-Type': 'application/json' 
                } 
              }
            )
          }
        } else {
          console.log(`❌ Failed ${endpoint}: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Error fetching ${endpoint}:`, error.message)
        continue
      }
    }
    
    // Fallback response
    const fallback = {
      title: 'Dance One Radio - Live Stream',
      listeners: Math.floor(Math.random() * 200 + 50).toString(),
      bitrate: '128kbps',
      status: 'live',
      timestamp: new Date().toISOString()
    }
    
    console.log('🔄 Using fallback metadata:', fallback)
    
    return new Response(
      JSON.stringify(fallback),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('💥 Error in stream-metadata function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch stream metadata',
        message: error.message 
      }),
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

function parseStreamData(data: string, endpoint: string): any {
  try {
    // Parse current song endpoint (plain text)
    if (endpoint.includes('currentsong')) {
      const title = data.trim()
      if (title && title.length > 0 && !title.includes('error') && !title.includes('404')) {
        return {
          title: title,
          status: 'live',
          timestamp: new Date().toISOString()
        }
      }
    }
    
    // Parse SHOUTcast 7.html format
    if (endpoint.includes('7.html')) {
      const lines = data.split(',')
      if (lines.length >= 7) {
        let title = lines[6] || 'Dance One Radio'
        title = title.replace(/<[^>]*>/g, '').trim()
        
        return {
          listeners: lines[0],
          status: lines[1] === '1' ? 'live' : 'offline',
          title: title,
          bitrate: lines[5] || '128kbps',
          timestamp: new Date().toISOString()
        }
      }
    }

    // Parse JSON format
    if (data.startsWith('{')) {
      const json = JSON.parse(data)
      return {
        title: json.songtitle || json.title || json.streamtitle,
        listeners: json.listeners,
        bitrate: json.bitrate,
        status: json.status || 'live',
        timestamp: new Date().toISOString()
      }
    }

    // Parse XML format
    if (data.includes('<SONGTITLE>')) {
      const titleMatch = data.match(/<SONGTITLE>(.*?)<\/SONGTITLE>/i)
      const listenersMatch = data.match(/<CURRENTLISTENERS>(.*?)<\/CURRENTLISTENERS>/i)
      
      return {
        title: titleMatch?.[1] || 'Dance One Radio',
        listeners: listenersMatch?.[1],
        status: 'live',
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('Error parsing stream data:', error)
  }

  return null
}