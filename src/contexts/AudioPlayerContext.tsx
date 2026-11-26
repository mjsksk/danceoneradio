import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { toast } from 'sonner';
import { canMeasureOpenAIAds, openAIPixelDebugEnabled } from '@/utils/openaiPixel';
import { LiveStreamStartIntent } from '@/utils/openaiMeasurementPolicy';
import { EpisodePlaybackRecovery, freshEpisodeUrl } from '@/utils/episodePlaybackRecovery';

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
const LIVE_RESUME_RESTART_THRESHOLD_MS = 15000;
const LIVE_STALL_RECOVERY_DELAY_MS = 3500;
const LIVE_WATCHDOG_INTERVAL_MS = 8000;
const LIVE_WATCHDOG_STALE_THRESHOLD_MS = 12000;
const LIVE_ERROR_RETRY_DELAY_MS = 5000;

/** Append a cache-buster so the browser never serves stale buffered audio */
const bustStreamUrl = (url: string) => {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${Date.now()}`;
};

const getAudioCrossOrigin = (url: string) => (
  url.includes('listen.mp3') ? 'anonymous' : null
);

// Available episode numbers with pages (sorted descending)
const AVAILABLE_EPISODES = [403, 402, 401, 400, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389];

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const liveStartIntentRef = useRef(new LiveStreamStartIntent());
  const playbackSourceRef = useRef<'live' | 'episode' | null>(null);
  const episodeInfoRef = useRef<EpisodeInfo | null>(null);
  const episodeRecoveryRef = useRef(new EpisodePlaybackRecovery());
  const episodePlaybackRequestedRef = useRef(false);
  const episodeAttemptTokenRef = useRef(0);
  const episodeRestorePositionRef = useRef<number | null>(null);
  
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
  const livePauseTimestampRef = useRef<number | null>(null);
  const liveRecoveryTimeoutRef = useRef<number | null>(null);
  const livePauseExpiryTimeoutRef = useRef<number | null>(null);
  const liveErrorRetryTimeoutRef = useRef<number | null>(null);
  const liveReconnectInProgressRef = useRef(false);
  const manualPauseRequestedRef = useRef(false);
  const liveUserPausedRef = useRef(false);
  const lastTimeupdateRef = useRef<number>(0);
  const lastLiveProgressRef = useRef<number>(0);
  const liveLoadingSinceRef = useRef<number | null>(null);

  const matchesAudioSource = useCallback((audio: HTMLAudioElement, url: string) => {
    const currentSource = audio.currentSrc || audio.src;
    if (!currentSource) return false;
    return currentSource === url || currentSource.startsWith(url);
  }, []);

  const clearStreamStartTimeout = useCallback(() => {
    if (streamStartTimeoutRef.current !== null) {
      window.clearTimeout(streamStartTimeoutRef.current);
      streamStartTimeoutRef.current = null;
    }
  }, []);

  const clearLiveRecoveryTimeout = useCallback(() => {
    if (liveRecoveryTimeoutRef.current !== null) {
      window.clearTimeout(liveRecoveryTimeoutRef.current);
      liveRecoveryTimeoutRef.current = null;
    }
  }, []);

  const clearLivePauseExpiryTimeout = useCallback(() => {
    if (livePauseExpiryTimeoutRef.current !== null) {
      window.clearTimeout(livePauseExpiryTimeoutRef.current);
      livePauseExpiryTimeoutRef.current = null;
    }
  }, []);

  const clearLiveErrorRetryTimeout = useCallback(() => {
    if (liveErrorRetryTimeoutRef.current !== null) {
      window.clearTimeout(liveErrorRetryTimeoutRef.current);
      liveErrorRetryTimeoutRef.current = null;
    }
  }, []);

  const cancelStreamAttempts = useCallback(() => {
    episodePlaybackRequestedRef.current = false;
    episodeRecoveryRef.current.cancel();
    episodeAttemptTokenRef.current += 1;
    episodeRestorePositionRef.current = null;
    liveStartIntentRef.current.cancel();
    streamAttemptTokenRef.current += 1;
    liveReconnectInProgressRef.current = false;
    manualPauseRequestedRef.current = false;
    clearStreamStartTimeout();
    clearLiveRecoveryTimeout();
    clearLivePauseExpiryTimeout();
    clearLiveErrorRetryTimeout();
  }, [clearLivePauseExpiryTimeout, clearLiveRecoveryTimeout, clearStreamStartTimeout, clearLiveErrorRetryTimeout]);

  const stopFailedEpisode = useCallback(() => {
    episodePlaybackRequestedRef.current = false;
    episodeRecoveryRef.current.cancel();
    episodeAttemptTokenRef.current += 1;
    episodeRestorePositionRef.current = null;
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    toast.error('Episode audio could not connect. Please press Play to try again.');
  }, []);

  const loadEpisodeAudio = useCallback((info: EpisodeInfo, position = 0, fresh = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    const token = ++episodeAttemptTokenRef.current;
    episodeRestorePositionRef.current = position > 0 ? position : null;
    setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
    audio.pause();
    audio.crossOrigin = 'anonymous';
    audio.src = fresh ? freshEpisodeUrl(info.audioUrl, Date.now()) : info.audioUrl;
    audio.load();
    void audio.play().catch(error => {
      if (episodeAttemptTokenRef.current !== token || playbackSourceRef.current !== 'episode'
        || !episodePlaybackRequestedRef.current) return;
      if (error.name === 'NotAllowedError') {
        stopFailedEpisode();
        return;
      }
      // Media errors and missing data are handled by bounded episode recovery.
      setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
    });
  }, [stopFailedEpisode]);

  const recoverEpisode = useCallback(() => {
    const audio = audioRef.current;
    const info = episodeInfoRef.current;
    if (!audio || !info || playbackSourceRef.current !== 'episode'
      || !episodePlaybackRequestedRef.current) return;
    const position = episodeRestorePositionRef.current ?? audio.currentTime;
    if (!episodeRecoveryRef.current.retry(Date.now(), position)) {
      stopFailedEpisode();
      return;
    }
    loadEpisodeAudio(info, position, true);
  }, [loadEpisodeAudio, stopFailedEpisode]);

  const markLiveProgress = useCallback(() => {
    const now = Date.now();
    lastTimeupdateRef.current = now;
    lastLiveProgressRef.current = now;
    liveLoadingSinceRef.current = null;
  }, []);

  // Fetch stream metadata for live stream
  useEffect(() => {
    // Keep "Now Playing" live info fresh even when nothing is playing yet
    if (state.source === 'episode') return;
    
    const fetchMetadata = async () => {
      try {
        const metadata = await RadioStreamService.getStreamMetadata();
        const formattedTitle = RadioStreamService.formatTitle(metadata);
        setState(prev => ({ ...prev, streamTitle: formattedTitle }));
        
        // Album art comes with the shared now-playing row (looked up once server-side)
        const art = (metadata as any)?.albumArt;
        if (art) {
          setState(prev => ({ ...prev, albumArt: art }));
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
    liveReconnectInProgressRef.current = true;

    if (urlIndex >= urls.length) {
      clearStreamStartTimeout();
      // Instead of giving up, schedule a retry from the first URL
      console.warn('All stream URLs exhausted, retrying in', LIVE_ERROR_RETRY_DELAY_MS, 'ms');
      liveErrorRetryTimeoutRef.current = window.setTimeout(() => {
        if (streamAttemptTokenRef.current !== attemptToken) return;
        attemptLiveStream(urls, 0, attemptToken);
      }, LIVE_ERROR_RETRY_DELAY_MS);
      return;
    }

    setCurrentUrlIndex(urlIndex);
    clearStreamStartTimeout();

    const nextUrl = urls[urlIndex];

    // ALWAYS force-reload with cache-busting to avoid stale buffered audio
    audio.crossOrigin = getAudioCrossOrigin(nextUrl);
    audio.pause();
    audio.src = bustStreamUrl(nextUrl);
    audio.load();

    // Reset the watchdog timestamps so the liveness check starts fresh
    const now = Date.now();
    lastTimeupdateRef.current = now;
    lastLiveProgressRef.current = now;
    liveLoadingSinceRef.current = now;

    streamStartTimeoutRef.current = window.setTimeout(() => {
      if (streamAttemptTokenRef.current !== attemptToken) return;

      const playbackStarted =
        audio.currentTime > 0 ||
        (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);

      if (!playbackStarted) {
        console.warn(`Stream startup timed out for URL ${urlIndex + 1}, trying next source`);
        attemptLiveStream(urls, urlIndex + 1, attemptToken);
      }
    }, STREAM_START_TIMEOUT_MS);

    audio.play()
      .then(() => {
        if (streamAttemptTokenRef.current !== attemptToken) return;

        livePauseTimestampRef.current = null;
        clearLivePauseExpiryTimeout();
        clearStreamStartTimeout();
        markLiveProgress();
      })
      .catch(err => {
        if (streamAttemptTokenRef.current !== attemptToken) return;

        clearStreamStartTimeout();
        console.error(`Error playing live stream URL ${urlIndex + 1}:`, err);
        attemptLiveStream(urls, urlIndex + 1, attemptToken);
      });
  }, [clearLivePauseExpiryTimeout, clearStreamStartTimeout, markLiveProgress]);

  const restartLiveStream = useCallback((preferredUrlIndex = 0, intentionalStart = false) => {
    if (!audioRef.current) return;

    playbackSourceRef.current = 'live';
    if (intentionalStart) liveStartIntentRef.current.arm();
    else liveStartIntentRef.current.cancel();

    const nextStreamUrls = streamUrls.length > 0 ? streamUrls : [...PRIMARY_STREAM_URLS];
    const safeUrlIndex = Math.max(0, Math.min(preferredUrlIndex, Math.max(0, nextStreamUrls.length - 1)));
    const attemptToken = streamAttemptTokenRef.current + 1;
    streamAttemptTokenRef.current = attemptToken;

    clearStreamStartTimeout();
    clearLiveRecoveryTimeout();
    clearLivePauseExpiryTimeout();
    clearLiveErrorRetryTimeout();
    livePauseTimestampRef.current = null;
    liveReconnectInProgressRef.current = true;
    liveUserPausedRef.current = false;
    liveLoadingSinceRef.current = Date.now();
    setCurrentUrlIndex(safeUrlIndex);
    setState(prev => ({
      ...prev,
      source: 'live',
      isLoading: true,
      isVisible: true,
      isPlaying: false,
      episodeInfo: null,
    }));

    attemptLiveStream(nextStreamUrls, safeUrlIndex, attemptToken);
  }, [attemptLiveStream, clearLiveErrorRetryTimeout, clearLivePauseExpiryTimeout, clearLiveRecoveryTimeout, clearStreamStartTimeout, streamUrls]);

  const expirePausedLiveBuffer = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    livePauseTimestampRef.current = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.src = '';
    audio.load();
    setState(prev => (
      prev.source === 'live'
        ? {
            ...prev,
            isPlaying: false,
            isLoading: false,
            currentTime: 0,
            duration: 0,
          }
        : prev
    ));
  }, []);

  const scheduleLivePauseExpiry = useCallback(() => {
    clearLivePauseExpiryTimeout();

    livePauseExpiryTimeoutRef.current = window.setTimeout(() => {
      expirePausedLiveBuffer();
    }, LIVE_RESUME_RESTART_THRESHOLD_MS);
  }, [clearLivePauseExpiryTimeout, expirePausedLiveBuffer]);

  const scheduleLiveRecovery = useCallback((urlIndex: number) => {
    clearLiveRecoveryTimeout();

    liveRecoveryTimeoutRef.current = window.setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const stillNeedsRecovery =
        !audio.paused &&
        !audio.ended &&
        audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;

      if (stillNeedsRecovery) {
        const nextUrlIndex = streamUrls.length > 0
          ? (urlIndex + 1) % streamUrls.length
          : 0;
        restartLiveStream(nextUrlIndex);
      }
    }, LIVE_STALL_RECOVERY_DELAY_MS);
  }, [clearLiveRecoveryTimeout, restartLiveStream, streamUrls]);

  const playLiveStream = useCallback((urls: string[]) => {
    if (!audioRef.current) return;

    cancelStreamAttempts();
    playbackSourceRef.current = 'live';
    liveStartIntentRef.current.arm();

    const nextStreamUrls = urls.length > 0 ? urls : [...PRIMARY_STREAM_URLS];
    const attemptToken = streamAttemptTokenRef.current + 1;
    streamAttemptTokenRef.current = attemptToken;

    setStreamUrls(nextStreamUrls);
    setCurrentUrlIndex(0);
    livePauseTimestampRef.current = null;
    liveReconnectInProgressRef.current = true;
    liveUserPausedRef.current = false;
    liveLoadingSinceRef.current = Date.now();
    clearLivePauseExpiryTimeout();
    clearLiveErrorRetryTimeout();
    
    setState(prev => ({
      ...prev,
      source: 'live',
      isPlaying: false,
      isLoading: true,
      isVisible: true,
      episodeInfo: null,
      albumArt: null,
    }));

    attemptLiveStream(nextStreamUrls, 0, attemptToken);
  }, [attemptLiveStream, cancelStreamAttempts, clearLiveErrorRetryTimeout, clearLivePauseExpiryTimeout]);

  const playEpisode = useCallback((info: EpisodeInfo) => {
    if (!audioRef.current) return;

    cancelStreamAttempts();
    playbackSourceRef.current = 'episode';
    episodeInfoRef.current = info;
    episodePlaybackRequestedRef.current = true;
    episodeRecoveryRef.current.start(Date.now(), 0);
    liveUserPausedRef.current = false;
    
    setState(prev => ({
      ...prev,
      source: 'episode',
      isPlaying: false,
      isLoading: true,
      currentTime: 0,
      duration: 0,
      isVisible: true,
      episodeInfo: info,
      streamTitle: info.title,
      albumArt: '/lovable-uploads/fda-background.jpg',
    }));

    loadEpisodeAudio(info);
  }, [cancelStreamAttempts, loadEpisodeAudio]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    cancelStreamAttempts();
    manualPauseRequestedRef.current = true;
    if (state.source === 'live') {
      liveUserPausedRef.current = true;
      livePauseTimestampRef.current = Date.now();
      scheduleLivePauseExpiry();
    }
    audioRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
  }, [cancelStreamAttempts, scheduleLivePauseExpiry, state.source]);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearStreamStartTimeout();
    clearLivePauseExpiryTimeout();
    manualPauseRequestedRef.current = false;

    if (state.source === 'live') {
      // Always restart live stream fresh to avoid stale buffered audio
      liveUserPausedRef.current = false;
      restartLiveStream(0, true);
      return;
    }

    const info = episodeInfoRef.current;
    if (playbackSourceRef.current !== 'episode' || !info) return;
    episodePlaybackRequestedRef.current = true;
    episodeRecoveryRef.current.start(Date.now(), audio.currentTime);
    setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
    if (audio.error || audio.readyState === HTMLMediaElement.HAVE_NOTHING || !audio.src) {
      loadEpisodeAudio(info, audio.currentTime, true);
      return;
    }
    const token = ++episodeAttemptTokenRef.current;
    void audio.play().catch(error => {
      if (episodeAttemptTokenRef.current !== token || playbackSourceRef.current !== 'episode'
        || !episodePlaybackRequestedRef.current) return;
      if (error.name === 'NotAllowedError') stopFailedEpisode();
      else recoverEpisode();
    });
  }, [clearLivePauseExpiryTimeout, clearStreamStartTimeout, restartLiveStream, state.source, loadEpisodeAudio, recoverEpisode, stopFailedEpisode]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    if (playbackSourceRef.current === 'episode' && audioRef.current.readyState === HTMLMediaElement.HAVE_NOTHING) {
      episodeRestorePositionRef.current = time;
      setState(prev => ({ ...prev, currentTime: time }));
      return;
    }
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
    playbackSourceRef.current = null;
    episodeInfoRef.current = null;
    liveUserPausedRef.current = false;
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
      if (playbackSourceRef.current === 'live' && liveUserPausedRef.current) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        return;
      }

      // A play request the app did not make (headphones, lock screen, media
      // keys) is an intentional episode resume, watched like any other.
      if (playbackSourceRef.current === 'episode' && !episodePlaybackRequestedRef.current
        && !audio.paused && episodeInfoRef.current) {
        episodePlaybackRequestedRef.current = true;
        episodeRecoveryRef.current.start(Date.now(), audio.currentTime);
      }

      // `play` is only a request; it fires even with zero decoded audio data.
      setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
    };
    const handlePlaying = () => {
      if ((playbackSourceRef.current === 'live' && liveUserPausedRef.current)
        || (playbackSourceRef.current === 'episode' && !episodePlaybackRequestedRef.current)) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        return;
      }
      if (audio.paused || audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      // Consume before checking consent/availability: denied or blocked starts
      // must never be replayed when consent changes or buffering ends later.
      if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
        && liveStartIntentRef.current.consume(playbackSourceRef.current)) {
        try {
          if (canMeasureOpenAIAds()) {
            window.oaiq?.(
              'measure',
              'custom',
              { type: 'custom' },
              { custom_event_name: 'live_stream_started' },
            );
            if (openAIPixelDebugEnabled()) console.debug('[OpenAI Pixel] live_stream_started');
          }
        } catch {
          // Optional measurement must never interrupt live playback.
          if (openAIPixelDebugEnabled()) console.debug('[OpenAI Pixel] Event unavailable; playback continues.');
        }
      }

      liveReconnectInProgressRef.current = false;
      clearLivePauseExpiryTimeout();
      clearLiveRecoveryTimeout();
      clearStreamStartTimeout();
      markLiveProgress();
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };
    const handlePause = () => {
      const wasManualPause = manualPauseRequestedRef.current;
      manualPauseRequestedRef.current = false;
      // A pause queued by replacing a source must not reset the new load.
      if (!audio.paused) return;
      if (playbackSourceRef.current === 'episode' && episodePlaybackRequestedRef.current) {
        // Still paused with no load in flight: the listener paused from outside
        // the page (headphones, lock screen, media keys). Honour it like the
        // in-app Pause so the watchdog never restarts the episode.
        episodePlaybackRequestedRef.current = false;
        episodeRecoveryRef.current.cancel();
        episodeAttemptTokenRef.current += 1;
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        return;
      }
      clearLiveRecoveryTimeout();
      if (state.source === 'live' && !liveReconnectInProgressRef.current && wasManualPause) {
        liveUserPausedRef.current = true;
        livePauseTimestampRef.current = Date.now();
        scheduleLivePauseExpiry();
      }
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    };
    const handleTimeUpdate = () => {
      markLiveProgress();
      const episodeAdvanced = playbackSourceRef.current === 'episode'
        && episodeRecoveryRef.current.observe(Date.now(), audio.currentTime);
      setState(prev => {
        const nextTime = audio.currentTime;
        if (prev.source === 'live' && !audio.paused) {
          return { ...prev, currentTime: nextTime, isPlaying: true, isLoading: false };
        }
        if (prev.source === 'episode' && episodeAdvanced && !audio.paused
          && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          return { ...prev, currentTime: nextTime, isPlaying: true, isLoading: false };
        }

        return { ...prev, currentTime: nextTime };
      });
    };
    const handleLoadedMetadata = () => {
      if (playbackSourceRef.current === 'episode') {
        const position = episodeRestorePositionRef.current;
        if (position !== null && episodePlaybackRequestedRef.current) {
          episodeRestorePositionRef.current = null;
          audio.currentTime = Number.isFinite(audio.duration)
            ? Math.min(position, Math.max(0, audio.duration - 0.1)) : position;
          episodeRecoveryRef.current.observe(Date.now(), audio.currentTime);
        }
        setState(prev => ({ ...prev, duration: Number.isFinite(audio.duration) ? audio.duration : 0 }));
        return;
      }
      const preserveLivePauseExpiry =
        state.source === 'live' &&
        audio.paused &&
        livePauseTimestampRef.current !== null;

      if (!preserveLivePauseExpiry) {
        clearLivePauseExpiryTimeout();
      }
      clearLiveRecoveryTimeout();
      clearStreamStartTimeout();
      markLiveProgress();
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setState(prev => ({
        ...prev,
        duration: nextDuration,
        isLoading: false,
        isPlaying: prev.source === 'live' && !audio.paused ? true : prev.isPlaying,
      }));
    };
    const handleCanPlay = () => {
      if (playbackSourceRef.current === 'episode') return;
      const preserveLivePauseExpiry =
        state.source === 'live' &&
        audio.paused &&
        livePauseTimestampRef.current !== null;

      if (!preserveLivePauseExpiry) {
        clearLivePauseExpiryTimeout();
      }
      clearLiveRecoveryTimeout();
      clearStreamStartTimeout();
      markLiveProgress();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: prev.source === 'live' && !audio.paused ? true : prev.isPlaying,
      }));
    };
    const handleProgress = () => {
      if (state.source !== 'live') return;
      markLiveProgress();
      if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
      }
    };
    const handleWaiting = () => {
      if (playbackSourceRef.current === 'episode') {
        if (episodePlaybackRequestedRef.current) {
          setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
        }
        return;
      }
      if (state.source !== 'live' || audio.paused) return;

      liveLoadingSinceRef.current ??= Date.now();
      setState(prev => ({ ...prev, isLoading: true }));
      if (liveReconnectInProgressRef.current) return;
      scheduleLiveRecovery(currentUrlIndex);
    };
    const handleStalled = () => {
      if (playbackSourceRef.current === 'episode') {
        // `stalled` can happen after enough data is buffered. The watchdog
        // observes actual media time rather than restarting healthy playback.
        if (episodePlaybackRequestedRef.current && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          setState(prev => ({ ...prev, isPlaying: false, isLoading: true }));
        }
        return;
      }
      if (state.source !== 'live' || audio.paused) return;

      liveLoadingSinceRef.current ??= Date.now();
      setState(prev => ({ ...prev, isLoading: true }));
      if (liveReconnectInProgressRef.current) return;
      scheduleLiveRecovery(currentUrlIndex);
    };
    const handleSuspendLikeState = () => {
      if (state.source !== 'live' || audio.paused) return;

      liveLoadingSinceRef.current ??= Date.now();
      setState(prev => ({ ...prev, isLoading: true }));
      if (liveReconnectInProgressRef.current) return;
      scheduleLiveRecovery(currentUrlIndex);
    };
    
    const handleEnded = async () => {
      liveReconnectInProgressRef.current = false;
      clearLivePauseExpiryTimeout();
      clearLiveRecoveryTimeout();
      if (state.source === 'live') {
        if (liveUserPausedRef.current) {
          setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
          return;
        }

        restartLiveStream(currentUrlIndex);
        return;
      }

      episodePlaybackRequestedRef.current = false;
      episodeRecoveryRef.current.cancel();
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
      
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
      if (!audio.error) return;
      if (playbackSourceRef.current === 'episode') {
        if (episodePlaybackRequestedRef.current) recoverEpisode();
        else setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        return;
      }
      console.error('Audio error, trying next URL');

      if (state.source === 'live' && liveUserPausedRef.current) {
        liveReconnectInProgressRef.current = false;
        setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        return;
      }

      liveReconnectInProgressRef.current = true;
      clearLivePauseExpiryTimeout();
      clearLiveRecoveryTimeout();
      if (state.source === 'live') {
        const nextUrlIndex = currentUrlIndex + 1;
        const attemptToken = streamAttemptTokenRef.current;
        clearStreamStartTimeout();

        // attemptLiveStream now handles exhaustion with auto-retry
        attemptLiveStream(streamUrls, nextUrlIndex, attemptToken);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspendLikeState);
    audio.addEventListener('abort', handleSuspendLikeState);
    audio.addEventListener('emptied', handleSuspendLikeState);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspendLikeState);
      audio.removeEventListener('abort', handleSuspendLikeState);
      audio.removeEventListener('emptied', handleSuspendLikeState);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.source, state.episodeInfo, autoplayEnabled, streamUrls, currentUrlIndex, getNextEpisode, fetchEpisodeUrl, playEpisode, attemptLiveStream, clearLivePauseExpiryTimeout, clearLiveRecoveryTimeout, clearStreamStartTimeout, restartLiveStream, scheduleLivePauseExpiry, scheduleLiveRecovery, markLiveProgress, recoverEpisode]);

  // Episode starts/resumes must not remain silently frozen or loading forever.
  useEffect(() => {
    const watchdog = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || playbackSourceRef.current !== 'episode' || !episodePlaybackRequestedRef.current) return;
      episodeRecoveryRef.current.observe(Date.now(), audio.currentTime);
      if (episodeRecoveryRef.current.needsRecovery(Date.now())) recoverEpisode();
    }, 1000);
    return () => window.clearInterval(watchdog);
  }, [recoverEpisode]);

  useEffect(() => {
    return () => {
      cancelStreamAttempts();
      liveReconnectInProgressRef.current = false;
      clearLivePauseExpiryTimeout();
      clearLiveRecoveryTimeout();
    };
  }, [cancelStreamAttempts, clearLivePauseExpiryTimeout, clearLiveRecoveryTimeout]);

  // Liveness watchdog: if live playback or loading makes no forward progress,
  // force a fresh reconnect even when the audio element enters a weird state.
  useEffect(() => {
    if (state.source !== 'live') return;

    const watchdog = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const intentionallyPaused = liveUserPausedRef.current;
      if (intentionallyPaused) return;

      const loadingElapsed = liveLoadingSinceRef.current
        ? Date.now() - liveLoadingSinceRef.current
        : 0;
      const progressElapsed = Date.now() - lastLiveProgressRef.current;
      const unexpectedlyPaused = audio.paused && !liveReconnectInProgressRef.current;
      const stuckLoading = state.isLoading && loadingElapsed > LIVE_WATCHDOG_STALE_THRESHOLD_MS;
      const stalePlayback =
        !audio.paused &&
        progressElapsed > LIVE_WATCHDOG_STALE_THRESHOLD_MS;

      if (stuckLoading || stalePlayback || unexpectedlyPaused) {
        const nextUrlIndex = streamUrls.length > 0
          ? (currentUrlIndex + 1) % streamUrls.length
          : 0;
        console.warn(
          `Live stream watchdog restart: paused=${audio.paused} loading=${state.isLoading} progressElapsed=${progressElapsed} loadingElapsed=${loadingElapsed}`,
        );
        restartLiveStream(nextUrlIndex);
      }
    }, LIVE_WATCHDOG_INTERVAL_MS);

    return () => window.clearInterval(watchdog);
  }, [state.source, state.isLoading, currentUrlIndex, restartLiveStream, streamUrls]);

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
    }, 1000);

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
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
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
