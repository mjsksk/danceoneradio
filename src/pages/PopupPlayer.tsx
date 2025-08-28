import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio, Volume2 } from 'lucide-react';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  console.log('🚀 POPUP: PopupPlayerPage mounted');
  
  // Use same stream URLs as the working main player
  const streamUrls = [
    'https://streams.radio.co/s2c3cc784b/listen',
    'https://radio.garden/api/ara/content/listen/eQXf2wN8/channel.mp3'
  ];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(20).fill(25));
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);

  const tryNextUrl = () => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const startVisualizer = useCallback(() => {
    let time = 0;
    
    const animate = () => {
      time += 0.1;
      const bars = Array.from({ length: 20 }, (_, i) => {
        const frequency = (i / 19) * 3;
        const height = 20 + Math.sin(time * (0.8 + frequency)) * 15 + Math.random() * 8;
        return Math.max(10, Math.min(50, height));
      });
      
      setFrequencyData(bars);
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [isPlaying]);

  const stopVisualizer = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(20).fill(25));
  }, []);

  const attemptPlay = async () => {
    if (!audioRef.current) {
      console.error('🚀 POPUP: No audio element');
      setError('Audio not available');
      setIsLoading(false);
      return;
    }

    const currentUrl = streamUrls[currentUrlIndex];
    console.log('🚀 POPUP: Attempting to play:', currentUrl);

    try {
      audioRef.current.src = currentUrl;
      audioRef.current.volume = 1;
      audioRef.current.muted = false;
      
      await audioRef.current.play();
      
      console.log('🚀 POPUP: ✅ Playback started');
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      
      // Start visualizer after a short delay
      setTimeout(startVisualizer, 300);
      
    } catch (err) {
      console.error(`🚀 POPUP: ❌ Failed to play stream ${currentUrl}:`, err);
      
      if (tryNextUrl()) {
        console.log('🚀 POPUP: Trying next URL...');
        setTimeout(attemptPlay, 1000);
      } else {
        console.error('🚀 POPUP: All stream URLs failed');
        setError('All streams unavailable');
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

  const handlePlay = useCallback(async () => {
    console.log('🚀 POPUP: Play button clicked');
    setIsLoading(true);
    setError(null);
    setCurrentUrlIndex(0); // Reset to first URL
    attemptPlay();
  }, [startVisualizer]);

  const handlePause = useCallback(() => {
    console.log('🚀 POPUP: Pausing...');
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsPlaying(false);
    stopVisualizer();
  }, [stopVisualizer]);

  const handlePlayPause = useCallback(() => {
    if (isLoading) return;
    
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, isLoading, handlePlay, handlePause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualizer();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [stopVisualizer]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-lg">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dance One Radio</h1>
          </div>
          <Badge variant={isPlaying ? "default" : "secondary"} className="text-sm">
            {isPlaying ? "LIVE" : "OFFLINE"}
          </Badge>
        </div>

        {/* Station Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
            <img
              src={stationLogo}
              alt="Dance One Radio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Now Playing */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
          <p className="font-medium">
            {isPlaying ? "Dance One Radio - Live Stream" : "Ready to Play"}
          </p>
        </div>

        {/* Audio Visualizer */}
        <div className="flex items-end justify-center gap-1 h-16 mb-6">
          {frequencyData.map((height, index) => (
            <div
              key={index}
              className="bg-primary rounded-sm transition-all duration-100"
              style={{
                height: `${height}px`,
                width: '4px',
                opacity: isPlaying ? 1 : 0.3,
                backgroundColor: `hsl(${280 + index * 3}, 70%, 60%)`,
                boxShadow: isPlaying ? `0 0 4px hsl(${280 + index * 3}, 70%, 60%)` : 'none'
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="rounded-full w-16 h-16 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          
          {isPlaying && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Streaming...</span>
            </div>
          )}
        </div>

        {/* Audio Element */}
        <audio 
          ref={audioRef}
          preload="none"
          onError={(e) => {
            console.error('🚀 POPUP: Audio error:', e.currentTarget.error);
            setError('Stream unavailable');
            setIsLoading(false);
            setIsPlaying(false);
            stopVisualizer();
          }}
          onPause={() => {
            console.log('🚀 POPUP: Audio paused');
            setIsPlaying(false);
            stopVisualizer();
          }}
          onPlay={() => {
            console.log('🚀 POPUP: Audio started');
            setIsPlaying(true);
          }}
          onLoadStart={() => {
            console.log('🚀 POPUP: Loading stream...');
          }}
          onCanPlay={() => {
            console.log('🚀 POPUP: Stream ready to play');
          }}
        />
      </div>
    </div>
  );
};

export default PopupPlayerPage;