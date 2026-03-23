import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { DesktopPlayerControls } from './DesktopPlayerControls';
import PopupPlayerButton from './PopupPlayerButton';
import { useLiveRadioPlayer } from '@/hooks/useLiveRadioPlayer';
import stationLogo from '@/assets/dance-one-logo.png';

interface LiveRadioPlayerProps {
  streamUrls: string[];
  streamTitle: string;
  hidePopupButton?: boolean;
}

const EQ_BAR_COUNT = 64;
const EQ_MIN_HEIGHT = 12;
const EQ_MAX_HEIGHT = 70;
const NOTIFICATION_PREF_KEY = 'desktop-track-change-notifications';
const createIdleFrequencyData = () => new Array(EQ_BAR_COUNT).fill(EQ_MIN_HEIGHT);

let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;
let sharedAnalyserAudio: HTMLAudioElement | null = null;
let sharedFrequencyBins: Uint8Array | null = null;

const stripDecorativeSymbols = (value: string) => value
  .replace(/[\u{1F3B5}\u{1F3B6}\u{1F4FB}\u{1F50A}\u{1F3A7}]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const sanitizeDisplayTitle = (value: string) => stripDecorativeSymbols(
  value
    .replace(/Frequency\s*&\s*/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/amp;/g, '')
);

const LiveRadioPlayer = ({
  streamUrls,
  streamTitle: initialStreamTitle,
  hidePopupButton = false
}: LiveRadioPlayerProps) => {
  const audioPlayer = useAudioPlayer();
  const { isPlaying, isLoading, handlePlayPause, primeLiveStream, streamTitle: globalStreamTitle, albumArt: globalAlbumArt } = useLiveRadioPlayer(streamUrls);

  const [localAlbumArt, setLocalAlbumArt] = useState<string | null>(null);
  const [animationActive, setAnimationActive] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(createIdleFrequencyData);
  const [currentStreamTitle, setCurrentStreamTitle] = useState(initialStreamTitle);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem(NOTIFICATION_PREF_KEY) === 'true');
  const [shouldScrollTitle, setShouldScrollTitle] = useState(false);
  const [titleScrollDuration, setTitleScrollDuration] = useState(18);
  const [titleScrollDistance, setTitleScrollDistance] = useState(0);

  const { showNotification, isElectronDesktop, ensureNotificationPermission } = useDesktopIntegration();
  const animationRef = useRef<number | null>(null);
  const lastNotifiedTrackRef = useRef<string | null>(null);
  const smoothedBarsRef = useRef<number[]>(createIdleFrequencyData());
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleMeasureRef = useRef<HTMLSpanElement | null>(null);

  const displayStreamTitle = globalStreamTitle || currentStreamTitle;
  const albumArt = globalAlbumArt || localAlbumArt;
  const cleanedDisplayTitle = sanitizeDisplayTitle(displayStreamTitle);

  const cleanTrackForSearch = (streamTitle: string): string => {
    const songTitle = stripDecorativeSymbols(streamTitle);

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
    if (isPlaying) {
      setAnimationActive(true);
    } else {
      setAnimationActive(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    primeLiveStream().catch((error) => {
      console.error('Failed to prime live stream:', error);
    });
  }, [primeLiveStream]);

  useEffect(() => {
    if (!animationActive) {
      smoothedBarsRef.current = createIdleFrequencyData();
      setFrequencyData(createIdleFrequencyData());
      return;
    }

    if (isElectronDesktop) {
      let time = 0;

      const animate = () => {
        time += 0.05;
        const bars = Array.from({ length: EQ_BAR_COUNT }, (_, i) => {
          const base = 25 + Math.sin(time * (0.3 + i * 0.03) + i) * 18;
          return Math.max(EQ_MIN_HEIGHT, Math.min(EQ_MAX_HEIGHT, base + (Math.random() - 0.5) * 6));
        });

        smoothedBarsRef.current = bars;
        setFrequencyData(bars);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    }

    const audio = audioPlayer.audioRef.current;
    const AudioContextCtor = window.AudioContext || (window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

    if (!audio || !AudioContextCtor) {
      return;
    }

    let isCancelled = false;

    const setupAnalyser = async () => {
      try {
        let context = sharedAudioContext;
        if (!context || context.state === 'closed') {
          context = new AudioContextCtor();
          sharedAudioContext = context;
        }

        if (context.state === 'suspended') {
          await context.resume();
        }

        if (!sharedAnalyser || sharedAnalyserAudio !== audio) {
          sharedSourceNode?.disconnect();
          sharedAnalyser?.disconnect();

          const sourceNode = context.createMediaElementSource(audio);
          const analyser = context.createAnalyser();
          analyser.fftSize = 256;
          analyser.minDecibels = -95;
          analyser.maxDecibels = -20;
          analyser.smoothingTimeConstant = 0.82;

          sourceNode.connect(analyser);
          analyser.connect(context.destination);

          sharedSourceNode = sourceNode;
          sharedAnalyser = analyser;
          sharedAnalyserAudio = audio;
          sharedFrequencyBins = new Uint8Array(analyser.frequencyBinCount);
        }

        const animate = () => {
          if (isCancelled || !sharedAnalyser || !sharedFrequencyBins) {
            return;
          }

          sharedAnalyser.getByteFrequencyData(sharedFrequencyBins as unknown as Uint8Array<ArrayBuffer>);

          const nextBars = Array.from({ length: EQ_BAR_COUNT }, (_, index) => {
            const start = Math.floor((index / EQ_BAR_COUNT) * sharedFrequencyBins.length);
            const end = Math.max(start + 1, Math.floor(((index + 1) / EQ_BAR_COUNT) * sharedFrequencyBins.length));

            let total = 0;
            for (let i = start; i < end; i += 1) {
              total += sharedFrequencyBins[i];
            }

            const average = total / (end - start) / 255;
            const emphasis = 1.0;
            const normalized = Math.min(1, average * emphasis * 1.6);
            const targetHeight = EQ_MIN_HEIGHT + Math.pow(normalized, 1.2) * (EQ_MAX_HEIGHT - EQ_MIN_HEIGHT);
            const previousHeight = smoothedBarsRef.current[index] ?? EQ_MIN_HEIGHT;
            const smoothing = targetHeight > previousHeight ? 0.45 : 0.18;

            return previousHeight + (targetHeight - previousHeight) * smoothing;
          });

          smoothedBarsRef.current = nextBars;
          setFrequencyData(nextBars);
          animationRef.current = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Failed to initialize live EQ analyser:', error);
      }
    };

    void setupAnalyser();

    return () => {
      isCancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [animationActive, audioPlayer.audioRef, isElectronDesktop]);

  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!displayStreamTitle || displayStreamTitle.includes('Dance One Radio - The Future')) return;
      if (globalAlbumArt) return;

      try {
        const cleanedQuery = cleanTrackForSearch(displayStreamTitle);
        const result = await AlbumArtService.getAlbumArt(cleanedQuery);
        setLocalAlbumArt(result.imageUrl || null);
      } catch (error) {
        console.error('Error fetching album art:', error);
        setLocalAlbumArt(null);
      }
    };

    fetchAlbumArt();
  }, [displayStreamTitle, globalAlbumArt]);

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
        setIsStreamLive(Boolean(streamIsLive));

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

    fetchStreamMetadata().then(scheduleNext);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStreamTitle]);

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

  useEffect(() => {
    const updateTitleOverflow = () => {
      const containerWidth = titleContainerRef.current?.clientWidth ?? 0;
      const titleWidth = titleMeasureRef.current?.scrollWidth ?? 0;
      const overflowWidth = titleWidth - containerWidth;

      if (overflowWidth > 8) {
        setShouldScrollTitle(true);
        setTitleScrollDistance(titleWidth + 40);
        setTitleScrollDuration(Math.max(12, (titleWidth + 40) / 32));
        return;
      }

      setShouldScrollTitle(false);
      setTitleScrollDistance(0);
      setTitleScrollDuration(18);
    };

    updateTitleOverflow();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateTitleOverflow());

      if (titleContainerRef.current) {
        observer.observe(titleContainerRef.current);
      }

      if (titleMeasureRef.current) {
        observer.observe(titleMeasureRef.current);
      }

      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateTitleOverflow);
    return () => window.removeEventListener('resize', updateTitleOverflow);
  }, [cleanedDisplayTitle]);

  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled) {
      const permissionGranted = await ensureNotificationPermission();
      if (!permissionGranted) {
        setNotificationsEnabled(false);
        localStorage.setItem(NOTIFICATION_PREF_KEY, 'false');
        return;
      }
    }

    setNotificationsEnabled(enabled);
    localStorage.setItem(NOTIFICATION_PREF_KEY, String(enabled));
    if (enabled) {
      showNotification('Track notifications enabled', 'You will now receive now-playing alerts.');
    }
    if (!enabled) {
      lastNotifiedTrackRef.current = null;
    }
  };

  return (
    <div className="card-cyber p-8 max-w-md mx-auto relative overflow-hidden">
      {albumArt ? (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110" style={{ backgroundImage: `url(${albumArt})` }} />
      ) : (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110" style={{ backgroundImage: `url(${stationLogo})` }} />
      )}

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
          <div ref={titleContainerRef} className="relative overflow-hidden bg-background/20 rounded-md p-2 mb-2">
            <span ref={titleMeasureRef} className="pointer-events-none absolute left-0 top-0 whitespace-nowrap opacity-0">
              {cleanedDisplayTitle}
            </span>
            {shouldScrollTitle ? (
              <div
                className="track-marquee"
                style={{
                  '--track-scroll-duration': `${titleScrollDuration}s`,
                  '--track-scroll-distance': `${titleScrollDistance}px`,
                } as CSSProperties}
              >
                <span className="track-marquee__label text-sm text-foreground font-inter font-medium">
                  {cleanedDisplayTitle}
                </span>
                <span aria-hidden="true" className="track-marquee__divider">|</span>
                <span aria-hidden="true" className="track-marquee__label text-sm text-foreground font-inter font-medium">
                  {cleanedDisplayTitle}
                </span>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="whitespace-nowrap text-sm text-foreground font-inter font-medium">
                  {cleanedDisplayTitle}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-end justify-center space-x-0.5 mb-6 h-20 w-full px-4" data-eq-container>
          {frequencyData.map((height, i) => (
            <div
              key={i}
              data-eq-bar
              className="rounded-full transition-none shadow-lg flex-shrink-0"
              style={{
                height: `${Math.max(20, Math.min(70, height))}px`,
                width: '3px',
                minWidth: '3px',
                maxWidth: '3px',
                backgroundColor: animationActive ? `hsl(${(i / 63) * 300}, 90%, 60%)` : 'hsl(var(--muted))',
                boxShadow: animationActive ? `0 0 8px hsl(${(i / 63) * 300}, 90%, 60%)` : 'none',
              }}
            />
          ))}
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
