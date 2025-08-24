import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { RadioStreamService } from '@/utils/RadioStreamService';
import stationLogo from '@/assets/dance-one-logo.png';
interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
}
const LiveRadioPlayer = ({
  streamUrls,
  streamTitle: initialStreamTitle
}: LiveRadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(64).fill(20));
  const [debugInfo, setDebugInfo] = useState<string>('Waiting...');
  const [animationActive, setAnimationActive] = useState(false);
  const [currentStreamTitle, setCurrentStreamTitle] = useState(initialStreamTitle);
  const [isStreamLive, setIsStreamLive] = useState(false);
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
      // Increase FFT size for better frequency resolution
      analyser.fftSize = 256; // This gives us 128 frequency bins for 64 bars
      analyser.smoothingTimeConstant = 0.8; // Add smoothing for realistic behavior
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

      // Map frequency bins to Hz ranges and create 64 bars
      const bars = [];
      const nyquist = 22050; // Typical Nyquist frequency for 44.1kHz audio
      const binsPerBar = Math.floor(dataArrayRef.current.length / 64);
      
      for (let i = 0; i < 64; i++) {
        // Calculate frequency range for this bar
        const startFreq = (i * nyquist) / 64;
        const endFreq = ((i + 1) * nyquist) / 64;
        
        let sum = 0;
        let count = 0;
        
        // Average frequency data for this Hz range
        for (let j = 0; j < binsPerBar; j++) {
          const binIndex = i * binsPerBar + j;
          if (binIndex < dataArrayRef.current.length) {
            sum += dataArrayRef.current[binIndex];
            count++;
          }
        }
        
        const average = count > 0 ? sum / count : 0;
        
        // Apply frequency-specific weighting
        let weight = 1;
        if (startFreq < 200) {
          // Bass frequencies - boost for visibility
          weight = 1.5;
        } else if (startFreq < 2000) {
          // Mid frequencies - normal
          weight = 1.2;
        } else {
          // Treble frequencies - slightly reduced
          weight = 1.0;
        }
        
        // Normalize to 20-70 pixel range with frequency weighting
        const height = Math.max(20, Math.min(70, (average / 255) * 50 * weight + 20));
        bars.push(height);
      }
      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(updateFrequencyData);
    };
    updateFrequencyData();
  };
  const startFallbackAnimation = () => {
    console.log('🎵 Starting FREQUENCY-BASED animation');
    setDebugInfo('Using frequency-based EQ simulation');
    setAnimationActive(true);

    // Stop any existing analysis first
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
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
      
      if (frameCount % 30 === 0) {
        console.log('🎵 FREQUENCY animation frame:', frameCount);
      }

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

      // Find the EQ bars in the DOM and animate them directly
      const eqContainer = document.querySelector('[data-eq-container]');
      if (eqContainer) {
        const domBars = eqContainer.querySelectorAll('[data-eq-bar]');
        domBars.forEach((bar: any, i: number) => {
          const height = bars[i];
          const frequencyPosition = i / 63; // 0 to 1 based on bar position
          const normalizedHeight = Math.min(1, Math.max(0, (height - 20) / 50)); // 0 to 1
          
          // Realistic frequency spectrum colors based on Hz
          let hue, saturation, lightness;
          
          if (frequencyPosition < 0.25) {
            // Bass frequencies: Deep red to orange
            hue = 0 + frequencyPosition * 60; // 0-15
            saturation = 85 + normalizedHeight * 15;
            lightness = 35 + normalizedHeight * 30;
          } else if (frequencyPosition < 0.5) {
            // Low-mid frequencies: Orange to yellow
            const local = (frequencyPosition - 0.25) / 0.25;
            hue = 15 + local * 45; // 15-60
            saturation = 80 + normalizedHeight * 20;
            lightness = 40 + normalizedHeight * 25;
          } else if (frequencyPosition < 0.75) {
            // High-mid frequencies: Green to cyan
            const local = (frequencyPosition - 0.5) / 0.25;
            hue = 60 + local * 120; // 60-180
            saturation = 75 + normalizedHeight * 25;
            lightness = 45 + normalizedHeight * 20;
          } else {
            // Treble frequencies: Cyan to purple
            const local = (frequencyPosition - 0.75) / 0.25;
            hue = 180 + local * 120; // 180-300
            saturation = 70 + normalizedHeight * 30;
            lightness = 50 + normalizedHeight * 15;
          }
          
          // Enhanced glow effect based on height
          const glowIntensity = normalizedHeight * 15 + 5;
          const glowSpread = normalizedHeight * 8 + 2;

          // Apply frequency-based styling
          bar.style.height = `${height}px`;
          bar.style.width = '2px';
          bar.style.minWidth = '2px';
          bar.style.maxWidth = '2px';
          bar.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          bar.style.boxShadow = `
            0 0 ${glowSpread}px hsl(${hue}, ${saturation}%, ${lightness}%),
            0 0 ${glowIntensity}px hsl(${hue}, 100%, 80%),
            inset 0 0 ${glowSpread/2}px hsl(${hue}, 100%, 90%)
          `;
          bar.style.transition = 'none';
          bar.style.borderRadius = '8px';
        });
      }

      setFrequencyData(bars);
      
      if (frameCount % 60 === 0) {
        console.log('🎵 Frequency Heights:', bars.map(b => Math.round(b)));
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
    setFrequencyData(new Array(64).fill(20)); // Reset to base height
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
    // Extract song title from the formatted stream title (handle multiple emojis)
    const songMatch = streamTitle.match(/🎵+\s*(.*?)\s*🎵+/);
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
      if (!currentStreamTitle || currentStreamTitle.includes('Dance One Radio - The Future')) return;
      setIsLoadingArt(true);
      try {
        const cleanedQuery = cleanTrackForSearch(currentStreamTitle);
        console.log(`🎵 Radio: Fetching album art for: "${currentStreamTitle}" -> cleaned: "${cleanedQuery}"`);
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
  }, [currentStreamTitle]);

  // Real-time stream metadata fetching - independent of parent
  useEffect(() => {
    const fetchStreamMetadata = async () => {
      try {
        console.log('🎵 LivePlayer: Fetching stream metadata...');
        const metadata = await RadioStreamService.getStreamMetadata();
        console.log('🎵 LivePlayer: Raw metadata received:', metadata);
        
        // Check if stream is live based on metadata availability and content
        const streamIsLive = metadata && metadata.title && !metadata.title.includes('Dance One Radio - The Future');
        setIsStreamLive(streamIsLive);
        
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        console.log('🎵 LivePlayer: Formatted title:', formattedTitle);
        console.log('🎵 LivePlayer: Current title state:', currentStreamTitle);
        console.log('🎵 LivePlayer: Stream is live:', streamIsLive);
        
        if (formattedTitle !== currentStreamTitle) {
          console.log('🎵 LivePlayer: Stream metadata updated from:', currentStreamTitle, 'to:', formattedTitle);
          setCurrentStreamTitle(formattedTitle);
        } else {
          console.log('🎵 LivePlayer: No change in metadata, keeping current title');
        }
      } catch (error) {
        console.error('🎵 LivePlayer: Error fetching stream metadata:', error);
        setIsStreamLive(false);
      }
    };

    // Initial fetch
    console.log('🎵 LivePlayer: Setting up metadata fetching...');
    fetchStreamMetadata();
    
    // Update every 2 seconds for real-time updates
    const interval = setInterval(() => {
      console.log('🎵 LivePlayer: Interval tick - fetching metadata...');
      fetchStreamMetadata();
    }, 2000);
    
    return () => {
      console.log('🎵 LivePlayer: Cleaning up metadata interval');
      clearInterval(interval);
    };
  }, [currentStreamTitle]);

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
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg font-['Orbitron'] font-semibold text-primary">NOW PLAYING</h3>
          {(isStreamLive || isPlaying) ? (
            <Badge variant="destructive" className="bg-destructive text-destructive-foreground text-xs font-semibold animate-pulse">
              LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground text-xs font-semibold">
              OFFLINE
            </Badge>
          )}
        </div>
        <div className="relative overflow-hidden bg-background/20 rounded-md p-2 mb-2">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-sm text-foreground font-['Rajdhani'] font-medium">
              {currentStreamTitle.replace(/Frequency\s*&\s*/gi, '') // Remove "Frequency &"
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
      <div className="flex items-end justify-center space-x-0.5 mb-6 h-20 w-full px-4" data-eq-container>
        {frequencyData.map((height, i) => {
          const frequencyPosition = i / 63; // 0 to 1 based on bar position
          const normalizedHeight = Math.min(1, Math.max(0, (height - 20) / 50)); // 0 to 1
          
          // Realistic frequency spectrum colors
          let hue, saturation, lightness;
          
          if (frequencyPosition < 0.2) {
            // Bass frequencies: Deep red to orange-red
            hue = 0 + frequencyPosition * 40;
            saturation = 90 - normalizedHeight * 10;
            lightness = 40 + normalizedHeight * 25;
          } else if (frequencyPosition < 0.4) {
            // Low-mid frequencies: Orange to yellow
            const local = (frequencyPosition - 0.2) / 0.2;
            hue = 20 + local * 40;
            saturation = 85 + normalizedHeight * 15;
            lightness = 45 + normalizedHeight * 20;
          } else if (frequencyPosition < 0.6) {
            // Mid frequencies: Yellow to green
            const local = (frequencyPosition - 0.4) / 0.2;
            hue = 60 + local * 60;
            saturation = 80 + normalizedHeight * 20;
            lightness = 50 + normalizedHeight * 15;
          } else if (frequencyPosition < 0.8) {
            // High-mid frequencies: Green to cyan
            const local = (frequencyPosition - 0.6) / 0.2;
            hue = 120 + local * 60;
            saturation = 75 + normalizedHeight * 25;
            lightness = 55 + normalizedHeight * 15;
          } else {
            // Treble frequencies: Cyan to blue to purple
            const local = (frequencyPosition - 0.8) / 0.2;
            hue = 180 + local * 120;
            saturation = 70 + normalizedHeight * 30;
            lightness = 60 + normalizedHeight * 20;
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
                width: '3px',
                minWidth: '3px',
                maxWidth: '3px',
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