import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Clock } from 'lucide-react';
import {
  parseBroadcastDate,
  formatBroadcastDate,
  formatBroadcastWeekdayTime,
} from '@/lib/broadcastTime';
import type { Wh0Session } from '@/data/wh0Sessions';

interface Wh0SessionCardProps {
  show: Wh0Session;
}

const Wh0SessionCard = ({ show }: Wh0SessionCardProps) => {
  const navigate = useNavigate();
  const broadcastDate = parseBroadcastDate(show.broadcastDate);
  const isUpcoming = new Date() <= broadcastDate;
  const formattedDate = formatBroadcastDate(broadcastDate);

  const shareGuestShow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${show.link}`;
    const shareData = {
      title: `${show.title} - Dance One Radio`,
      text: `Listen to ${show.title} on Dance One Radio`,
      url,
    };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Episode link copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        alert('Episode link copied to clipboard!');
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  return (
    <Link to={show.link} className="block h-full">
      <Card className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group cursor-pointer hover:border-neon/50 h-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/images/wh0-plays-sessions-logo.jpg"
              alt={`Wh0 Plays Sessions Episode ${show.number}`}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
            />
            <div className={`bg-gradient-to-br ${isUpcoming ? 'from-neon to-neon-purple' : 'from-neon/60 to-neon-purple/60'} text-background rounded-full w-12 h-12 flex items-center justify-center font-['Orbitron'] font-bold text-base shrink-0`}>
              #{show.number}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-['Orbitron'] font-bold text-primary group-hover:text-neon transition-colors break-words mb-2">
                {show.title}
                <span className="inline-block ml-2 text-sm text-neon opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </h3>
              <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {isUpcoming ? (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-neon" />
                      <span>{formatBroadcastWeekdayTime(broadcastDate)}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Aired {formattedDate}</span>
                    </>
                  )}
                </div>
                <div className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {show.genres}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {show.guest ? (
                  <>Guest Mix by <span className="text-primary font-semibold">{show.guest}</span></>
                ) : (
                  show.blurb
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(show.link);
              }}
            >
              <Play className="w-4 h-4" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={shareGuestShow}
            >
              Share
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Wh0SessionCard;
