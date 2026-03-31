import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShowTrack {
  id: string;
  episode_number: number;
  track_order: number;
  artist: string;
  title: string;
  album: string | null;
  duration_seconds: number | null;
  played_at: string | null;
  amazon_url: string | null;
  beatport_url: string | null;
  apple_music_url: string | null;
}

export const useShowTracks = (episodeNumber: number) => {
  const [tracks, setTracks] = useState<ShowTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('show_tracks')
        .select('*')
        .eq('episode_number', episodeNumber)
        .order('track_order', { ascending: true });

      if (!error && data) {
        setTracks(data as ShowTrack[]);
      }
      setLoading(false);
    };

    fetchTracks();
  }, [episodeNumber]);

  return { tracks, loading };
};
