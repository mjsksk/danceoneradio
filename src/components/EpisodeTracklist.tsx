import { Card } from '@/components/ui/card';
import { useShowTracks } from '@/hooks/useShowTracks';
import { Skeleton } from '@/components/ui/skeleton';
import TrackAffiliateLinks from '@/components/TrackAffiliateLinks';

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
    <section className="py-6 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-['Orbitron'] font-bold mb-4 sm:mb-8 text-center">
            <span className="text-neon-purple">Track Listing</span>
          </h2>

          <div className="grid gap-3">
            {tracks.map((track) => (
              <Card key={track.id} className="card-cyber p-2 sm:p-4 hover:scale-[1.01] transition-all duration-200 group">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full flex items-center justify-center text-neon font-['Orbitron'] font-bold text-xs sm:text-sm shrink-0">
                    {track.track_order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-neon transition-colors break-words sm:truncate">
                      {track.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words sm:truncate">
                      {track.artist}
                    </p>
                    <div className="sm:hidden">
                      <TrackAffiliateLinks title={track.title} artist={track.artist} variant="mobile" />
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <TrackAffiliateLinks title={track.title} artist={track.artist} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EpisodeTracklist;
