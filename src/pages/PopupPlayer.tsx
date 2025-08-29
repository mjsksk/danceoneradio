import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  console.log('🚀 POPUP: Component mounted');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Try multiple stream URLs like the working player
  const streamUrls = [
    'https://streams.radio.co/s2c3cc784b/listen',
    'https://radio.garden/api/ara/content/listen/eQXf2wN8/channel.mp3'
  ];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const tryNextStream = () => {
    console.log('🚀 POPUP: Trying next stream, current index:', currentUrlIndex);
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const handlePlayPause = async () => {
    console.log('🚀 POPUP: Play/Pause clicked, isPlaying:', isPlaying);
    
    if (!audioRef.current) {
      console.error('🚀 POPUP: No audio ref');
      return;
    }
    
    if (isPlaying) {
      console.log('🚀 POPUP: Pausing audio');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('🚀 POPUP: Starting playback');
      setIsLoading(true);
      setError(null);
      setCurrentUrlIndex(0); // Reset to first URL
      await attemptPlay();
    }
  };

  const attemptPlay = async () => {
    if (!audioRef.current) return;
    
    const currentUrl = streamUrls[currentUrlIndex];
    console.log('🚀 POPUP: Attempting to play URL:', currentUrl, 'index:', currentUrlIndex);
    
    try {
      // Clear any previous source
      audioRef.current.src = '';
      audioRef.current.load();
      
      // Set new source
      audioRef.current.src = currentUrl;
      audioRef.current.load();
      
      console.log('🚀 POPUP: Calling play()...');
      await audioRef.current.play();
      
      console.log('🚀 POPUP: ✅ Play successful!');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('🚀 POPUP: ❌ Play failed:', err);
      
      if (tryNextStream()) {
        console.log('🚀 POPUP: Trying next URL in 1 second...');
        setTimeout(() => attemptPlay(), 1000);
      } else {
        console.error('🚀 POPUP: All streams failed');
        setError('Unable to connect to stream');
        setIsLoading(false);
        setIsPlaying(false);
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
          preload="none"
          crossOrigin="anonymous"
          onPlay={() => {
            console.log('🚀 POPUP: Audio onPlay event');
            setIsPlaying(true);
            setError(null);
          }}
          onPause={() => {
            console.log('🚀 POPUP: Audio onPause event');
            setIsPlaying(false);
          }}
          onError={(e) => {
            console.error('🚀 POPUP: Audio onError event:', e);
            setError('Stream connection failed');
            setIsLoading(false);
            setIsPlaying(false);
          }}
          onLoadStart={() => console.log('🚀 POPUP: Audio loadstart')}
          onCanPlay={() => console.log('🚀 POPUP: Audio canplay')}
          onCanPlayThrough={() => console.log('🚀 POPUP: Audio canplaythrough')}
          onLoadedData={() => console.log('🚀 POPUP: Audio loadeddata')}
        />
      </div>
    </div>
  );
};

export default PopupPlayerPage;