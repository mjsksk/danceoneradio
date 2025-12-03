import { Play, Pause, X, Radio, Music, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useState } from 'react';
import stationLogo from '@/assets/dance-one-logo.png';

const FloatingPlayer = () => {
  const {
    source,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    episodeInfo,
    streamTitle,
    albumArt,
    isVisible,
    pause,
    resume,
    seek,
    setVolume,
    closePlayer,
  } = useAudioPlayer();

  const [showVolume, setShowVolume] = useState(false);

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
            />
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
                <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-1 bg-primary/20 rounded-full cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-neon to-neon-purple rounded-full transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Volume control */}
            <div className="relative hidden sm:flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setShowVolume(!showVolume)}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              {showVolume && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-background border border-primary/20 rounded-lg shadow-lg">
                  <Slider
                    orientation="vertical"
                    value={[volume * 100]}
                    onValueChange={([val]) => setVolume(val / 100)}
                    max={100}
                    step={1}
                    className="h-20"
                  />
                </div>
              )}
            </div>

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
