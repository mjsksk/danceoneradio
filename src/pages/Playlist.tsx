import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createTrackSlug } from '@/utils/trackSlug';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Disc3, Music, Search } from 'lucide-react';

interface PlaylistTrack {
  id: string;
  artist: string;
  title: string;
  genre: string | null;
  played_at: string;
  slug: string;
}

function usePlaylist24h() {
  return useQuery({
    queryKey: ['playlist-24h'],
    queryFn: async (): Promise<PlaylistTrack[]> => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('radio_track_history')
        .select('id, artist, title, genre, played_at')
        .gte('played_at', since)
        .order('played_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      return (data ?? [])
        .filter(
          (t) =>
            !t.title?.includes('Dance One Radio') &&
            !t.artist?.includes('Dance One Radio'),
        )
        .map((t) => ({
          id: t.id,
          artist: t.artist,
          title: t.title,
          genre: t.genre,
          played_at: t.played_at,
          slug: createTrackSlug(t.artist, t.title),
        }));
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const Playlist = () => {
  const { data: tracks, isLoading } = usePlaylist24h();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks ?? [];
    return (tracks ?? []).filter(
      (t) =>
        t.artist.toLowerCase().includes(q) || t.title.toLowerCase().includes(q),
    );
  }, [tracks, query]);

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'MusicPlaylist',
      name: 'Dance One Radio Playlist — Last 24 Hours',
      url: 'https://danceoneradio.com/playlist',
      numTracks: tracks?.length ?? 0,
      track: (tracks ?? []).slice(0, 50).map((t) => ({
        '@type': 'MusicRecording',
        name: t.title,
        byArtist: { '@type': 'MusicGroup', name: t.artist },
        url: `https://danceoneradio.com/track/${t.slug}`,
      })),
    }),
    [tracks],
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Playlist — Songs Played in the Last 24 Hours | Dance One Radio"
        description="Search every song played on Dance One Radio in the last 24 hours. Find the artist and title of the track you heard on the live stream."
        url="https://danceoneradio.com/playlist"
        keywords="dance one radio playlist, what song was played, track history, recently played songs, EDM playlist, radio song list"
        structuredData={structuredData}
      />

      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Playlist</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-4">
            <span className="text-neon">PLAY</span>
            <span className="text-neon-purple">LIST</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every song played on the Dance One Radio live stream in the last 24 hours,
            newest first. Search by artist or title to identify a track you heard.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-10">
          <label htmlFor="playlist-search" className="sr-only">
            Search played tracks by artist or title
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="playlist-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist or title..."
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Disc3 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading playlist...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No tracks match your search.
          </p>
        ) : (
          <ul className="max-w-3xl mx-auto divide-y divide-border rounded-lg border border-border overflow-hidden">
            {filtered.map((track) => (
              <li key={`${track.id}-${track.played_at}`}>
                <Link
                  to={`/track/${track.slug}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Music className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <time
                    dateTime={track.played_at}
                    className="text-xs text-muted-foreground flex-shrink-0"
                  >
                    {formatTime(track.played_at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Playlist;
