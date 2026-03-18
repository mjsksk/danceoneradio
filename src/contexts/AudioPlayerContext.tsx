import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { LIVE_STREAM_FALLBACK_TIMEOUT_MS, LIVE_STREAM_URLS } from '@/constants/liveStream';
import { toast } from 'sonner';
import stationLogo from '@/assets/dance-one-logo.png';

interface EpisodeInfo {
  number: number;
  title: string;
  audioUrl: string;
}

interface AudioPlayerState {
  source: 'live' | 'episode' | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  episodeInfo: EpisodeInfo | null;
  streamTitle: string;
  albumArt: string | null;
  isVisible: boolean;
  autoplayEnabled: boolean;
}

interface AudioPlayerContextType extends AudioPlayerState {
  playLiveStream: (streamUrls: string[]) => void;
  primeLiveStream: (streamUrls?: string[]) => void;
  playEpisode: (info: EpisodeInfo) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  closePlayer: () => void;
  toggleAutoplay: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

// Available episode numbers with pages (sorted descending)
const AVAILABLE_EPISODES = [403, 402, 401, 400, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389];

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentUrlIndexRef = useRef(0);
  const streamUrlsRef = useRef<string[]>(LIVE_STREAM_URLS);
  const liveAttemptTimeoutRef = useRef<number | null>(null);
  
  // Load autoplay preference from localStorage
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    const saved = localStorage.getItem('autoplay-enabled');
    return saved === 'true';
  });
  
  const [state, setState] = useState<AudioPlayerState>({
    source: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    episodeInfo: null,
    streamTitle: '🎵 Dance One Radio - Live Stream 🎵',
    albumArt: null,
    isVisible: false,
    autoplayEnabled: false,
  });

  // Keep state in sync with autoplayEnabled
  useEffect(() => {
    setState(prev => ({ ...prev, autoplayEnabled }));
  }, [autoplayEnabled]);

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [streamUrls, setStreamUrls] = useState<string[]>(LIVE_STREAM_URLS);

  useEffect(() => {
    currentUrlIndexRef.current = currentUrlIndex;
  }, [currentUrlIndex]);

  useEffect(() => {
    streamUrlsRef.current = streamUrls;
  }, [streamUrls]);

  // Fetch stream metadata for live stream
  useEffect(() => {
    if (state.source !== 'live') return;
    
    const fetchMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setState(prev => ({ ...prev, streamTitle: formattedTitle }));
        
        // Fetch album art
        if (formattedTitle && !formattedTitle.includes('Dance One Radio - The Future')) {
          const result = await AlbumArtService.getAlbumArt(formattedTitle);
          if (result.imageUrl) {
            setState(prev => ({ ...prev, albumArt: result.imageUrl }));
          }
        }
      } catch (error) {
        console.error('Error fetching stream metadata:', error);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, [state.source]);

  const clearLiveAttemptTimeout = useCallback(() => {
    if (liveAttemptTimeoutRef.current !== null) {
      window.clearTimeout(liveAttemptTimeoutRef.current);
      liveAttemptTimeoutRef.current = null;
    }
  }, []);

  const tryStreamAtIndex = useCallback((index: number, urls: string[]) => {
    const audio = audioRef.current;
    if (!audio || !urls[index]) return false;

    clearLiveAttemptTimeout();
    currentUrlIndexRef.current = index;
    setCurrentUrlIndex(index);

    audio.src = urls[index];
    audio.load();

    liveAttemptTimeoutRef.current = window.setTimeout(() => {
      if (!audioRef.current || currentUrlIndexRef.current !== index) return;
      if (audioRef.current.currentTime > 0 || audioRef.current.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;

      if (index < urls.length - 1) {
        tryStreamAtIndex(index + 1, urls);
      } else {
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      }
    }, LIVE_STREAM_FALLBACK_TIMEOUT_MS);

    audio.play().catch(err => {
      console.error(`Error playing live stream URL ${index + 1}:`, err);
      if (index < urls.length - 1) {
        tryStreamAtIndex(index + 1, urls);
      } else {
        clearLiveAttemptTimeout();
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      }
    });

    return true;
  }, [clearLiveAttemptTimeout]);

  const playLiveStream = useCallback((urls: string[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setStreamUrls(urls);
    setCurrentUrlIndex(0);
    
    setState(prev => ({
      ...prev,
      source: 'live',
      isLoading: true,
      isVisible: true,
      episodeInfo: null,
      albumArt: null,
    }));

    const primaryUrl = new URL(urls[0], window.location.href).href;
    if (audio.src === primaryUrl && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      clearLiveAttemptTimeout();
      audio.play().catch(err => {
        console.error('Error resuming primed live stream:', err);
        tryStreamAtIndex(0, urls);
      });
      return;
    }

    tryStreamAtIndex(0, urls);
  }, [clearLiveAttemptTimeout, tryStreamAtIndex]);

  const primeLiveStream = useCallback((urls: string[] = LIVE_STREAM_URLS) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.source === 'episode' || state.isPlaying) return;

    setStreamUrls(urls);
    streamUrlsRef.current = urls;
    currentUrlIndexRef.current = 0;
    setCurrentUrlIndex(0);

    const primaryUrl = new URL(urls[0], window.location.href).href;
    if (audio.src === primaryUrl) return;

    clearLiveAttemptTimeout();
    audio.src = urls[0];
    audio.load();
  }, [clearLiveAttemptTimeout, state.isPlaying, state.source]);

  const playEpisode = useCallback((info: EpisodeInfo) => {
    if (!audioRef.current) return;

    clearLiveAttemptTimeout();
    
    setState(prev => ({
      ...prev,
      source: 'episode',
      isLoading: true,
      isVisible: true,
      episodeInfo: info,
      streamTitle: info.title,
      albumArt: stationLogo,
    }));

    audioRef.current.src = info.audioUrl;
    audioRef.current.load();
    audioRef.current.play().catch(err => {
      console.error('Error playing episode:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    });
  }, [clearLiveAttemptTimeout]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(err => console.error('Error resuming:', err));
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    setState(prev => ({ ...prev, volume }));
  }, []);

  const closePlayer = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    clearLiveAttemptTimeout();
    setState(prev => ({
      ...prev,
      source: null,
      isPlaying: false,
      isVisible: false,
      currentTime: 0,
      duration: 0,
      episodeInfo: null,
    }));
  }, [clearLiveAttemptTimeout]);

  const toggleAutoplay = useCallback(() => {
    setAutoplayEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('autoplay-enabled', String(newValue));
      return newValue;
    });
  }, []);

  // Helper function to get next episode info
  const getNextEpisode = useCallback((currentEpisodeNumber: number): EpisodeInfo | null => {
    const currentIndex = AVAILABLE_EPISODES.indexOf(currentEpisodeNumber);
    // Get next episode (lower number, next in the sorted list)
    if (currentIndex >= 0 && currentIndex < AVAILABLE_EPISODES.length - 1) {
      const nextEpisodeNumber = AVAILABLE_EPISODES[currentIndex + 1];
      return {
        number: nextEpisodeNumber,
        title: `Future Dance Anthems with Mario ${nextEpisodeNumber}`,
        audioUrl: '' // Will be fetched from RSS when played
      };
    }
    return null;
  }, []);

  // Fetch episode URL from RSS feed
  const fetchEpisodeUrl = useCallback(async (episodeNumber: number): Promise<string | null> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const rssUrl = `https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml?t=${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('rss-feed-fetch', {
        body: { url: rssUrl }
      });

      if (error || !data?.content) return null;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.content, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      for (const item of Array.from(items)) {
        const title = item.querySelector('title')?.textContent || '';
        const match = title.match(/(\d+)(?:\s*-|\s*:|$)/);
        if (match && parseInt(match[1]) === episodeNumber) {
          return item.querySelector('enclosure')?.getAttribute('url') || null;
        }
      }
    } catch (error) {
      console.error('Error fetching episode URL:', error);
    }
    return null;
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.crossOrigin = 'anonymous';
    audio.muted = false;
    audio.volume = 1;

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePlaying = () => {
      clearLiveAttemptTimeout();
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleWaiting = () => setState(prev => prev.source === 'live' ? { ...prev, isLoading: true } : prev);
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const handleLoadedMetadata = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setState(prev => ({ ...prev, duration: nextDuration }));
    };
    const handleCanPlay = () => {
      clearLiveAttemptTimeout();
      setState(prev => prev.source === 'live' ? { ...prev, isLoading: false } : prev);
    };
    const handleStalled = () => setState(prev => prev.source === 'live' ? { ...prev, isLoading: true } : prev);
    
    const handleEnded = async () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      
      // Autoplay next episode if enabled and playing an episode
      if (autoplayEnabled && state.source === 'episode' && state.episodeInfo) {
        const nextEp = getNextEpisode(state.episodeInfo.number);
        if (nextEp) {
          console.log(`🔄 Autoplay: Loading episode ${nextEp.number}`);
          
          // Show toast notification
          toast.info(`Loading Episode ${nextEp.number}`, {
            description: 'Autoplay is finding the next episode...',
            icon: '🎵',
            duration: 3000,
          });
          
          const audioUrl = await fetchEpisodeUrl(nextEp.number);
          if (audioUrl) {
            toast.success(`Now playing Episode ${nextEp.number}`, {
              description: nextEp.title,
              icon: '▶️',
              duration: 4000,
            });
            
            playEpisode({
              number: nextEp.number,
              title: nextEp.title,
              audioUrl
            });
          } else {
            toast.error('Could not load next episode', {
              description: 'Autoplay stopped - episode not found',
              duration: 4000,
            });
          }
        } else {
          toast.info('Playlist complete', {
            description: 'No more episodes available',
            icon: '✅',
            duration: 3000,
          });
        }
      }
    };
    
    const handleError = () => {
      console.error('Audio error, trying next URL');
      clearLiveAttemptTimeout();
      if (state.source === 'live' && currentUrlIndexRef.current < streamUrlsRef.current.length - 1) {
        tryStreamAtIndex(currentUrlIndexRef.current + 1, streamUrlsRef.current);
      } else {
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      clearLiveAttemptTimeout();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [autoplayEnabled, clearLiveAttemptTimeout, fetchEpisodeUrl, getNextEpisode, playEpisode, state.episodeInfo, state.source, tryStreamAtIndex]);

  // Some browsers can throttle `timeupdate`; keep episode progress in sync while playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.source !== 'episode' || !state.isPlaying) return;

    const interval = window.setInterval(() => {
      setState(prev => {
        if (prev.source !== 'episode') return prev;

        const nextTime = audio.currentTime || 0;
        const nextDuration = Number.isFinite(audio.duration) ? audio.duration : prev.duration;

        // Avoid excessive renders when the delta is tiny
        if (Math.abs(prev.currentTime - nextTime) < 0.25 && Math.abs((prev.duration || 0) - (nextDuration || 0)) < 0.5) {
          return prev;
        }

        return { ...prev, currentTime: nextTime, duration: nextDuration };
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [state.source, state.isPlaying]);

  return (
    <AudioPlayerContext.Provider
      value={{
        ...state,
        playLiveStream,
        primeLiveStream,
        playEpisode,
        pause,
        resume,
        seek,
        setVolume,
        closePlayer,
        toggleAutoplay,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} preload="auto" />
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
