import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Radio } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { DesktopPlayerControls } from './DesktopPlayerControls';
import PopupPlayerButton from './PopupPlayerButton';
import { useLiveRadioPlayer } from '@/hooks/useLiveRadioPlayer';
import stationLogo from '@/assets/dance-one-logo.png';

interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
  hidePopupButton?: boolean;
}

const LiveRadioPlayer = ({
  streamUrls,
  streamTitle: initialStreamTitle,
  hidePopupButton = false
}: LiveRadioPlayerProps) => {
  const { isPlaying, isLoading, handlePlayPause, primeLiveStream, streamTitle: globalStreamTitle, albumArt: globalAlbumArt } = useLiveRadioPlayer(streamUrls);
  
  const [localAlbumArt, setLocalAlbumArt] = useState<string | null>(null);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(64).fill(20));
  const [debugInfo, setDebugInfo] = useState<string>('Waiting...');
  const [animationActive, setAnimationActive] = useState(false);
  const [currentStreamTitle, setCurrentStreamTitle] = useState(initialStreamTitle);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('track-change-notifications') === 'true');

  const { showNotification } = useDesktopIntegration();
  const animationRef = useRef<number | null>(null);
  const lastNotifiedTrackRef = useRef<string | null>(null);

  // Use global stream title and album art when available
  const displayStreamTitle = globalStreamTitle || currentStreamTitle;
  const albumArt = globalAlbumArt || localAlbumArt;

  // Clean and format track info for better album art search
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

  // Start/stop animation based on playing state
  useEffect(() => {
    if (isPlaying) {
      startFallbackAnimation();
    } else {
      stopAnimation();
    }
  }, [isPlaying]);

  useEffect(() => {
    primeLiveStream();
  }, [primeLiveStream]);

  const startFallbackAnimation = () => {
    console.log('🎵 Starting FREQUENCY-BASED animation');
    setDebugInfo('Using frequency-based EQ simulation');
    setAnimationActive(true);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    let time = 0;
    
    const bassOscillators = Array.from({ length: 16 }, (_, i) => ({
      frequency: 0.3 + i * 0.05,
      amplitude: 2.0 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    }));
    
    const midOscillators = Array.from({ length: 32 }, (_, i) => ({
      frequency: 0.8 + i * 0.1,
      amplitude: 1.2 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2
    }));
    
    const trebleOscillators = Array.from({ length: 16 }, (_, i) => ({
      frequency: 2.0 + i * 0.3,
      amplitude: 0.8 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2
    }));
    
    const animateFallback = () => {
      time += 0.05;

      const bars = Array.from({ length: 64 }, (_, i) => {
        let height = 25;
        
        if (i < 16) {
          const osc = bassOscillators[i];
          const bassResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const kickPattern = Math.pow(Math.sin(time * 0.5), 6) * 20;
          height += bassResponse * 15 + kickPattern * (16 - i) / 16;
        }
        else if (i < 48) {
          const midIndex = i - 16;
          const osc = midOscillators[midIndex];
          const midResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const snarePattern = Math.pow(Math.sin(time * 1.3 + Math.PI/3), 4) * 12;
          const vocalPattern = Math.sin(time * 0.7 + midIndex * 0.1) * 8;
          height += midResponse * 12 + snarePattern * (midIndex > 8 && midIndex < 24 ? 1 : 0.3) + vocalPattern;
        }
        else {
          const trebleIndex = i - 48;
          const osc = trebleOscillators[trebleIndex];
          const trebleResponse = Math.sin(time * osc.frequency + osc.phase) * osc.amplitude;
          const hihatPattern = Math.pow(Math.sin(time * 4 + trebleIndex * 0.5), 3) * 6;
          const sparklePattern = Math.sin(time * 2.5 + trebleIndex * 0.8) * 4;
          height += trebleResponse * 8 + hihatPattern + sparklePattern;
        }
        
        const envelope = Math.exp(-Math.abs(Math.sin(time * 1.5 + i * 0.1)) * 0.3) * 5;
        height += envelope;
        
        const randomNoise = (Math.random() - 0.5) * 3;
        height += randomNoise;
        
        return Math.max(20, Math.min(70, height));
      });

      setFrequencyData(bars);
      animationRef.current = requestAnimationFrame(animateFallback);
    };
    
    animateFallback();
  };

  const stopAnimation = () => {
    setDebugInfo('EQ stopped');
    setAnimationActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFrequencyData(new Array(64).fill(20));
  };

  // Fetch album art when stream title changes (fallback for when global isn't available)
  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!displayStreamTitle || displayStreamTitle.includes('Dance One Radio - The Future')) return;
      if (globalAlbumArt) return; // Don't fetch if global already has it
      
      setIsLoadingArt(true);
      try {
        const cleanedQuery = cleanTrackForSearch(displayStreamTitle);
        const result = await AlbumArtService.getAlbumArt(cleanedQuery);
        if (result.imageUrl) {
          setLocalAlbumArt(result.imageUrl);
        } else {
          setLocalAlbumArt(null);
        }
      } catch (error) {
        console.error('Error fetching album art:', error);
        setLocalAlbumArt(null);
      } finally {
        setIsLoadingArt(false);
      }
    };
    fetchAlbumArt();
  }, [displayStreamTitle, globalAlbumArt]);

  // Real-time stream metadata fetching (for visual display only, not controlling audio)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fetchStreamMetadata = async () => {
      if (!isVisible) return;

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

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        fetchStreamMetadata().then(scheduleNext);
      }, 10000);
    };

    if (isVisible) {
      fetchStreamMetadata().then(scheduleNext);
    } else {
      scheduleNext();
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStreamTitle]);

  // Desktop notification for track changes (respects user preference)
  useEffect(() => {
    if (!notificationsEnabled || !isPlaying || !displayStreamTitle || displayStreamTitle.includes('Dance One Radio - The Future')) {
      return;
    }

    const cleanedTitle = cleanTrackForSearch(displayStreamTitle);
    if (!cleanedTitle || cleanedTitle === lastNotifiedTrackRef.current) {
      return;
    }

    lastNotifiedTrackRef.current = cleanedTitle;
    showNotification('Now Playing', cleanedTitle);
  }, [displayStreamTitle, isPlaying, notificationsEnabled, showNotification]);

  const handleNotificationsChange = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('track-change-notifications', String(enabled));
    if (!enabled) {
      lastNotifiedTrackRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);

  return (
    <div className="card-cyber p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Blurred background from album art or station logo */}
      {albumArt ? (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110" style={{ backgroundImage: `url(${albumArt})` }} />
      ) : (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110" style={{ backgroundImage: `url(${stationLogo})` }} />
      )}
      
      {/* Content overlay */}
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-40 h-40 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center pulse-cyber overflow-hidden">
              {albumArt ? (
                <img src={albumArt} alt="Current Track Album Art" className="w-full h-full object-cover rounded-lg" onError={() => setLocalAlbumArt(null)} />
              ) : (
                <img src={stationLogo} alt="Dance One Radio Logo" className="w-24 h-24 object-contain filter brightness-0 invert" loading="lazy" />
              )}
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
              <span className="text-sm text-foreground font-inter font-medium">
                {displayStreamTitle.replace(/Frequency\s*&\s*/gi, '')
                .replace(/&amp;/g, '&')
                .replace(/amp;/g, '')
                .replace(/🎵/g, '')
                .replace(/[📻🔊🎶🎧]/g, '')
                .replace(/\s+/g, ' ')
                .trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Audio EQ Visualizer */}
        <div className="flex items-end justify-center space-x-0.5 mb-6 h-20 w-full px-4" data-eq-container>
          {frequencyData.map((height, i) => {
            const frequencyPosition = i / 63;
            const normalizedHeight = Math.min(1, Math.max(0, (height - 20) / 50));
            
            let hue, saturation, lightness;
            
            if (frequencyPosition < 0.2) {
              hue = 0 + frequencyPosition * 40;
              saturation = 90 - normalizedHeight * 10;
              lightness = 40 + normalizedHeight * 25;
            } else if (frequencyPosition < 0.4) {
              const local = (frequencyPosition - 0.2) / 0.2;
              hue = 20 + local * 40;
              saturation = 85 + normalizedHeight * 15;
              lightness = 45 + normalizedHeight * 20;
            } else if (frequencyPosition < 0.6) {
              const local = (frequencyPosition - 0.4) / 0.2;
              hue = 60 + local * 60;
              saturation = 80 + normalizedHeight * 20;
              lightness = 50 + normalizedHeight * 15;
            } else if (frequencyPosition < 0.8) {
              const local = (frequencyPosition - 0.6) / 0.2;
              hue = 120 + local * 60;
              saturation = 75 + normalizedHeight * 25;
              lightness = 55 + normalizedHeight * 15;
            } else {
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

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={handlePlayPause} className={`btn-cyber ${hidePopupButton ? 'w-full' : 'flex-1'}`} size="lg" disabled={isLoading}>
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
            {!hidePopupButton && <PopupPlayerButton variant="outline" size="lg" />}
          </div>

          {/* Desktop Controls */}
          <DesktopPlayerControls 
            isPlaying={isPlaying}
            onTogglePlayback={handlePlayPause}
            currentTrack={{
              title: cleanTrackForSearch(displayStreamTitle),
              artist: 'Dance One Radio'
            }}
            notificationsEnabled={notificationsEnabled}
            onNotificationsChange={handleNotificationsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveRadioPlayer;
