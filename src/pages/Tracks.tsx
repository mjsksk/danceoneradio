import { Link } from 'react-router-dom';
import { useRecentTracks } from '@/hooks/useTrackPage';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Disc3, Music, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Tracks = () => {
  const { data: tracks, isLoading } = useRecentTracks(50);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Track Discovery | Dance One Radio – Recently Played Electronic Music"
        description="Browse recently played tracks on Dance One Radio. Discover new electronic, house, trance, and EDM music streamed 24/7."
        url="https://danceoneradio.com/tracks"
        keywords="recently played tracks, electronic music discovery, dance music, EDM tracks, house music, trance"
      />

      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Tracks</span>
        </nav>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-4">
            <span className="text-neon">TRACK</span>{' '}
            <span className="text-neon-purple">DISCOVERY</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the latest tracks played on Dance One Radio. Every track links to streaming platforms where you can listen, buy, and discover more.
          </p>
          <p className="text-muted-foreground mt-3">
            Looking for a song you just heard? Check the{' '}
            <Link to="/playlist" className="text-primary hover:underline">live playlist from the last 24 hours</Link>.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Disc3 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tracks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks?.map((track, index) => (
              <Link
                key={track.slug}
                to={`/track/${track.slug}`}
                className="card-cyber p-5 hover:border-primary/50 transition-all duration-300 block group animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>
                    {track.genre && (
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border border-primary/20 text-primary/70">
                        {track.genre}
                      </span>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {format(new Date(track.played_at), 'MMM d · h:mm a')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Tracks;
