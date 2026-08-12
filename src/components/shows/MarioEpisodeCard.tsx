import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, ExternalLink, Calendar, Clock } from 'lucide-react';
import { formatBroadcastDate } from '@/lib/broadcastTime';

export interface MarioEpisode {
  title: string;
  description: string;
  pubDate: string;
  enclosure: { url: string; type: string };
  duration?: string;
  guid: string;
  episodeNumber?: number;
}

interface MarioEpisodeCardProps {
  episode: MarioEpisode;
  episodeNumber: number;
  hasDedicatedPage: boolean;
  isPlaying: boolean;
  onPlayPause: (episode: MarioEpisode) => void;
  onShare: (episode: MarioEpisode, episodeNumber: number) => void;
}

const MarioEpisodeCard = ({
  episode,
  episodeNumber,
  hasDedicatedPage,
  isPlaying,
  onPlayPause,
  onShare,
}: MarioEpisodeCardProps) => {
  const navigate = useNavigate();

  const cardContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <img
          src="/lovable-uploads/mario-show.jpg"
          alt="Future Dance Anthems with Mario"
          loading="lazy"
          decoding="async"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
        />
        <div className="bg-gradient-to-br from-neon to-neon-purple text-background rounded-full w-12 h-12 flex items-center justify-center font-['Orbitron'] font-bold text-base shrink-0">
          #{episodeNumber}
        </div>
        <div className="flex-1 min-w-0" id={`episode-${episodeNumber}`}>
          <h3 className={`text-lg md:text-xl font-['Orbitron'] font-bold mb-2 text-primary transition-colors break-words ${hasDedicatedPage ? 'group-hover:text-neon cursor-pointer' : ''}`}>
            {episode.title}
            {hasDedicatedPage && (
              <span className="inline-block ml-2 text-sm text-neon opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neon" />
              <span>
                {formatBroadcastDate(episode.pubDate, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            {episode.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neon-purple" />
                <span>{episode.duration}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {episode.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {episode.enclosure.url && (
          <Button
            size="sm"
            className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlayPause(episode);
            }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open('https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478', '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Apple
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare(episode, episodeNumber);
          }}
        >
          Share
        </Button>
      </div>
    </div>
  );

  if (hasDedicatedPage) {
    return (
      <Card
        role="link"
        tabIndex={0}
        onClick={() => navigate(`/episode/${episode.episodeNumber}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/episode/${episode.episodeNumber}`);
          }
        }}
        className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group cursor-pointer hover:border-neon/50 h-full"
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group h-full">
      {cardContent}
    </Card>
  );
};

export default MarioEpisodeCard;
