import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import stationLogo from '@/assets/dance-one-logo.png';
interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
}
const LiveRadioPlayer = ({
  streamUrls,
  streamTitle
}: LiveRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(8).fill(20));
  const [debugInfo, setDebugInfo] = useState<string>('Waiting...');
  const [animationActive, setAnimationActive] = useState(false);
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

      // Check if we're getting real data (sum should be > 0 if audio is playing)
      const dataSum = Array.from(dataArrayRef.current).reduce((sum, val) => sum + val, 0);
      if (dataSum === 0) {
        console.log('No audio data detected, using fallback animation');
        startFallbackAnimation();
        return;
      }
      console.log('Real audio data detected:', dataSum);

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
        bars.push(Math.max(20, average / 255 * 40 + 20));
      }
      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(updateFrequencyData);
    };
    updateFrequencyData();
  };
  const startFallbackAnimation = () => {
    console.log('🎵 Starting ENHANCED FLUID animation');
    setDebugInfo('Using ENHANCED FLUID animation');
    setAnimationActive(true);

    // Stop any existing analysis first
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    let time = 0;
    let frameCount = 0;
    const animateFallback = () => {
      time += 0.12; // More responsive timing for music-like feel
      frameCount++;
      
      if (frameCount % 30 === 0) {
        console.log('🎵 FLUID animation frame:', frameCount);
      }

      // Find the EQ bars in the DOM and animate them directly
      const eqContainer = document.querySelector('[data-eq-container]');
      if (eqContainer) {
        const bars = eqContainer.querySelectorAll('[data-eq-bar]');
        bars.forEach((bar: any, i: number) => {
          // More realistic frequency response simulation
          const bassBoost = i < 2 ? 2.5 : i < 4 ? 1.8 : 1;
          const midBoost = i >= 2 && i <= 4 ? 2.0 : i <= 6 ? 1.5 : 1;
          const trebleBoost = i > 6 ? 1.7 : 1;
          
          const baseHeight = 30;
          
          // More music-like wave patterns with varying frequencies
          const bassWave = Math.sin(time * 0.8 + i * 0.4) * 18 * bassBoost;
          const midWave = Math.sin(time * 1.5 + i * 0.7) * 12 * midBoost;
          const trebleWave = Math.sin(time * 3.2 + i * 1.2) * 8 * trebleBoost;
          
          // Add percussion-like peaks
          const kickPattern = Math.pow(Math.sin(time * 1.2), 8) * 15 * (i < 3 ? 1 : 0.3);
          const snarePattern = Math.pow(Math.sin(time * 2.4 + Math.PI/2), 6) * 10 * (i >= 3 && i <= 5 ? 1 : 0.2);
          
          // Musical decay simulation
          const decay = Math.exp(-Math.abs(Math.sin(time * 2 + i)) * 0.5) * 8;
          
          const height = Math.max(20, Math.min(70, 
            baseHeight + bassWave + midWave + trebleWave + kickPattern + snarePattern + decay
          ));
          
          // Enhanced color spectrum - spanning more hues with smoother transitions
          const normalizedHeight = (height - 20) / 50; // 0 to 1
          
          // Color spectrum: Blue -> Cyan -> Green -> Yellow -> Orange -> Red -> Purple -> Pink
          let hue, saturation, lightness;
          
          if (normalizedHeight < 0.14) {
            // Deep blue to cyan
            hue = 220 + (normalizedHeight / 0.14) * 40; // 220-260
            saturation = 85 + normalizedHeight * 15;
            lightness = 45 + normalizedHeight * 15;
          } else if (normalizedHeight < 0.29) {
            // Cyan to green  
            const local = (normalizedHeight - 0.14) / 0.15;
            hue = 180 + local * 40; // 180-220
            saturation = 90 + local * 10;
            lightness = 50 + local * 10;
          } else if (normalizedHeight < 0.43) {
            // Green to yellow
            const local = (normalizedHeight - 0.29) / 0.14;
            hue = 120 + local * 60; // 120-180
            saturation = 85 + local * 15;
            lightness = 55 + local * 10;
          } else if (normalizedHeight < 0.57) {
            // Yellow to orange
            const local = (normalizedHeight - 0.43) / 0.14;
            hue = 60 + local * 30; // 60-90
            saturation = 90 + local * 10;
            lightness = 60 + local * 10;
          } else if (normalizedHeight < 0.71) {
            // Orange to red
            const local = (normalizedHeight - 0.57) / 0.14;
            hue = 30 + local * 30; // 30-60
            saturation = 85 + local * 15;
            lightness = 55 + local * 15;
          } else if (normalizedHeight < 0.86) {
            // Red to purple
            const local = (normalizedHeight - 0.71) / 0.15;
            hue = 0 + local * 60; // 0-60 (wrapping to 300-360)
            if (hue < 30) hue = 330 + hue; // Convert to purple range
            saturation = 80 + local * 20;
            lightness = 50 + local * 20;
          } else {
            // Purple to pink
            const local = (normalizedHeight - 0.86) / 0.14;
            hue = 300 + local * 30; // 300-330
            saturation = 75 + local * 25;
            lightness = 55 + local * 25;
          }
          
          // Add subtle time-based color shifting
          const timeShift = Math.sin(time * 0.5 + i * 0.3) * 15;
          hue = (hue + timeShift + 360) % 360;
          
          // Enhanced glow effect based on height
          const glowIntensity = normalizedHeight * 15 + 5;
          const glowSpread = normalizedHeight * 8 + 2;

          // Apply fluid transformations
          bar.style.height = `${height}px`;
          bar.style.width = '8px'; // Thinner bars for more realistic look
          bar.style.minWidth = '8px';
          bar.style.maxWidth = '8px';
          bar.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          bar.style.boxShadow = `
            0 0 ${glowSpread}px hsl(${hue}, ${saturation}%, ${lightness}%),
            0 0 ${glowIntensity}px hsl(${hue}, 100%, 80%),
            inset 0 0 ${glowSpread/2}px hsl(${hue}, 100%, 90%)
          `;
          bar.style.transform = 'scaleX(1)';
          bar.style.transition = 'none'; // Remove transitions for smoother animation
          
          // Add subtle border radius variation
          const borderRadius = 8 + Math.sin(time * 2 + i) * 2;
          bar.style.borderRadius = `${borderRadius}px`;
        });
      }

      // Update React state as backup with enhanced data
      const bars = Array.from({ length: 8 }, (_, i) => {
        const bassBoost = i < 2 ? 2.5 : i < 4 ? 1.8 : 1;
        const midBoost = i >= 2 && i <= 4 ? 2.0 : i <= 6 ? 1.5 : 1;
        const trebleBoost = i > 6 ? 1.7 : 1;
        
        const baseHeight = 30;
        const bassWave = Math.sin(time * 0.8 + i * 0.4) * 18 * bassBoost;
        const midWave = Math.sin(time * 1.5 + i * 0.7) * 12 * midBoost;
        const trebleWave = Math.sin(time * 3.2 + i * 1.2) * 8 * trebleBoost;
        const kickPattern = Math.pow(Math.sin(time * 1.2), 8) * 15 * (i < 3 ? 1 : 0.3);
        const snarePattern = Math.pow(Math.sin(time * 2.4 + Math.PI/2), 6) * 10 * (i >= 3 && i <= 5 ? 1 : 0.2);
        const decay = Math.exp(-Math.abs(Math.sin(time * 2 + i)) * 0.5) * 8;
        
        return Math.max(20, Math.min(70, 
          baseHeight + bassWave + midWave + trebleWave + kickPattern + snarePattern + decay
        ));
      });
      
      setFrequencyData(bars);
      
      if (frameCount % 60 === 0) {
        console.log('🎵 Enhanced Heights:', bars.map(b => Math.round(b)));
      }
      
      animationRef.current = requestAnimationFrame(animateFallback);
    };
    
    animateFallback();
  };
  const stopAudioAnalysis = () => {
    console.log('🎵 Stopping audio analysis');
    setDebugInfo('EQ stopped');
    setAnimationActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(8).fill(20)); // Reset to base height
  };
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      console.log('🎵 Pausing audio');
      audioRef.current.pause();
      setIsPlaying(false);
      stopAudioAnalysis();
    } else {
      console.log('🎵 Starting audio playback');
      setIsLoading(true);
      setCurrentUrlIndex(0); // Reset to first URL
      attemptPlay();
    }
  };

  // Clean and format track info for better album art search
  const cleanTrackForSearch = (streamTitle: string): string => {
    // Extract song title from the formatted stream title
    const songMatch = streamTitle.match(/🎵\s*(.*?)\s*🎵/);
    const songTitle = songMatch ? songMatch[1] : streamTitle;

    // Clean the title for better search results
    return songTitle.replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/\(.*?extended.*?\)/gi, '') // Remove (Extended)
    .replace(/\(.*?remix.*?\)/gi, '') // Remove remix info
    .replace(/\(.*?edit.*?\)/gi, '') // Remove edit info
    .replace(/\(.*?mix.*?\)/gi, '') // Remove mix info
    .replace(/\[.*?\]/g, '') // Remove [brackets]
    .replace(/feat\..*$/gi, '') // Remove featuring
    .replace(/ft\..*$/gi, '') // Remove ft.
    .replace(/vs\..*$/gi, '') // Remove vs.
    .replace(/\d{4}$/, '') // Remove year at end
    .replace(/[^\w\s&'-]/g, '').replace(/Dance One Radio.*$/gi, '') // Remove radio station info
    .trim();
  };

  // Fetch album art when stream title changes
  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!streamTitle || streamTitle.includes('Dance One Radio - The Future')) return;
      setIsLoadingArt(true);
      try {
        const cleanedQuery = cleanTrackForSearch(streamTitle);
        console.log(`🎵 Radio: Fetching album art for: "${streamTitle}" -> cleaned: "${cleanedQuery}"`);
        const result = await AlbumArtService.getAlbumArt(cleanedQuery);
        if (result.imageUrl) {
          setAlbumArt(result.imageUrl);
          console.log(`🎵 Radio: Found album art for: ${cleanedQuery}`);
        } else {
          console.log(`🎵 Radio: No album art found for: ${cleanedQuery}`);
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
    audioRef.current.play().then(() => {
      console.log('🎵 Audio started playing successfully');
      setIsPlaying(true);
      setIsLoading(false);
      setDebugInfo('Audio playing - setting up EQ...');

      // Start the animation immediately
      setTimeout(() => {
        console.log('🎵 Starting EQ animation');
        startFallbackAnimation();
      }, 500);
    }).catch(error => {
      console.error(`Failed to play stream ${currentUrl}:`, error);
      if (tryNextUrl()) {
        setTimeout(attemptPlay, 1000); // Try next URL after 1 second
      } else {
        setIsLoading(false);
        console.error('All stream URLs failed');
      }
    });
  };
  return <div className="card-cyber p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Blurred background from album art or station logo */}
      {albumArt ? <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110" style={{
      backgroundImage: `url(${albumArt})`
    }} /> : <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110" style={{
      backgroundImage: `url(${stationLogo})`
    }} />}
      {/* Content overlay */}
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-40 h-40 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center pulse-cyber overflow-hidden">
            {albumArt ? <img src={albumArt} alt="Current Track Album Art" className="w-full h-full object-cover rounded-lg" onError={() => setAlbumArt(null)} /> : <img src={stationLogo} alt="Dance One Radio Logo" className="w-24 h-24 object-contain filter brightness-0 invert" onError={e => {
              // If station logo fails to load, fallback to Radio icon
              e.currentTarget.style.display = 'none';
              const radioIcon = e.currentTarget.nextElementSibling as HTMLElement;
              if (radioIcon) radioIcon.style.display = 'block';
            }} />}
            {/* Fallback radio icon - hidden by default */}
            <Radio className="w-20 h-20 text-primary-foreground hidden" style={{
              display: albumArt ? 'none' : 'none'
            }} />
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
              {streamTitle.replace(/Frequency\s*&\s*/gi, '') // Remove "Frequency &"
              .replace(/&amp;/g, '&') // Convert HTML entity to normal ampersand
              .replace(/amp;/g, '') // Remove remaining "amp;" text
              .replace(/🎵/g, '') // Remove music note icons
              .replace(/[📻🔊🎶🎧]/g, '') // Remove other music/radio icons
              .replace(/\s+/g, ' ') // Clean up extra spaces
              .trim()}
            </span>
          </div>
        </div>
        
      </div>

      {/* Enhanced Real-time Audio EQ Visualizer with Fluid Color Spectrum */}
      <div className="flex items-end justify-center space-x-2 mb-6 h-20" data-eq-container>
        {frequencyData.map((height, i) => {
          const normalizedHeight = (Math.max(20, Math.min(70, height)) - 20) / 50;
          let hue, saturation, lightness;
          
          // Enhanced color spectrum calculation
          if (normalizedHeight < 0.14) {
            hue = 220 + (normalizedHeight / 0.14) * 40;
            saturation = 85 + normalizedHeight * 15;
            lightness = 45 + normalizedHeight * 15;
          } else if (normalizedHeight < 0.29) {
            const local = (normalizedHeight - 0.14) / 0.15;
            hue = 180 + local * 40;
            saturation = 90 + local * 10;
            lightness = 50 + local * 10;
          } else if (normalizedHeight < 0.43) {
            const local = (normalizedHeight - 0.29) / 0.14;
            hue = 120 + local * 60;
            saturation = 85 + local * 15;
            lightness = 55 + local * 10;
          } else if (normalizedHeight < 0.57) {
            const local = (normalizedHeight - 0.43) / 0.14;
            hue = 60 + local * 30;
            saturation = 90 + local * 10;
            lightness = 60 + local * 10;
          } else if (normalizedHeight < 0.71) {
            const local = (normalizedHeight - 0.57) / 0.14;
            hue = 30 + local * 30;
            saturation = 85 + local * 15;
            lightness = 55 + local * 15;
          } else if (normalizedHeight < 0.86) {
            const local = (normalizedHeight - 0.71) / 0.15;
            hue = local < 0.5 ? 0 + local * 60 : 330 + (local - 0.5) * 60;
            saturation = 80 + local * 20;
            lightness = 50 + local * 20;
          } else {
            const local = (normalizedHeight - 0.86) / 0.14;
            hue = 300 + local * 30;
            saturation = 75 + local * 25;
            lightness = 55 + local * 25;
          }
          
          const glowIntensity = normalizedHeight * 15 + 5;
          const glowSpread = normalizedHeight * 8 + 2;
          
          return (
            <div 
              key={i} 
              data-eq-bar 
              className="rounded-full transition-none shadow-lg flex-shrink-0" 
              style={{
                height: `${Math.max(20, Math.min(70, height))}px`,
                width: '8px',
                minWidth: '8px',
                maxWidth: '8px',
                backgroundColor: animationActive 
                  ? `hsl(${hue}, ${saturation}%, ${lightness}%)` 
                  : 'hsl(var(--muted))',
                boxShadow: animationActive 
                  ? `0 0 ${glowSpread}px hsl(${hue}, ${saturation}%, ${lightness}%), 0 0 ${glowIntensity}px hsl(${hue}, 100%, 80%), inset 0 0 ${glowSpread/2}px hsl(${hue}, 100%, 90%)`
                  : 'none',
                willChange: 'height, background-color, box-shadow, border-radius'
              }} 
            />
          );
        })}
      </div>
      

      <Button onClick={handlePlayPause} className="btn-cyber w-full" size="lg" disabled={isLoading}>
        {isLoading ? <>
            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            LOADING...
          </> : isPlaying ? <>
            <Pause className="w-5 h-5 mr-2" />
            PAUSE STREAM
          </> : <>
            <Play className="w-5 h-5 mr-2" />
            LISTEN LIVE
          </>}
      </Button>

      <audio ref={audioRef} preload="none" crossOrigin="anonymous" onError={() => {
        console.error('Audio element error');
        stopAudioAnalysis();
        if (tryNextUrl()) {
          setTimeout(attemptPlay, 1000);
        } else {
          setIsLoading(false);
          setIsPlaying(false);
        }
      }} onPause={() => {
        setIsPlaying(false);
        stopAudioAnalysis();
      }} />
      </div>
    </div>;
};
export default LiveRadioPlayer;