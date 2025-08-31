import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Radio, Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import stationLogo from '@/assets/dance-one-logo.png';
import { RadioStreamService } from '@/utils/RadioStreamService';

const PopupWindow = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('🎵 Dance One Radio - Live Electronic Music');
  const [currentPlayer, setCurrentPlayer] = useState<'radio-co' | 'html5'>('radio-co');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const streamUrl = 'https://streams.radio.co/s2c3cc784b/listen';

  // Fetch stream metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setCurrentTrack(formattedTitle);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 3000);
    return () => clearInterval(interval);
  }, []);

  // Set window title
  useEffect(() => {
    document.title = isPlaying ? `🎵 ${currentTrack}` : 'Dance One Radio - Popup Player';
  }, [currentTrack, isPlaying]);

  // Audio volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    if (currentPlayer === 'radio-co') {
      // Radio.co player handles its own play/pause
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) return;
    
    setIsLoading(true);
    setError(null);
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
      setError('Playback failed. Try switching players.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchPlayer = () => {
    setError(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentPlayer(currentPlayer === 'radio-co' ? 'html5' : 'radio-co');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
                <Badge variant={isPlaying ? "default" : "secondary"} className="text-xs">
                  {isPlaying ? "LIVE" : "READY"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentPlayer === 'radio-co' ? 'Radio.co' : 'HTML5'}
                </Badge>
              </div>
            </div>
            <Radio className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
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

        {/* Player Content */}
        <div className="p-4 space-y-4">
          {/* Radio.co Player */}
          {currentPlayer === 'radio-co' && (
            <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted/10">
              <iframe
                src="https://www.radio.co/player/embed/s2c3cc784b"
                frameBorder="0"
                className="w-full h-32"
                allow="autoplay"
                title="Dance One Radio Player"
              />
            </div>
          )}

          {/* HTML5 Player */}
          {currentPlayer === 'html5' && (
            <div className="space-y-3">
              <audio
                ref={audioRef}
                controls
                className="w-full"
                preload="none"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setError('Stream connection failed')}
              >
                <source src={streamUrl} type="audio/mpeg" />
              </audio>
              
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
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {currentPlayer === 'html5' && (
              <Button
                onClick={handlePlayPause}
                disabled={isLoading}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
            )}

            <Button
              onClick={switchPlayer}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Switch Player
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
            <div>Radio.co player has built-in controls</div>
            <div>Switch to HTML5 for manual volume control</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PopupWindow;