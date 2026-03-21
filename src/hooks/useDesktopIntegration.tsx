import { useCallback } from 'react';
import type { DownloadEvent, Update } from '@tauri-apps/plugin-updater';

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  onTogglePlayback: (callback: () => void) => void;
  onNextTrack: (callback: () => void) => void;
  onPreviousTrack: (callback: () => void) => void;
  updatePlaybackState: (isPlaying: boolean) => void;
  updateTrackInfo: (trackInfo: { title?: string; artist?: string }) => void;
  showNotification: (options: { title?: string; body: string }) => void;
  hideWindow: () => void;
  showWindow: () => void;
  playDesktopStream: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  resumeDesktopStream: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  pauseDesktopStream: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  stopDesktopStream: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  getDesktopStreamState: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  primeDesktopStream: () => Promise<{ isPlaying?: boolean; isLoading?: boolean }>;
  platform: string;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    __TAURI_INTERNALS__?: unknown;
  }
}

export const useDesktopIntegration = () => {
  const hasWindow = typeof window !== 'undefined';
  const isElectronDesktop = hasWindow && Boolean(window.electronAPI);
  const isTauriDesktop = hasWindow && ('__TAURI_INTERNALS__' in window || window.navigator.userAgent.includes('Tauri'));
  const isDesktop = isElectronDesktop || isTauriDesktop;

  const getUpdateErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }

    return 'Unable to check for updates right now.';
  };

  const updatePlaybackState = useCallback((isPlaying: boolean) => {
    if (isElectronDesktop) {
      window.electronAPI!.updatePlaybackState(isPlaying);
    }
  }, [isElectronDesktop]);

  const updateTrackInfo = useCallback((trackInfo: { title?: string; artist?: string }) => {
    if (isElectronDesktop) {
      window.electronAPI!.updateTrackInfo(trackInfo);
    }
  }, [isElectronDesktop]);

  const ensureNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (isElectronDesktop) {
      return true;
    }

    if (isTauriDesktop) {
      try {
        const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
        let permissionGranted = await isPermissionGranted();

        if (!permissionGranted) {
          permissionGranted = (await requestPermission()) === 'granted';
        }

        return permissionGranted;
      } catch (error) {
        console.error('Failed to request Tauri notification permission:', error);
        return false;
      }
    }

    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      return (await Notification.requestPermission()) === 'granted';
    } catch (error) {
      console.error('Failed to request browser notification permission:', error);
      return false;
    }
  }, [isElectronDesktop, isTauriDesktop]);

  const showNotification = useCallback((title: string, body: string) => {
    if (isElectronDesktop) {
      window.electronAPI!.showNotification({ title, body });
    } else if (isTauriDesktop) {
      void import('@tauri-apps/plugin-notification')
        .then(async ({ isPermissionGranted, requestPermission, sendNotification }) => {
          let permissionGranted = await isPermissionGranted();

          if (!permissionGranted) {
            permissionGranted = (await requestPermission()) === 'granted';
          }

          if (permissionGranted) {
            sendNotification({ title, body });
          }
        })
        .catch((error) => console.error('Failed to show Tauri notification:', error));
    } else {
      // Fallback to browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }, [isElectronDesktop, isTauriDesktop]);

  const registerMediaKeyHandlers = useCallback((
    onTogglePlayback: () => void,
    onNextTrack?: () => void,
    onPreviousTrack?: () => void
  ) => {
    if (!isElectronDesktop) return;

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
  }, [isElectronDesktop]);

  const getAppVersion = useCallback(async (): Promise<string | null> => {
    if (isElectronDesktop) {
      try {
        return await window.electronAPI!.getAppVersion();
      } catch (error) {
        console.error('Failed to get app version:', error);
        return null;
      }
    }

    if (isTauriDesktop) {
      try {
        const { getVersion } = await import('@tauri-apps/api/app');
        return await getVersion();
      } catch (error) {
        console.error('Failed to get Tauri app version:', error);
      }
    }

    return null;
  }, [isElectronDesktop, isTauriDesktop]);

  const getPlatform = useCallback((): string | null => {
    if (isElectronDesktop) {
      return window.electronAPI!.platform;
    }
    if (isTauriDesktop) {
      return 'desktop';
    }
    return null;
  }, [isElectronDesktop, isTauriDesktop]);

  const hideWindow = useCallback(() => {
    if (isElectronDesktop) {
      window.electronAPI!.hideWindow();
    }
    if (isTauriDesktop) {
      void import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('hide_to_tray'))
        .catch((error) => console.error('Failed to hide Tauri window:', error));
    }
  }, [isElectronDesktop, isTauriDesktop]);

  const showWindow = useCallback(() => {
    if (isElectronDesktop) {
      window.electronAPI!.showWindow();
    }
    if (isTauriDesktop) {
      void import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('restore_from_tray'))
        .catch((error) => console.error('Failed to show Tauri window:', error));
    }
  }, [isElectronDesktop, isTauriDesktop]);

  const playDesktopStream = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.playDesktopStream();
  }, [isElectronDesktop]);

  const resumeDesktopStream = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.resumeDesktopStream();
  }, [isElectronDesktop]);

  const pauseDesktopStream = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.pauseDesktopStream();
  }, [isElectronDesktop]);

  const stopDesktopStream = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.stopDesktopStream();
  }, [isElectronDesktop]);

  const getDesktopStreamState = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.getDesktopStreamState();
  }, [isElectronDesktop]);

  const primeDesktopStream = useCallback(async () => {
    if (!isElectronDesktop) return {};
    return window.electronAPI!.primeDesktopStream();
  }, [isElectronDesktop]);

  const checkForUpdates = useCallback(async (): Promise<
    | { status: 'unsupported' }
    | { status: 'up-to-date' }
    | { status: 'available'; update: Update; version: string; notes?: string; date?: string }
    | { status: 'not-configured'; message: string }
    | { status: 'error'; message: string }
  > => {
    if (!isTauriDesktop) {
      return { status: 'unsupported' };
    }

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (!update) {
        return { status: 'up-to-date' };
      }

      return {
        status: 'available',
        update,
        version: update.version,
        notes: update.body,
        date: update.date,
      };
    } catch (error) {
      const message = getUpdateErrorMessage(error);
      const normalized = message.toLowerCase();

      if (
        normalized.includes('endpoint') ||
        normalized.includes('updater') ||
        normalized.includes('not found') ||
        normalized.includes('404') ||
        normalized.includes('configuration') ||
        normalized.includes('manifest') ||
        normalized.includes('release json') ||
        normalized.includes('valid release json') ||
        normalized.includes('json from the remote')
      ) {
        return { status: 'not-configured', message };
      }

      return { status: 'error', message };
    }
  }, [isTauriDesktop]);

  const downloadAndInstallUpdate = useCallback(async (
    update: Update,
    onEvent?: (event: DownloadEvent) => void,
  ) => {
    if (!isTauriDesktop) {
      return;
    }

    await update.downloadAndInstall(onEvent);

    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  }, [isTauriDesktop]);

  return {
    isDesktop,
    isElectronDesktop,
    isTauriDesktop,
    updatePlaybackState,
    updateTrackInfo,
    showNotification,
    registerMediaKeyHandlers,
    getAppVersion,
    getPlatform,
    hideWindow,
    showWindow,
    ensureNotificationPermission,
    playDesktopStream,
    resumeDesktopStream,
    pauseDesktopStream,
    stopDesktopStream,
    getDesktopStreamState,
    primeDesktopStream,
    checkForUpdates,
    downloadAndInstallUpdate
  };
};
