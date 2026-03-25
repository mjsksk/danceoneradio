import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createTrackSlug } from '@/utils/trackSlug';

export interface TrackData {
  id: string;
  artist: string;
  title: string;
  genre: string | null;
  played_at: string;
  duration: string | null;
  slug: string;
}

export function useTrackBySlug(slug: string) {
  return useQuery({
    queryKey: ['track-page', slug],
    queryFn: async (): Promise<TrackData | null> => {
      // Fetch recent tracks and match by slug
      const { data, error } = await supabase
        .from('radio_track_history')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      if (!data) return null;

      const match = data.find(track => createTrackSlug(track.artist, track.title) === slug);
      if (!match) return null;

      return {
        id: match.id,
        artist: match.artist,
        title: match.title,
        genre: match.genre,
        played_at: match.played_at,
        duration: match.duration,
        slug,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecentTracks(limit = 20) {
  return useQuery({
    queryKey: ['recent-tracks-seo', limit],
    queryFn: async (): Promise<TrackData[]> => {
      const { data, error } = await supabase
        .from('radio_track_history')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      if (!data) return [];

      // Deduplicate by slug
      const seen = new Set<string>();
      const unique: TrackData[] = [];
      for (const track of data) {
        if (track.title.includes('Dance One Radio') || track.artist.includes('Dance One Radio')) continue;
        const slug = createTrackSlug(track.artist, track.title);
        if (seen.has(slug)) continue;
        seen.add(slug);
        unique.push({
          id: track.id,
          artist: track.artist,
          title: track.title,
          genre: track.genre,
          played_at: track.played_at,
          duration: track.duration,
          slug,
        });
        if (unique.length >= limit) break;
      }
      return unique;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedTracks(artist: string, currentSlug: string, limit = 10) {
  return useQuery({
    queryKey: ['related-tracks', artist, currentSlug],
    queryFn: async (): Promise<TrackData[]> => {
      const { data, error } = await supabase
        .from('radio_track_history')
        .select('*')
        .ilike('artist', `%${artist.split(' ')[0]}%`)
        .order('played_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data) return [];

      const seen = new Set<string>();
      seen.add(currentSlug);
      const related: TrackData[] = [];
      for (const track of data) {
        const slug = createTrackSlug(track.artist, track.title);
        if (seen.has(slug)) continue;
        seen.add(slug);
        related.push({
          id: track.id,
          artist: track.artist,
          title: track.title,
          genre: track.genre,
          played_at: track.played_at,
          duration: track.duration,
          slug,
        });
        if (related.length >= limit) break;
      }
      return related;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!artist,
  });
}
