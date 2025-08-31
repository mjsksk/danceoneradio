import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Radio, Play, Pause, X, Minimize2, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import stationLogo from '@/assets/dance-one-logo.png';

interface PopupPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopupPlayer = ({ isOpen, onClose }: PopupPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  const streamUrl = 'https://streams.radio.co/s2c3cc784b/listen';

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.volume = volume[0] / 100;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Player */}
      <Card
        ref={playerRef}
        className={`fixed z-[60] bg-card border-2 border-primary/20 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-64 h-16' : 'w-96 h-auto'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden">
              <img
                src={stationLogo}
                alt="Dance One Radio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Dance One Radio</span>
              <Badge variant={isPlaying ? "default" : "secondary"} className="text-xs w-fit">
                {isPlaying ? "LIVE" : "READY"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 space-y-4">
            {/* Now Playing */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Now Playing</div>
              <div className="text-lg font-semibold truncate">
                🎵 Electronic Dance Music
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePlay}
                disabled={isLoading}
                size="lg"
                className="rounded-full w-14 h-14"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">{volume[0]}%</span>
            </div>

            {/* Radio.co Embedded Player */}
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src="https://www.radio.co/player/embed/s2c3cc784b"
                frameBorder="0"
                className="w-full h-24"
                allow="autoplay"
                title="Dance One Radio Player"
              />
            </div>
          </div>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Dance One Radio</span>
            </div>
            <Button
              onClick={handlePlay}
              disabled={isLoading}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      >
        <source src={streamUrl} type="audio/mpeg" />
      </audio>
    </>
  );
};

export default PopupPlayer;