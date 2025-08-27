import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { RadioStreamService } from '@/utils/RadioStreamService';
import stationLogo from '@/assets/dance-one-logo.png';

const PopupPlayerPage = () => {
  // Immediate logging to verify popup loads
  console.log('🚀 POPUP: PopupPlayerPage component rendering at:', new Date().toISOString());
  console.log('🚀 POPUP: Window location:', window.location.href);
  console.log('🚀 POPUP: User agent:', navigator.userAgent);
  
  // Get stream URLs from URL params or use defaults
  const urlParams = new URLSearchParams(window.location.search);
  console.log('🚀 POPUP: URL params:', urlParams.toString());
  
  const streamUrls = [
    'https://streams.radio.co/s2c3cc784b/listen',
    'https://radio.garden/api/ara/content/listen/eQXf2wN8/channel.mp3'
  ];
  console.log('🚀 POPUP: Stream URLs configured:', streamUrls);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(64).fill(20));
  const [currentStreamTitle, setCurrentStreamTitle] = useState('Dance One Radio - The Future of Dance Music');
  const [isStreamLive, setIsStreamLive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);

  const tryNextUrl = () => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const startFallbackAnimation = () => {
    console.log('🎵 Starting FREQUENCY-BASED animation');
    let time = 0;
    let frameCount = 0;
    
    // Create independent oscillators for different frequency ranges
    const bassOscillators = Array.from({ length: 16 }, (_, i) => ({
      frequency: 0.3 + i * 0.05, // Slow, bass-like patterns
      amplitude: 2.0 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    }));
    
    const midOscillators = Array.from({ length: 32 }, (_, i) => ({
      frequency: 0.8 + i * 0.1, // Mid-range patterns
      amplitude: 1.2 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2
    }));
    
    const trebleOscillators = Array.from({ length: 16 }, (_, i) => ({
      frequency: 2.0 + i * 0.3, // Fast, treble-like patterns
      amplitude: 0.8 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2
    }));
    
    const animateFallback = () => {
      time += 0.05; // Realistic timing
      frameCount++;
      
      // Calculate frequency-based heights for each bar
      const bars = Array.from({ length: 64 }, (_, i) => {
        const frequencyHz = (i / 63) * 22050; // Map to Hz range 0-22kHz
        let height = 25; // Base height
        
        // Bass frequencies (20-200 Hz) - bars 0-15
        if (i < 16) {
          const osc = bassOscillators[i];
          const bassResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const kickPattern = Math.pow(Math.sin(time * 0.5), 6) * 20; // Kick drum simulation
          height += bassResponse * 15 + kickPattern * (16 - i) / 16;
        }
        // Mid frequencies (200-2000 Hz) - bars 16-47
        else if (i < 48) {
          const midIndex = i - 16;
          const osc = midOscillators[midIndex];
          const midResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const snarePattern = Math.pow(Math.sin(time * 1.3 + Math.PI/3), 4) * 12; // Snare simulation
          const vocalPattern = Math.sin(time * 0.7 + midIndex * 0.1) * 8; // Vocal range simulation
          height += midResponse * 12 + snarePattern * (midIndex > 8 && midIndex < 24 ? 1 : 0.3) + vocalPattern;
        }
        // Treble frequencies (2000-22000 Hz) - bars 48-63
        else {
          const trebleIndex = i - 48;
          const osc = trebleOscillators[trebleIndex];
          const trebleResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const hihatPattern = Math.pow(Math.sin(time * 4 + trebleIndex * 0.5), 3) * 6; // Hi-hat simulation
          const sparklePattern = Math.sin(time * 2.5 + trebleIndex * 0.8) * 4; // High-end sparkle
          height += trebleResponse * 8 + hihatPattern + sparklePattern;
        }
        
        // Add musical decay and attack
        const envelope = Math.exp(-Math.abs(Math.sin(time * 1.5 + i * 0.1)) * 0.3) * 5;
        height += envelope;
        
        // Random variations to simulate natural music
        const randomNoise = (Math.random() - 0.5) * 3;
        height += randomNoise;
        
        return Math.max(20, Math.min(70, height));
      });

      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(animateFallback);
    };
    
    animateFallback();
  };

  const stopAudioAnalysis = () => {
    console.log('🎵 Stopping audio analysis');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(64).fill(20)); // Reset to base height
  };

  const handlePlayPause = () => {
    console.log('🚀 POPUP: Play/Pause button clicked, isPlaying:', isPlaying);
    
    if (!audioRef.current) {
      console.error('🚀 POPUP: ❌ Audio ref is null!');
      return;
    }
    
    if (isPlaying) {
      console.log('🚀 POPUP: Pausing audio');
      audioRef.current.pause();
      setIsPlaying(false);
      stopAudioAnalysis();
    } else {
      console.log('🚀 POPUP: ▶️ Starting playback process...');
      setIsLoading(true);
      setCurrentUrlIndex(0);
      attemptPlay();
    }
  };

  const attemptPlay = () => {
    if (!audioRef.current) {
      console.error('🚀 POPUP: Audio ref is null in attemptPlay');
      setIsLoading(false);
      return;
    }
    
    const currentUrl = streamUrls[currentUrlIndex];
    console.log('🚀 POPUP: Attempting stream:', currentUrl, 'at index:', currentUrlIndex);
    
    audioRef.current.src = currentUrl;
    audioRef.current.play().then(() => {
      console.log('🚀 POPUP: ✅ Audio started playing successfully');
      setIsPlaying(true);
      setIsLoading(false);
      
      // Start animation after successful playback
      setTimeout(() => {
        console.log('🚀 POPUP: Starting EQ animation');
        startFallbackAnimation();
      }, 500);
    }).catch(error => {
      console.error(`🚀 POPUP: ❌ Failed to play stream ${currentUrl}:`, error);
      
      if (tryNextUrl()) {
        console.log('🚀 POPUP: Trying next URL...');
        setTimeout(attemptPlay, 1000);
      } else {
        setIsLoading(false);
        setIsPlaying(false);
        console.error('🚀 POPUP: ❌ All stream URLs failed');
        // Remove alert - just log the error
      }
    });
  };

  const cleanTrackForSearch = (streamTitle: string): string => {
    const songMatch = streamTitle.match(/🎵+\s*(.*?)\s*🎵+/);
    const songTitle = songMatch ? songMatch[1] : streamTitle;

    return songTitle.replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/\(.*?extended.*?\)/gi, '')
    .replace(/\(.*?remix.*?\)/gi, '')
    .replace(/\(.*?edit.*?\)/gi, '')
    .replace(/\(.*?mix.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/vs\..*$/gi, '')
    .replace(/\d{4}$/, '')
    .replace(/[^\w\s&'-]/g, '').replace(/Dance One Radio.*$/gi, '')
    .trim();
  };

  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!currentStreamTitle || currentStreamTitle.includes('Dance One Radio - The Future')) return;
      setIsLoadingArt(true);
      try {
        const cleanedQuery = cleanTrackForSearch(currentStreamTitle);
        const result = await AlbumArtService.getAlbumArt(cleanedQuery);
        if (result.imageUrl) {
          setAlbumArt(result.imageUrl);
        } else {
          setAlbumArt(null);
        }
      } catch (error) {
        console.error('Error fetching album art:', error);
        setAlbumArt(null);
      } finally {
        setIsLoadingArt(false);
      }
    };
    fetchAlbumArt();
  }, [currentStreamTitle]);

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
    const interval = setInterval(fetchStreamMetadata, 2000);
    
    return () => clearInterval(interval);
  }, [currentStreamTitle]);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
    };
  }, []);


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-cyber p-8 w-full max-w-lg relative overflow-hidden">
        {/* Background blur */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={albumArt || stationLogo}
            alt=""
            className="w-full h-full object-cover blur-xl scale-110"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Dance One Radio</span>
              </div>
              <Badge 
                variant={isStreamLive && isPlaying ? "default" : "secondary"}
                className={`font-mono text-xs ${
                  isStreamLive && isPlaying 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isStreamLive && isPlaying ? "LIVE" : "OFFLINE"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Pop-up Player</p>
          </div>

          {/* Album art and info */}
          <div className="text-center space-y-4">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted mx-auto">
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

            <div>
              <div className="text-xs text-muted-foreground mb-1">Now Playing</div>
              <div className="font-audiowide text-sm leading-tight px-4">
                <div className="whitespace-nowrap animate-scroll-x">
                  {currentStreamTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="flex items-end justify-center gap-1 h-20 px-4" data-eq-container>
            {frequencyData.map((height, index) => {
              const frequencyPosition = index / 63;
              let hue, saturation, lightness;
              
              if (frequencyPosition < 0.25) {
                hue = 0 + frequencyPosition * 60;
                saturation = 85;
                lightness = 45;
              } else if (frequencyPosition < 0.5) {
                const local = (frequencyPosition - 0.25) / 0.25;
                hue = 15 + local * 45;
                saturation = 80;
                lightness = 50;
              } else if (frequencyPosition < 0.75) {
                const local = (frequencyPosition - 0.5) / 0.25;
                hue = 60 + local * 120;
                saturation = 75;
                lightness = 55;
              } else {
                const local = (frequencyPosition - 0.75) / 0.25;
                hue = 180 + local * 120;
                saturation = 70;
                lightness = 60;
              }

              return (
                <div
                  key={index}
                  className="bg-primary/80 rounded-sm transition-none"
                  style={{
                    height: `${height}px`,
                    width: '2px',
                    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                    boxShadow: `0 0 4px hsl(${hue}, ${saturation}%, ${lightness}%)`
                  }}
                  data-eq-bar
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              size="lg"
              className="rounded-full w-20 h-20 text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-current border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>
        </div>

        <audio 
          ref={audioRef} 
          preload="none" 
          crossOrigin="anonymous"
          onError={(e) => {
            const error = e.currentTarget.error;
            console.error('🚀 POPUP: ❌ AUDIO ERROR:', {
              code: error?.code,
              message: error?.message
            });
            stopAudioAnalysis();
            if (tryNextUrl()) {
              setTimeout(attemptPlay, 1000);
            } else {
              setIsLoading(false);
              setIsPlaying(false);
            }
          }}
          onPause={() => {
            console.log('🚀 POPUP: ⏸️ Audio PAUSED');
            setIsPlaying(false);
            stopAudioAnalysis();
          }} 
          onPlay={() => {
            console.log('🚀 POPUP: ▶️ Audio PLAY event fired');
            setIsPlaying(true);
          }}
        />
      </div>
    </div>
  );
};

export default PopupPlayerPage;