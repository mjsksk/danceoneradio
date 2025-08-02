import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import stationLogo from '@/assets/dance-one-logo.png';

interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
}

const LiveRadioPlayer = ({ streamUrls, streamTitle }: LiveRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(8).fill(0));
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  const tryNextUrl = () => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const setupAudioAnalysis = () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      console.log('Setting up audio analysis...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed');
        });
      }
      
      const analyser = audioContext.createAnalyser();
      
      try {
        const source = audioContext.createMediaElementSource(audioRef.current);
        console.log('Media element source created successfully');
        
        analyser.fftSize = 64; // This gives us 32 frequency bins, we'll use 8
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        
        console.log('Audio analysis setup complete');
        startAudioAnalysis();
      } catch (sourceError) {
        console.warn('Failed to create media element source (likely CORS issue):', sourceError);
        // Fallback to animated visualization
        startFallbackAnimation();
      }
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
      // Fallback to animated visualization
      startFallbackAnimation();
    }
  };

  const startAudioAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const updateFrequencyData = () => {
      if (!analyserRef.current || !dataArrayRef.current || !isPlaying) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Group frequency data into 8 bars (we have 32 bins, so group by 4)
      const bars = [];
      const binsPerBar = Math.floor(dataArrayRef.current.length / 8);
      
      for (let i = 0; i < 8; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArrayRef.current[i * binsPerBar + j];
        }
        const average = sum / binsPerBar;
        // Normalize to 20-60 pixel range for visual appeal
        bars.push(Math.max(20, (average / 255) * 40 + 20));
      }
      
      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  };

  const startFallbackAnimation = () => {
    console.log('Starting fallback animation');
    const animateFallback = () => {
      if (!isPlaying) return;
      
      // Create animated bars when real audio analysis isn't available
      const bars = Array.from({ length: 8 }, (_, i) => {
        const baseHeight = 25;
        const variation = Math.sin(Date.now() * 0.01 + i * 0.5) * 15;
        const randomVariation = Math.random() * 10;
        return Math.max(20, baseHeight + variation + randomVariation);
      });
      
      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(animateFallback);
    };
    
    animateFallback();
  };

  const stopAudioAnalysis = () => {
    console.log('Stopping audio analysis');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(8).fill(20)); // Reset to minimum height
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopAudioAnalysis();
    } else {
      setIsLoading(true);
      setCurrentUrlIndex(0); // Reset to first URL
      attemptPlay();
    }
  };

  // Fetch album art when stream title changes
  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!streamTitle || streamTitle.includes('Dance One Radio - The Future')) return;
      
      setIsLoadingArt(true);
      try {
        // Extract song title from the formatted stream title
        const songMatch = streamTitle.match(/🎵\s*(.*?)\s*🎵/);
        const songTitle = songMatch ? songMatch[1] : streamTitle;
        
        const result = await AlbumArtService.getAlbumArt(songTitle);
        setAlbumArt(result.imageUrl);
      } catch (error) {
        console.error('Error fetching album art:', error);
      } finally {
        setIsLoadingArt(false);
      }
    };

    fetchAlbumArt();
  }, [streamTitle]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const attemptPlay = () => {
    if (!audioRef.current) return;
    
    const currentUrl = streamUrls[currentUrlIndex];
    audioRef.current.src = currentUrl;
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        
        console.log('Audio started playing, setting up analysis...');
        // Set up audio analysis after successful play
        setTimeout(() => {
          setupAudioAnalysis();
        }, 2000); // Wait a bit longer for audio to stabilize
      })
      .catch((error) => {
        console.error(`Failed to play stream ${currentUrl}:`, error);
        if (tryNextUrl()) {
          setTimeout(attemptPlay, 1000); // Try next URL after 1 second
        } else {
          setIsLoading(false);
          console.error('All stream URLs failed');
        }
      });
  };

  return (
    <div className="card-cyber p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Blurred background from album art or station logo */}
      {albumArt ? (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110"
          style={{ backgroundImage: `url(${albumArt})` }}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110"
          style={{ backgroundImage: `url(${stationLogo})` }}
        />
      )}
      {/* Content overlay */}
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-40 h-40 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center pulse-cyber overflow-hidden">
            {albumArt ? (
              <img 
                src={albumArt} 
                alt="Current Track Album Art" 
                className="w-full h-full object-cover rounded-lg"
                onError={() => setAlbumArt(null)}
              />
            ) : (
              <img 
                src={stationLogo} 
                alt="Dance One Radio Logo" 
                className="w-24 h-24 object-contain filter brightness-0 invert"
                onError={(e) => {
                  // If station logo fails to load, fallback to Radio icon
                  e.currentTarget.style.display = 'none';
                  const radioIcon = e.currentTarget.nextElementSibling as HTMLElement;
                  if (radioIcon) radioIcon.style.display = 'block';
                }}
              />
            )}
            {/* Fallback radio icon - hidden by default */}
            <Radio 
              className="w-20 h-20 text-primary-foreground hidden" 
              style={{ display: albumArt ? 'none' : 'none' }}
            />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-glow-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-['Orbitron'] font-semibold text-primary mb-2">NOW PLAYING</h3>
        <div className="relative overflow-hidden bg-background/20 rounded-md p-2 mb-2">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-sm text-foreground font-['Rajdhani'] font-medium">
              {streamTitle}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Broadcasting Live 24/7</p>
      </div>

      {/* Real-time Audio EQ Visualizer */}
      <div className="flex items-center justify-center space-x-1 mb-6">
        {frequencyData.map((height, i) => (
          <div
            key={i}
            className="w-2 bg-primary rounded-full transition-all duration-100 ease-out"
            style={{
              height: `${Math.max(20, Math.min(60, height))}px`,
              backgroundColor: isPlaying 
                ? `hsl(${180 + (height / 60) * 60}, 70%, ${50 + (height / 60) * 20}%)` 
                : 'hsl(var(--muted))',
              boxShadow: isPlaying ? `0 0 ${height / 10}px hsl(${180 + (height / 60) * 60}, 70%, ${50 + (height / 60) * 20}%)` : 'none'
            }}
          />
        ))}
      </div>

      <Button
        onClick={handlePlayPause}
        className="btn-cyber w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            LOADING...
          </>
        ) : isPlaying ? (
          <>
            <Pause className="w-5 h-5 mr-2" />
            PAUSE STREAM
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            LISTEN LIVE
          </>
        )}
      </Button>

      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        onError={() => {
          console.error('Audio element error');
          stopAudioAnalysis();
          if (tryNextUrl()) {
            setTimeout(attemptPlay, 1000);
          } else {
            setIsLoading(false);
            setIsPlaying(false);
          }
        }}
        onPause={() => {
          setIsPlaying(false);
          stopAudioAnalysis();
        }}
      />
      </div>
    </div>
  );
};

export default LiveRadioPlayer;