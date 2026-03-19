import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { toast } from 'sonner';

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

const STREAM_URLS = [...PRIMARY_STREAM_URLS];
const STREAM_START_TIMEOUT_MS = 4500;

// Available episode numbers with pages (sorted descending)
const AVAILABLE_EPISODES = [403, 402, 401, 400, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389];

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
  const [streamUrls, setStreamUrls] = useState<string[]>(STREAM_URLS);
  const streamAttemptTokenRef = useRef(0);
  const streamStartTimeoutRef = useRef<number | null>(null);

  const clearStreamStartTimeout = useCallback(() => {
    if (streamStartTimeoutRef.current !== null) {
      window.clearTimeout(streamStartTimeoutRef.current);
      streamStartTimeoutRef.current = null;
    }
  }, []);

  const cancelStreamAttempts = useCallback(() => {
    streamAttemptTokenRef.current += 1;
    clearStreamStartTimeout();
  }, [clearStreamStartTimeout]);

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

  const attemptLiveStream = useCallback((urls: string[], urlIndex: number, attemptToken: number) => {
    const audio = audioRef.current;
    if (!audio || streamAttemptTokenRef.current !== attemptToken) return;

    if (urlIndex >= urls.length) {
      clearStreamStartTimeout();
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      return;
    }

    setCurrentUrlIndex(urlIndex);
    clearStreamStartTimeout();

    audio.pause();
    audio.src = urls[urlIndex];
    audio.load();

    streamStartTimeoutRef.current = window.setTimeout(() => {
      if (streamAttemptTokenRef.current !== attemptToken) return;

      const playbackStarted =
        !audio.paused ||
        audio.currentTime > 0 ||
        audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

      if (!playbackStarted) {
        console.warn(`Stream startup timed out for URL ${urlIndex + 1}, trying next source`);
        attemptLiveStream(urls, urlIndex + 1, attemptToken);
      }
    }, STREAM_START_TIMEOUT_MS);

    audio.play().catch(err => {
      if (streamAttemptTokenRef.current !== attemptToken) return;

      clearStreamStartTimeout();
      console.error(`Error playing live stream URL ${urlIndex + 1}:`, err);
      attemptLiveStream(urls, urlIndex + 1, attemptToken);
    });
  }, [clearStreamStartTimeout]);

  const playLiveStream = useCallback((urls: string[]) => {
    if (!audioRef.current) return;

    const nextStreamUrls = urls.length > 0 ? urls : [...PRIMARY_STREAM_URLS];
    const attemptToken = streamAttemptTokenRef.current + 1;
    streamAttemptTokenRef.current = attemptToken;

    setStreamUrls(nextStreamUrls);
    setCurrentUrlIndex(0);
    
    setState(prev => ({
      ...prev,
      source: 'live',
      isLoading: true,
      isVisible: true,
      episodeInfo: null,
      albumArt: null,
    }));

    attemptLiveStream(nextStreamUrls, 0, attemptToken);
  }, [attemptLiveStream]);

  const playEpisode = useCallback((info: EpisodeInfo) => {
    if (!audioRef.current) return;

    cancelStreamAttempts();
    
    setState(prev => ({
      ...prev,
      source: 'episode',
      isLoading: true,
      isVisible: true,
      episodeInfo: info,
      streamTitle: info.title,
      albumArt: '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png',
    }));

    audioRef.current.src = info.audioUrl;
    audioRef.current.load();
    audioRef.current.play().catch(err => {
      console.error('Error playing episode:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    });
  }, [cancelStreamAttempts]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    cancelStreamAttempts();
    audioRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [cancelStreamAttempts]);

  const resume = useCallback(() => {
    if (!audioRef.current) return;
    clearStreamStartTimeout();
    audioRef.current.play().catch(err => console.error('Error resuming:', err));
  }, [clearStreamStartTimeout]);

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
    cancelStreamAttempts();
    audioRef.current.pause();
    audioRef.current.src = '';
    setState(prev => ({
      ...prev,
      source: null,
      isPlaying: false,
      isVisible: false,
      currentTime: 0,
      duration: 0,
      episodeInfo: null,
    }));
  }, [cancelStreamAttempts]);

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

    const handlePlay = () => {
      clearStreamStartTimeout();
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };
    const handlePlaying = () => {
      clearStreamStartTimeout();
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const handleLoadedMetadata = () => {
      clearStreamStartTimeout();
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setState(prev => ({ ...prev, duration: nextDuration, isLoading: false }));
    };
    
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
      if (state.source === 'live') {
        const nextUrlIndex = currentUrlIndex + 1;
        const attemptToken = streamAttemptTokenRef.current;
        clearStreamStartTimeout();

        if (nextUrlIndex < streamUrls.length) {
          attemptLiveStream(streamUrls, nextUrlIndex, attemptToken);
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.source, state.episodeInfo, autoplayEnabled, streamUrls, currentUrlIndex, getNextEpisode, fetchEpisodeUrl, playEpisode, attemptLiveStream, clearStreamStartTimeout]);

  useEffect(() => {
    return () => {
      cancelStreamAttempts();
    };
  }, [cancelStreamAttempts]);

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
      <audio ref={audioRef} preload="none" />
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
