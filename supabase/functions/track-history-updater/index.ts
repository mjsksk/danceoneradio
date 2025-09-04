import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StreamMetadata {
  title: string;
  status: string;
  timestamp: string;
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

    console.log('🔍 Fetching current stream metadata...');
    
    // Fetch current stream metadata
    const streamUrl = 'http://s9.myradiostream.com:14296/currentsong?sid=1';
    const response = await fetch(streamUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stream metadata: ${response.status}`);
    }
    
    const currentTrack = await response.text();
    console.log('✅ Current track from stream:', currentTrack);

    if (!currentTrack || currentTrack.trim() === '') {
      console.log('❌ No current track data available');
      return new Response(JSON.stringify({ error: 'No current track data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the track info (assuming format: "Artist - Title" or "Title")
    const parseTrackInfo = (trackStr: string) => {
      const cleanTrack = trackStr.trim();
      
      // Try to split by " - " first
      if (cleanTrack.includes(' - ')) {
        const parts = cleanTrack.split(' - ');
        return {
          artist: parts[0].trim(),
          title: parts.slice(1).join(' - ').trim()
        };
      }
      
      // If no " - " separator, treat as title only
      return {
        artist: 'Unknown Artist',
        title: cleanTrack
      };
    };

    const { artist, title } = parseTrackInfo(currentTrack);
    console.log('🎯 Parsed track:', { artist, title });

    // Check if this track is already the most recent in our database
    const { data: recentTrack, error: recentError } = await supabase
      .from('radio_track_history')
      .select('*')
      .order('played_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentError && recentError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ Error fetching recent track:', recentError);
      // Continue anyway - we'll add the track regardless
    }

    // If the current track is different from the most recent, add it to history
    if (!recentTrack || recentTrack.title !== title || recentTrack.artist !== artist) {
      console.log('🆕 New track detected, adding to history');
      
      const trackData: Track = {
        title,
        artist,
        played_at: new Date().toISOString(),
        duration: '3:30', // Default duration
        genre: 'Electronic', // Default genre
        source_url: streamUrl
      };

      const { data: insertData, error: insertError } = await supabase
        .from('radio_track_history')
        .insert([trackData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting track:', insertError);
        throw insertError;
      }

      console.log('✅ Track added to history:', insertData);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'New track added to history',
        track: insertData
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.log('🔄 Track unchanged, no update needed');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Track unchanged',
        track: recentTrack
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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