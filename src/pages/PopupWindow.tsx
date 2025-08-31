import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupWindow = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('🎵 Dance One Radio - Live Electronic Music');

  const streamUrl = 'http://s9.myradiostream.com:14296/';

  // Audio controls
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error controlling audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!audioRef.current) return;
    const volumeValue = newVolume / 100;
    audioRef.current.volume = volumeValue;
    setVolume(volumeValue);
  };

  // Audio event handlers
  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);
  const handleAudioError = (e: any) => {
    console.error('Audio error:', e);
    setIsPlaying(false);
    setIsLoading(false);
  };

  // Set window title
  useEffect(() => {
    document.title = `🎵 ${currentTrack} - Dance One Radio`;
  }, [currentTrack]);

  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [volume]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <Card className="max-w-md mx-auto mt-8 overflow-hidden shadow-2xl border-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/90 to-accent/90 p-4 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/20 p-1">
              <img
                src={stationLogo}
                alt="Dance One Radio"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Dance One Radio</h1>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  LIVE
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Radio Player
                </Badge>
              </div>
            </div>
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Now Playing */}
        <div className="p-4 border-b bg-muted/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Now Playing</div>
            <div className="text-sm font-medium line-clamp-2 h-10 flex items-center justify-center">
              {currentTrack}
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-6">
          <audio
            ref={audioRef}
            src={streamUrl}
            preload="none"
            crossOrigin="anonymous"
          />
          
          {/* Player Controls */}
          <div className="space-y-4">
            {/* Play/Pause Button */}
            <div className="flex justify-center">
              <Button
                onClick={togglePlay}
                disabled={isLoading}
                size="lg"
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Stream Info */}
          <div className="text-xs text-center text-muted-foreground mt-4 space-y-1">
            <div>Live Stream: {streamUrl}</div>
            <div>Click play to start listening</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PopupWindow;