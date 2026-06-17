import { Play, Pause, X, Radio, Music, RotateCcw, RotateCw, ListMusic, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import stationLogo from '@/assets/dance-one-logo.png';

// Available episode numbers (must match AudioPlayerContext)
const AVAILABLE_EPISODES = [403, 402, 401, 400, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389];

const FloatingPlayer = () => {
  const {
    source,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    episodeInfo,
    streamTitle,
    albumArt,
    isVisible,
    autoplayEnabled,
    pause,
    resume,
    seek,
    closePlayer,
    toggleAutoplay,
  } = useAudioPlayer();

  if (!isVisible) return null;

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (source !== 'episode') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  // Get next episode number for autoplay indicator
  const getNextEpisodeNumber = () => {
    if (!episodeInfo?.number) return null;
    const currentIndex = AVAILABLE_EPISODES.indexOf(episodeInfo.number);
    if (currentIndex >= 0 && currentIndex < AVAILABLE_EPISODES.length - 1) {
      return AVAILABLE_EPISODES[currentIndex + 1];
    }
    return null;
  };

  const nextEpisodeNumber = getNextEpisodeNumber();

  const displayTitle = source === 'live' 
    ? streamTitle.replace(/🎵+\s*/g, '').trim() 
    : episodeInfo?.title || 'Unknown';

  const displayImage = albumArt || stationLogo;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary/20 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-3">
          {/* Album Art / Logo */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-primary/20">
            <img 
              src={displayImage} 
              alt="Now playing" 
              className="w-full h-full object-cover"
             loading="lazy" decoding="async"/>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {source === 'live' ? (
                <span className="flex items-center gap-1 text-xs text-neon">
                  <Radio className="w-3 h-3" />
                  <span className="animate-pulse">LIVE</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-neon-purple">
                  <Music className="w-3 h-3" />
                  <span>Episode {episodeInfo?.number}</span>
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-primary truncate">{displayTitle}</p>
            
            {/* Progress bar for episodes */}
            {source === 'episode' && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground w-12 tabular-nums">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-1.5 bg-primary/20 rounded-full cursor-pointer group relative"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-neon to-neon-purple rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  {/* Playhead indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neon rounded-full shadow-lg shadow-neon/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 tabular-nums text-right">{formatTime(duration)}</span>
                
                {/* Next Up indicator */}
                {autoplayEnabled && nextEpisodeNumber && (
                  <span className="flex items-center gap-1 text-[10px] text-neon/80 bg-neon/10 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    <SkipForward className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">Next:</span>
                    <span>#{nextEpisodeNumber}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Skip Back 20s (episodes only) */}
            {source === 'episode' && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-primary relative group"
                onClick={() => seek(Math.max(0, currentTime - 20))}
                title="Skip back 20 seconds"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="absolute -top-1 -left-1 text-[9px] font-bold text-neon-purple bg-background/80 rounded px-0.5">
                  20
                </span>
              </Button>
            )}

            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-gradient-to-br from-neon/20 to-neon-purple/20 border border-neon/30 rounded-full hover:from-neon/30 hover:to-neon-purple/30"
              onClick={handlePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-neon" />
              ) : (
                <Play className="w-5 h-5 text-neon" />
              )}
            </Button>

            {/* Skip Forward 20s (episodes only) */}
            {source === 'episode' && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-primary relative group"
                onClick={() => seek(Math.min(duration, currentTime + 20))}
                title="Skip forward 20 seconds"
              >
                <RotateCw className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-[9px] font-bold text-neon-purple bg-background/80 rounded px-0.5">
                  20
                </span>
              </Button>
            )}

            {/* Autoplay Toggle (episodes only) */}
            {source === 'episode' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`w-8 h-8 transition-colors ${
                        autoplayEnabled 
                          ? 'text-neon bg-neon/10 hover:bg-neon/20' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      onClick={toggleAutoplay}
                      title={autoplayEnabled ? 'Autoplay ON' : 'Autoplay OFF'}
                    >
                      <ListMusic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-['Rajdhani']">
                    <p>{autoplayEnabled ? 'Autoplay: ON - Next episode will play automatically' : 'Autoplay: OFF'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-destructive"
              onClick={closePlayer}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingPlayer;
