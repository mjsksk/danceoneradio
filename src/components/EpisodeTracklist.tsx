import { Card } from '@/components/ui/card';
import { useShowTracks } from '@/hooks/useShowTracks';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, ShoppingCart, Music, Headphones } from 'lucide-react';

interface EpisodeTracklistProps {
  episodeNumber: number;
}

const EpisodeTracklist = ({ episodeNumber }: EpisodeTracklistProps) => {
  const { tracks, loading } = useShowTracks(episodeNumber);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-['Orbitron'] font-bold mb-8 text-center">
            <span className="text-neon-purple">Track Listing</span>
          </h2>

          <div className="grid gap-3">
            {tracks.map((track) => {
              const query = encodeURIComponent(`${track.artist} ${track.title}`);
              const amazonUrl = track.amazon_url || `https://www.amazon.com/s?k=${query}&tag=danceone-20`;
              const beatportUrl = track.beatport_url || `https://www.beatport.com/search?q=${query}`;
              const hasLinks = track.artist && track.title;

              return (
                <Card key={track.id} className="card-cyber p-2 sm:p-4 hover:scale-[1.01] transition-all duration-200 group">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center text-neon font-['Orbitron'] font-bold text-xs sm:text-sm shrink-0 mt-1">
                      {track.track_order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-neon transition-colors break-words sm:truncate">
                        {track.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words sm:truncate">
                        {track.artist}
                      </p>

                      {track.played_at && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                          Played at {new Date(track.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}

                      {/* Mobile affiliate links */}
                      {hasLinks && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                          <a
                            href={amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_18px_hsl(var(--primary)/0.5)] transition-all"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Amazon
                          </a>
                          <a
                            href={beatportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-primary/30 text-primary/80 hover:text-primary hover:border-primary/60 transition-all"
                          >
                            <Music className="w-3 h-3" />
                            Beatport
                          </a>
                          {track.apple_music_url && (
                            <a
                              href={track.apple_music_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-pink-500/30 text-pink-400/80 hover:text-pink-400 hover:border-pink-500/60 transition-all"
                            >
                              <Headphones className="w-3 h-3" />
                              Apple Music
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Desktop affiliate links */}
                    {hasLinks && (
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                        <a
                          href={amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Buy on Amazon"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_18px_hsl(var(--primary)/0.5)] transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Amazon
                        </a>
                        <a
                          href={beatportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open on Beatport"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-primary/30 text-primary/80 hover:text-primary hover:border-primary/60 transition-all"
                        >
                          <Music className="w-3.5 h-3.5" />
                          Beatport
                        </a>
                        {track.apple_music_url && (
                          <a
                            href={track.apple_music_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Listen on Apple Music"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-pink-500/30 text-pink-400/80 hover:text-pink-400 hover:border-pink-500/60 transition-all"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            Apple Music
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EpisodeTracklist;
