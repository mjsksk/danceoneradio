import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface Track {
  title: string;
  artist: string;
  played_at: string;
  duration?: string;
  genre?: string;
  source_url: string;
}

Deno.serve(async (req) => {
  console.log('🎵 Track history updater function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Rate limiting - 10 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(
      supabase,
      {
        endpoint: 'track-history-updater',
        maxRequests: 10,
        windowMs: 60000
      },
      clientIp,
      req.headers.get('user-agent') || undefined
    );

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
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

    console.log('🔍 Fetching current track from radio stream...');
    
    // Fetch from current song endpoint (admin endpoint requires auth we don't have)
    let historyData = '';
    
    try {
      const currentResponse = await fetch('https://s9.myradiostream.com:14296/currentsong?sid=1', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
      });
      
      if (currentResponse.ok) {
        const currentTrack = await currentResponse.text();
        console.log('🎵 Got current track:', currentTrack);
        historyData = currentTrack;
      } else {
        console.log('❌ Current track fetch failed with status:', currentResponse.status);
      }
    } catch (error) {
      console.log('❌ Fetch failed:', error);
    }

    // If no data, return success with empty tracks (not an error condition)
    if (!historyData || historyData.trim() === '') {
      console.log('ℹ️ No current track data available at this time');
      return new Response(JSON.stringify({ 
        success: true, 
        message: '0 new tracks added',
        totalTracks: 0,
        tracks: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the history data
    const tracks = parseHistoryData(historyData);
    console.log('🎯 Parsed tracks:', tracks.length);

    if (tracks.length === 0) {
      console.log('ℹ️ No tracks parsed from data');
      return new Response(JSON.stringify({ 
        success: true, 
        message: '0 new tracks added',
        totalTracks: 0,
        tracks: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store tracks in database
    let newTracksAdded = 0;
    
    for (const track of tracks) {
      try {
        // Check if track already exists (without checking exact played_at to avoid duplicates)
        const { data: existingTrack, error: queryError } = await supabase
          .from('radio_track_history')
          .select('id, played_at')
          .eq('title', track.title)
          .eq('artist', track.artist)
          .order('played_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (queryError) {
          console.log('⚠️ Query error:', queryError);
        }

        // Only add if no existing track found, or if the last occurrence was more than 30 minutes ago
        let shouldAdd = true;
        
        if (existingTrack && existingTrack.played_at) {
          try {
            const existingDate = new Date(existingTrack.played_at);
            const currentTime = new Date().getTime();
            const existingTime = existingDate.getTime();
            
            // Validate dates are valid numbers
            if (isNaN(existingTime) || isNaN(currentTime)) {
              console.log('⚠️ Invalid date detected:', { existingTrack, currentTime });
              shouldAdd = true; // Add anyway if dates are invalid
            } else {
              const timeDiff = currentTime - existingTime;
              shouldAdd = timeDiff > 30 * 60 * 1000;
              console.log(`⏱️ Time since last play: ${Math.round(timeDiff / 1000 / 60)} minutes`);
            }
          } catch (dateError) {
            console.log('⚠️ Date comparison error:', dateError);
            shouldAdd = true; // Add anyway if comparison fails
          }
        }

        if (shouldAdd) {
          const { error: insertError } = await supabase
            .from('radio_track_history')
            .insert([track]);

          if (!insertError) {
            newTracksAdded++;
            console.log('✅ Added new track:', track.title, 'by', track.artist);
          } else {
            console.log('❌ Error inserting track:', insertError);
          }
        } else {
          console.log('⏭️ Skipping duplicate track:', track.title, 'by', track.artist);
        }
      } catch (trackError) {
        console.error('❌ Error processing track:', trackError, track);
        // Continue with next track instead of failing completely
      }
    }

    console.log(`🎵 Processing complete: ${newTracksAdded} new tracks added`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${newTracksAdded} new tracks added`,
      totalTracks: tracks.length,
      tracks: tracks.slice(0, 5) // Return first 5 for debugging
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in track history updater:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update track history'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseHistoryData(data: string): Track[] {
  const tracks: Track[] = [];
  console.log('🔍 Parsing history data, length:', data.length);
  console.log('📋 First 500 chars:', data.substring(0, 500));

  try {
    // Try to parse different formats that might be returned
    
    // Format 1: Plain text track info (one per line)
    if (data.includes('\n') || data.includes('\r')) {
      const lines = data.split(/\r?\n/).filter(line => line.trim());
      console.log('📝 Found', lines.length, 'lines to parse');
      
      lines.forEach((line, index) => {
        const trackInfo = parseTrackInfo(line.trim());
        if (trackInfo) {
          try {
            const playedTime = new Date();
            playedTime.setMinutes(playedTime.getMinutes() - (index * 5)); // Assume 5min intervals
            
            // Validate the date is valid
            if (isNaN(playedTime.getTime())) {
              console.error('❌ Invalid date created for track:', trackInfo);
              return;
            }
            
            tracks.push({
              ...trackInfo,
              played_at: playedTime.toISOString(),
              source_url: 'https://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history'
            });
          } catch (error) {
            console.error('❌ Error creating date for track:', error, trackInfo);
          }
        }
      });
    }
    
    // Format 2: HTML format
    else if (data.includes('<') && data.includes('>')) {
      console.log('🌐 Parsing HTML format');
      // Look for common HTML patterns in streaming history
      const titleMatches = data.match(/<title[^>]*>([^<]+)<\/title>/gi);
      const trackMatches = data.match(/(?:title|track|song)[:=]\s*([^<\n\r]+)/gi);
      
      if (titleMatches) {
        titleMatches.forEach((match, index) => {
          const content = match.replace(/<[^>]+>/g, '').trim();
          const trackInfo = parseTrackInfo(content);
          if (trackInfo) {
            try {
              const playedTime = new Date();
              playedTime.setMinutes(playedTime.getMinutes() - (index * 5));
              
              // Validate the date is valid
              if (isNaN(playedTime.getTime())) {
                console.error('❌ Invalid date created for HTML track:', trackInfo);
                return;
              }
              
              tracks.push({
                ...trackInfo,
                played_at: playedTime.toISOString(),
                source_url: 'https://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history'
              });
            } catch (error) {
              console.error('❌ Error creating date for HTML track:', error, trackInfo);
            }
          }
        });
      }
    }
    
    // Format 3: Single track (current song fallback)
    else {
      console.log('🎵 Parsing as single track');
      const trackInfo = parseTrackInfo(data.trim());
      if (trackInfo) {
        try {
          const currentTime = new Date();
          
          // Validate the date is valid
          if (isNaN(currentTime.getTime())) {
            console.error('❌ Invalid current date created');
          } else {
            tracks.push({
              ...trackInfo,
              played_at: currentTime.toISOString(),
              source_url: 'https://s9.myradiostream.com:14296/currentsong?sid=1'
            });
          }
        } catch (error) {
          console.error('❌ Error creating date for single track:', error, trackInfo);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error parsing history data:', error);
  }

  console.log('✅ Parsed', tracks.length, 'tracks');
  return tracks;
}

function parseTrackInfo(trackStr: string): { title: string; artist: string; duration?: string; genre?: string } | null {
  if (!trackStr || trackStr.trim() === '') {
    return null;
  }

  const cleanTrack = trackStr.trim();
  console.log('🔍 Parsing track string:', cleanTrack);
  
  // Try different patterns
  if (cleanTrack.includes(' - ')) {
    const parts = cleanTrack.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      duration: '3:30', // Default duration
      genre: 'Electronic' // Default genre
    };
  }
  
  // If no separator, treat as title with generic artist
  return {
    artist: 'Dance One Radio',
    title: cleanTrack,
    duration: '3:30',
    genre: 'Electronic'
  };
}