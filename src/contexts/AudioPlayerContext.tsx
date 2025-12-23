import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';

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
}

interface AudioPlayerContextType extends AudioPlayerState {
  playLiveStream: (streamUrls: string[]) => void;
  playEpisode: (info: EpisodeInfo) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  closePlayer: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const STREAM_URLS = [
  "http://s9.myradiostream.com:14296/;", 
  "http://s9.myradiostream.com:14296/stream", 
  "http://s9.myradiostream.com:14296", 
  "https://live-radio-stream.online/dance-one-radio.mp3"
];

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
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
  });

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [streamUrls, setStreamUrls] = useState<string[]>(STREAM_URLS);

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

  const tryNextUrl = useCallback(() => {
    if (currentUrlIndex < streamUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentUrlIndex, streamUrls.length]);

  const playLiveStream = useCallback((urls: string[]) => {
    if (!audioRef.current) return;
    
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

    audioRef.current.src = urls[0];
    audioRef.current.load();
    audioRef.current.play().catch(err => {
      console.error('Error playing live stream:', err);
      if (tryNextUrl()) {
        audioRef.current!.src = urls[currentUrlIndex + 1];
        audioRef.current!.load();
        audioRef.current!.play();
      }
    });
  }, [tryNextUrl, currentUrlIndex]);

  const playEpisode = useCallback((info: EpisodeInfo) => {
    if (!audioRef.current) return;
    
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
  }, []);

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
    setState(prev => ({
      ...prev,
      source: null,
      isPlaying: false,
      isVisible: false,
      currentTime: 0,
      duration: 0,
      episodeInfo: null,
    }));
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const handleLoadedMetadata = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setState(prev => ({ ...prev, duration: nextDuration, isLoading: false }));
    };
    const handleEnded = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleError = () => {
      console.error('Audio error, trying next URL');
      if (state.source === 'live' && tryNextUrl()) {
        audio.src = streamUrls[currentUrlIndex + 1];
        audio.load();
        audio.play();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.source, tryNextUrl, streamUrls, currentUrlIndex]);

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
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
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
