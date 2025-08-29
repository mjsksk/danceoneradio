import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamUrl = 'https://streams.radio.co/s2c3cc784b/listen';

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setError(null);
      
      try {
        audioRef.current.src = streamUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play:', err);
        setError('Unable to connect to stream');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 w-full max-w-sm space-y-6 text-center">
        {/* Header */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-5 w-5 text-primary" />
            <span className="font-bold">Dance One Radio</span>
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Pop-up Player</p>
        </div>

        {/* Logo */}
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted mx-auto">
          <img
            src={stationLogo}
            alt="Dance One Radio"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Now Playing */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Now Playing</div>
          <div className="font-medium">
            {isPlaying ? "Dance One Radio - Live Stream" : "Ready to Play"}
          </div>
        </div>

        {/* Play Button */}
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

        {/* Error Display */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Audio Element */}
        <audio 
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setError('Stream connection failed');
            setIsLoading(false);
            setIsPlaying(false);
          }}
        />
      </div>
    </div>
  );
};

export default PopupPlayerPage;