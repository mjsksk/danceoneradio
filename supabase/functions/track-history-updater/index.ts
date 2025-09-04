import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('🔍 Fetching track history from radio stream...');
    
    // Fetch from the specific history endpoint
    const historyUrl = 'http://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history';
    let historyData = '';
    
    try {
      console.log('📡 Attempting direct fetch from:', historyUrl);
      const response = await fetch(historyUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (response.ok) {
        historyData = await response.text();
        console.log('✅ History data fetched:', historyData.substring(0, 200) + '...');
      } else {
        console.log('❌ History fetch failed with status:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ Direct fetch failed, trying alternative methods:', error);
      
      // Fallback to current song endpoint if history fails
      try {
        const currentResponse = await fetch('http://s9.myradiostream.com:14296/currentsong?sid=1');
        if (currentResponse.ok) {
          const currentTrack = await currentResponse.text();
          console.log('🎵 Got current track as fallback:', currentTrack);
          historyData = currentTrack;
        }
      } catch (fallbackError) {
        console.log('❌ Fallback also failed:', fallbackError);
        throw new Error('All endpoints failed');
      }
    }

    if (!historyData || historyData.trim() === '') {
      console.log('❌ No history data available');
      return new Response(JSON.stringify({ error: 'No history data available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the history data
    const tracks = parseHistoryData(historyData);
    console.log('🎯 Parsed tracks:', tracks.length);

    if (tracks.length === 0) {
      console.log('❌ No tracks found in history data');
      return new Response(JSON.stringify({ error: 'No tracks found in history' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store tracks in database
    let newTracksAdded = 0;
    
    for (const track of tracks) {
      // Check if track already exists
      const { data: existingTrack } = await supabase
        .from('radio_track_history')
        .select('id')
        .eq('title', track.title)
        .eq('artist', track.artist)
        .eq('played_at', track.played_at)
        .single();

      if (!existingTrack) {
        const { error: insertError } = await supabase
          .from('radio_track_history')
          .insert([track]);

        if (!insertError) {
          newTracksAdded++;
          console.log('✅ Added new track:', track.title, 'by', track.artist);
        } else {
          console.log('❌ Error inserting track:', insertError);
        }
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
      error: 'Failed to update track history',
      details: error.message 
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
          const playedTime = new Date();
          playedTime.setMinutes(playedTime.getMinutes() - (index * 5)); // Assume 5min intervals
          
          tracks.push({
            ...trackInfo,
            played_at: playedTime.toISOString(),
            source_url: 'http://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history'
          });
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
            const playedTime = new Date();
            playedTime.setMinutes(playedTime.getMinutes() - (index * 5));
            
            tracks.push({
              ...trackInfo,
              played_at: playedTime.toISOString(),
              source_url: 'http://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history'
            });
          }
        });
      }
    }
    
    // Format 3: Single track (current song fallback)
    else {
      console.log('🎵 Parsing as single track');
      const trackInfo = parseTrackInfo(data.trim());
      if (trackInfo) {
        tracks.push({
          ...trackInfo,
          played_at: new Date().toISOString(),
          source_url: 'http://s9.myradiostream.com:14296/currentsong?sid=1'
        });
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