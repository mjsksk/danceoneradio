import { useCallback, useEffect, useState } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { PRIMARY_STREAM_URLS } from '@/config/streamUrls';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';

const DESKTOP_STREAM_URLS = [
  'https://s9.myradiostream.com/:14296/listen.mp3',
  'http://s9.myradiostream.com:14296/stream',
  'http://s9.myradiostream.com:14296/;',
  'http://s9.myradiostream.com:14296',
];

const STREAM_START_TIMEOUT_MS = 4000;

const getAudioCrossOrigin = (url: string) => (
  url.includes('listen.mp3') ? 'anonymous' : null
);

let desktopAudio: HTMLAudioElement | null = null;
let desktopStreamIndex = 0;
let desktopStartTimeout: number | null = null;
const desktopListeners = new Set<(state: { isPlaying: boolean; isLoading: boolean; hasStarted: boolean }) => void>();
let desktopState = {
  isPlaying: false,
  isLoading: false,
  hasStarted: false,
};

const matchesAudioSource = (audio: HTMLAudioElement, url: string) => {
  const currentSource = audio.currentSrc || audio.src;
  if (!currentSource) {
    return false;
  }

  return currentSource === url || currentSource.startsWith(url);
};

const emitDesktopState = () => {
  desktopListeners.forEach((listener) => listener({ ...desktopState }));
};

const clearDesktopTimeout = () => {
  if (desktopStartTimeout !== null) {
    window.clearTimeout(desktopStartTimeout);
    desktopStartTimeout = null;
  }
};

const ensureDesktopAudio = () => {
  if (desktopAudio || typeof window === 'undefined') {
    return desktopAudio;
  }

  desktopAudio = new Audio();
  desktopAudio.volume = 0.7;
  desktopAudio.preload = 'metadata';
  desktopAudio.crossOrigin = getAudioCrossOrigin(DESKTOP_STREAM_URLS[0]);

  desktopAudio.addEventListener('playing', () => {
    clearDesktopTimeout();
    desktopState = { ...desktopState, isPlaying: true, isLoading: false, hasStarted: true };
    emitDesktopState();
  });

  desktopAudio.addEventListener('pause', () => {
    clearDesktopTimeout();
    desktopState = { ...desktopState, isPlaying: false, isLoading: false };
    emitDesktopState();
  });

  desktopAudio.addEventListener('waiting', () => {
    desktopState = { ...desktopState, isLoading: true };
    emitDesktopState();
  });

  desktopAudio.addEventListener('stalled', () => {
    desktopState = { ...desktopState, isLoading: true };
    emitDesktopState();
  });

  desktopAudio.addEventListener('error', () => {
    clearDesktopTimeout();
    desktopState = { ...desktopState, isPlaying: false, isLoading: false };
    emitDesktopState();
  });

  return desktopAudio;
};

const tryStartDesktopStream = async () => {
  const audio = ensureDesktopAudio();
  if (!audio) {
    return;
  }

  clearDesktopTimeout();

  if (desktopStreamIndex >= DESKTOP_STREAM_URLS.length) {
    desktopStreamIndex = 0;
    desktopState = { ...desktopState, isPlaying: false, isLoading: false };
    emitDesktopState();
    return;
  }

  desktopState = { ...desktopState, isLoading: true };
  emitDesktopState();

  const nextUrl = DESKTOP_STREAM_URLS[desktopStreamIndex];
  const alreadyPrimed = matchesAudioSource(audio, nextUrl);

  audio.crossOrigin = getAudioCrossOrigin(nextUrl);

  if (!alreadyPrimed) {
    audio.pause();
    audio.src = nextUrl;
    audio.load();
  } else if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
    audio.load();
  }

  desktopStartTimeout = window.setTimeout(() => {
    if (!desktopState.isPlaying) {
      desktopStreamIndex += 1;
      void tryStartDesktopStream();
    }
  }, STREAM_START_TIMEOUT_MS);

  try {
    await audio.play();
    desktopState = { ...desktopState, hasStarted: true };
    emitDesktopState();
  } catch (error) {
    desktopStreamIndex += 1;
    void tryStartDesktopStream();
  }
};

const primeDesktopStream = () => {
  const audio = ensureDesktopAudio();
  if (!audio || audio.src) {
    return;
  }

  audio.src = DESKTOP_STREAM_URLS[0];
  audio.load();
};

export const useLiveRadioPlayer = (streamUrls: string[] = [...PRIMARY_STREAM_URLS]) => {
  const audioPlayer = useAudioPlayer();
  const { isDesktop, isElectronDesktop } = useDesktopIntegration();
  const [desktopPlaybackState, setDesktopPlaybackState] = useState(desktopState);
  const usesDesktopAudioBridge = isDesktop && isElectronDesktop;

  const isLive = audioPlayer.source === 'live';
  const isPlaying = usesDesktopAudioBridge ? desktopPlaybackState.isPlaying : isLive && audioPlayer.isPlaying;
  const isLoading = usesDesktopAudioBridge ? desktopPlaybackState.isLoading : isLive && audioPlayer.isLoading;

  useEffect(() => {
    if (!usesDesktopAudioBridge) {
      return;
    }

    primeDesktopStream();

    const listener = (state: typeof desktopState) => {
      setDesktopPlaybackState(state);
    };

    desktopListeners.add(listener);
    listener(desktopState);

    return () => {
      desktopListeners.delete(listener);
    };
  }, [usesDesktopAudioBridge]);

  const handlePlayPause = useCallback(async () => {
    if (usesDesktopAudioBridge) {
      const audio = ensureDesktopAudio();
      if (!audio) return;

      if (desktopState.isPlaying) {
        audio.pause();
        return;
      }

      if (audio.src && desktopState.hasStarted) {
        desktopState = { ...desktopState, isLoading: true };
        emitDesktopState();
        try {
          await audio.play();
        } catch {
          desktopStreamIndex = 0;
          await tryStartDesktopStream();
        }
        return;
      }

      desktopStreamIndex = 0;
      await tryStartDesktopStream();
      return;
    }

    if (isLive) {
      if (audioPlayer.isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.resume();
      }
    } else {
      audioPlayer.playLiveStream(streamUrls);
    }
  }, [audioPlayer, isLive, streamUrls, usesDesktopAudioBridge]);

  const primeLiveStream = useCallback(async () => {
    if (usesDesktopAudioBridge) {
      primeDesktopStream();
      return;
    }

    const audio = audioPlayer.audioRef.current;
    if (!audio || audio.src) {
      return;
    }

      const preloadUrls = streamUrls.length > 0 ? streamUrls : [...PRIMARY_STREAM_URLS];
      audio.preload = 'auto';
      audio.crossOrigin = getAudioCrossOrigin(preloadUrls[0]);
      audio.src = preloadUrls[0];
      audio.load();
  }, [audioPlayer.audioRef, streamUrls, usesDesktopAudioBridge]);

  return {
    isPlaying,
    isLoading,
    handlePlayPause,
    primeLiveStream,
    streamTitle: audioPlayer.streamTitle,
    albumArt: audioPlayer.albumArt,
  };
};
