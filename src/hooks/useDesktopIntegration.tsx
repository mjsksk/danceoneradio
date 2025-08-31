import { useEffect, useCallback } from 'react';

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  onTogglePlayback: (callback: () => void) => void;
  onNextTrack: (callback: () => void) => void;
  onPreviousTrack: (callback: () => void) => void;
  updatePlaybackState: (isPlaying: boolean) => void;
  updateTrackInfo: (trackInfo: { title?: string; artist?: string }) => void;
  showNotification: (options: { title?: string; body: string }) => void;
  platform: string;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useDesktopIntegration = () => {
  const isDesktop = typeof window !== 'undefined' && window.electronAPI;

  const updatePlaybackState = useCallback((isPlaying: boolean) => {
    if (isDesktop) {
      window.electronAPI!.updatePlaybackState(isPlaying);
    }
  }, [isDesktop]);

  const updateTrackInfo = useCallback((trackInfo: { title?: string; artist?: string }) => {
    if (isDesktop) {
      window.electronAPI!.updateTrackInfo(trackInfo);
    }
  }, [isDesktop]);

  const showNotification = useCallback((title: string, body: string) => {
    if (isDesktop) {
      window.electronAPI!.showNotification({ title, body });
    } else {
      // Fallback to browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }, [isDesktop]);

  const registerMediaKeyHandlers = useCallback((
    onTogglePlayback: () => void,
    onNextTrack?: () => void,
    onPreviousTrack?: () => void
  ) => {
    if (!isDesktop) return;

    const electronAPI = window.electronAPI!;

    electronAPI.onTogglePlayback(onTogglePlayback);
    
    if (onNextTrack) {
      electronAPI.onNextTrack(onNextTrack);
    }
    
    if (onPreviousTrack) {
      electronAPI.onPreviousTrack(onPreviousTrack);
    }

    // Cleanup function
    return () => {
      electronAPI.removeAllListeners('toggle-playback');
      electronAPI.removeAllListeners('next-track');
      electronAPI.removeAllListeners('previous-track');
    };
  }, [isDesktop]);

  const getAppVersion = useCallback(async (): Promise<string | null> => {
    if (isDesktop) {
      try {
        return await window.electronAPI!.getAppVersion();
      } catch (error) {
        console.error('Failed to get app version:', error);
        return null;
      }
    }
    return null;
  }, [isDesktop]);

  const getPlatform = useCallback((): string | null => {
    if (isDesktop) {
      return window.electronAPI!.platform;
    }
    return null;
  }, [isDesktop]);

  return {
    isDesktop,
    updatePlaybackState,
    updateTrackInfo,
    showNotification,
    registerMediaKeyHandlers,
    getAppVersion,
    getPlatform
  };
};