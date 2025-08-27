import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { RadioStreamService } from '@/utils/RadioStreamService';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  console.log('🚀 POPUP: PopupPlayerPage component loaded');
  
  const streamUrls = [
    'https://streams.radio.co/s2c3cc784b/listen',
    'https://radio.garden/api/ara/content/listen/eQXf2wN8/channel.mp3'
  ];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [currentStreamTitle, setCurrentStreamTitle] = useState('Dance One Radio - The Future of Dance Music');
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(32).fill(25));
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);

  const tryNextUrl = () => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const startVisualizer = () => {
    let time = 0;
    
    const animate = () => {
      time += 0.05;
      
      const bars = Array.from({ length: 32 }, (_, i) => {
        const frequency = (i / 31) * 3; // 0 to 3
        const height = 25 + Math.sin(time * (0.5 + frequency)) * 15 + Math.random() * 10;
        return Math.max(15, Math.min(60, height));
      });
      
      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const stopVisualizer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(32).fill(25));
  };

  const attemptPlay = () => {
    if (!audioRef.current) {
      console.log('🚀 POPUP: No audio ref available');
      setIsLoading(false);
      return;
    }
    
    const currentUrl = streamUrls[currentUrlIndex];
    console.log('🚀 POPUP: Attempting to play:', currentUrl);
    
    audioRef.current.src = currentUrl;
    audioRef.current.play().then(() => {
      console.log('🚀 POPUP: ✅ Audio started playing successfully');
      setIsPlaying(true);
      setIsLoading(false);
      
      // Start animation with delay like the working player
      setTimeout(() => {
        console.log('🚀 POPUP: Starting EQ animation');
        startVisualizer();
      }, 500);
    }).catch(error => {
      console.error(`🚀 POPUP: ❌ Failed to play stream ${currentUrl}:`, error);
      if (tryNextUrl()) {
        console.log('🚀 POPUP: Trying next URL...');
        setTimeout(attemptPlay, 1000); // Try next URL after 1 second
      } else {
        console.error('🚀 POPUP: All stream URLs failed');
        setIsLoading(false);
        setIsPlaying(false);
      }
    });
  };

  const handlePlayPause = () => {
    console.log('🚀 POPUP: Play/Pause clicked, isPlaying:', isPlaying);
    
    if (!audioRef.current) {
      console.error('🚀 POPUP: No audio element found');
      return;
    }
    
    if (isPlaying) {
      console.log('🚀 POPUP: Pausing');
      audioRef.current.pause();
      setIsPlaying(false);
      stopVisualizer();
    } else {
      console.log('🚀 POPUP: Starting playback');
      setIsLoading(true);
      setCurrentUrlIndex(0);
      attemptPlay();
    }
  };

  const cleanTrackForSearch = (streamTitle: string): string => {
    const songMatch = streamTitle.match(/🎵+\s*(.*?)\s*🎵+/);
    const songTitle = songMatch ? songMatch[1] : streamTitle;

    return songTitle
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/\(.*?extended.*?\)/gi, '')
      .replace(/\(.*?remix.*?\)/gi, '')
      .replace(/\(.*?edit.*?\)/gi, '')
      .replace(/\(.*?mix.*?\)/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/feat\..*$/gi, '')
      .replace(/ft\..*$/gi, '')
      .replace(/vs\..*$/gi, '')
      .replace(/\d{4}$/, '')
      .replace(/[^\w\s&'-]/g, '')
      .replace(/Dance One Radio.*$/gi, '')
      .trim();
  };

  // Fetch album art when stream title changes
  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!currentStreamTitle || currentStreamTitle.includes('Dance One Radio - The Future')) return;
      
      setIsLoadingArt(true);
      try {
        const cleanedQuery = cleanTrackForSearch(currentStreamTitle);
        const result = await AlbumArtService.getAlbumArt(cleanedQuery);
        setAlbumArt(result.imageUrl || null);
      } catch (error) {
        console.error('Error fetching album art:', error);
        setAlbumArt(null);
      } finally {
        setIsLoadingArt(false);
      }
    };
    
    fetchAlbumArt();
  }, [currentStreamTitle]);

  // Fetch stream metadata
  useEffect(() => {
    const fetchStreamMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const streamIsLive = metadata && metadata.title && !metadata.title.includes('Dance One Radio - The Future');
        setIsStreamLive(streamIsLive);
        
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        if (formattedTitle !== currentStreamTitle) {
          setCurrentStreamTitle(formattedTitle);
        }
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
        setIsStreamLive(false);
      }
    };

    fetchStreamMetadata();
    const interval = setInterval(fetchStreamMetadata, 5000);
    
    return () => clearInterval(interval);
  }, [currentStreamTitle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualizer();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-cyber p-6 w-full max-w-sm relative overflow-hidden">
        {/* Background blur */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={albumArt || stationLogo}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-6 text-center">
          {/* Header */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Radio className="h-5 w-5 text-primary" />
              <span className="font-bold">Dance One Radio</span>
              <Badge 
                variant={isStreamLive && isPlaying ? "default" : "secondary"}
                className={`text-xs ${
                  isStreamLive && isPlaying 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isStreamLive && isPlaying ? "LIVE" : "OFFLINE"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Pop-up Player</p>
          </div>

          {/* Album art */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted mx-auto">
            {isLoadingArt ? (
              <div className="w-full h-full animate-pulse bg-muted-foreground/20" />
            ) : (
              <img
                src={albumArt || stationLogo}
                alt="Album art"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Now playing */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Now Playing</div>
            <div className="font-audiowide text-xs leading-tight px-2">
              <div className="truncate">
                {currentStreamTitle}
              </div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="flex items-end justify-center gap-1 h-12">
            {frequencyData.map((height, index) => (
              <div
                key={index}
                className="bg-primary/80 rounded-sm transition-none"
                style={{
                  height: `${height}px`,
                  width: '3px',
                  backgroundColor: `hsl(${280 + index * 2}, 70%, 60%)`,
                  boxShadow: `0 0 4px hsl(${280 + index * 2}, 70%, 60%)`
                }}
              />
            ))}
          </div>

          {/* Play button */}
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
        </div>

        {/* Audio element */}
        <audio 
          ref={audioRef} 
          preload="none" 
          crossOrigin="anonymous"
          onError={(e) => {
            const error = e.currentTarget.error;
            console.error('🚀 POPUP: Audio error:', error?.code, error?.message);
            stopVisualizer();
            if (tryNextUrl()) {
              setTimeout(attemptPlay, 1000);
            } else {
              setIsLoading(false);
              setIsPlaying(false);
            }
          }} 
          onPause={() => {
            console.log('🚀 POPUP: Audio paused');
            setIsPlaying(false);
            stopVisualizer();
          }} 
          onPlay={() => {
            console.log('🚀 POPUP: Audio playing');
            setIsPlaying(true);
          }}
        />
      </div>
    </div>
  );
};

export default PopupPlayerPage;