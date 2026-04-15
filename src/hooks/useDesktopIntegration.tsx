import { useCallback, useEffect } from 'react';
import {
  detectDesktopPlatform,
  getDesktopPlatformName,
  getInstallerHandoffErrorMessage,
} from '@/utils/desktopPlatform';

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
  const desktopPlatform = isDesktop ? detectDesktopPlatform() : 'unknown';
  const desktopPlatformName = getDesktopPlatformName(desktopPlatform);

  const getUpdateErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }

    return 'Unable to check for updates right now.';
  };

  const getUpdateInstallErrorMessage = (error: unknown): string => {
    const message = getUpdateErrorMessage(error);
    const normalized = message.toLowerCase();

    if (normalized.includes('already on the latest') || normalized.includes('no update is currently available')) {
      return 'You are already on the latest version.';
    }

    if (normalized.includes('signature') || normalized.includes('verification')) {
      return 'The downloaded update could not be verified. Please try again after the release files finish syncing.';
    }

    if (
      normalized.includes('404') ||
      normalized.includes('not found') ||
      normalized.includes('download') ||
      normalized.includes('network') ||
      normalized.includes('timed out')
    ) {
      return 'The update package is not reachable right now. Please try again in a few minutes.';
    }

    if (
      normalized.includes('installer') ||
      normalized.includes('shell execute') ||
      normalized.includes('process') ||
      normalized.includes('launch') ||
      normalized.includes('access is denied')
    ) {
      return getInstallerHandoffErrorMessage(desktopPlatform);
    }

    return message || 'Unable to install the update right now.';
  };

  const updatePlaybackState = useCallback((isPlaying: boolean) => {
    if (isElectronDesktop) {
      window.electronAPI!.updatePlaybackState(isPlaying);
    }
    if (isTauriDesktop) {
      void import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('update_playback_state', { isPlaying }))
        .catch((error) => console.error('Failed to update Tauri playback state:', error));
    }
  }, [isElectronDesktop, isTauriDesktop]);

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
    if (isTauriDesktop) {
      let isDisposed = false;
      let unlistenToggle: (() => void) | null = null;

      void import('@tauri-apps/api/event')
        .then(async ({ listen }) => {
          const unlisten = await listen('desktop-toggle-playback', () => {
            onTogglePlayback();
          });

          if (isDisposed) {
            unlisten();
            return;
          }

          unlistenToggle = unlisten;
        })
        .catch((error) => console.error('Failed to register Tauri playback listeners:', error));

      return () => {
        isDisposed = true;
        unlistenToggle?.();
      };
    }

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
  }, [isElectronDesktop, isTauriDesktop]);

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
      return desktopPlatform;
    }
    return null;
  }, [desktopPlatform, isElectronDesktop, isTauriDesktop]);

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
    | { status: 'available'; version: string; notes?: string; date?: string }
    | { status: 'not-configured'; message: string }
    | { status: 'error'; message: string }
  > => {
    if (!isTauriDesktop) {
      return { status: 'unsupported' };
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const update = await invoke<null | {
        version: string;
        notes?: string | null;
        date?: string | null;
      }>('check_for_updates');

      if (!update) {
        return { status: 'up-to-date' };
      }

      return {
        status: 'available',
        version: update.version,
        notes: update.notes ?? undefined,
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
    onEvent?: (event:
      | { event: 'Started'; data: { contentLength?: number | null } }
      | { event: 'Progress'; data: { chunkLength: number; contentLength?: number | null } }
      | { event: 'Finished' }
    ) => void,
  ) => {
    if (!isTauriDesktop) {
      return;
    }

    const [{ invoke }, { listen }] = await Promise.all([
      import('@tauri-apps/api/core'),
      import('@tauri-apps/api/event'),
    ]);

    const unlisten = await listen<
      | { event: 'Started'; data: { contentLength?: number | null } }
      | { event: 'Progress'; data: { chunkLength: number; contentLength?: number | null } }
      | { event: 'Finished' }
    >('desktop-update-event', (event) => {
      onEvent?.(event.payload);
    });

    try {
      await invoke('install_update');
    } catch (error) {
      throw new Error(getUpdateInstallErrorMessage(error));
    } finally {
      unlisten();
    }
  }, [isTauriDesktop]);

  const getLaunchOnStartupEnabled = useCallback(async (): Promise<boolean> => {
    if (!isTauriDesktop) {
      return false;
    }

    try {
      const { isEnabled } = await import('@tauri-apps/plugin-autostart');
      return await isEnabled();
    } catch (error) {
      console.error('Failed to read launch-on-startup setting:', error);
      return false;
    }
  }, [isTauriDesktop]);

  const setLaunchOnStartupEnabled = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!isTauriDesktop) {
      return false;
    }

    try {
      const { enable, disable, isEnabled } = await import('@tauri-apps/plugin-autostart');

      if (enabled) {
        await enable();
      } else {
        await disable();
      }

      return await isEnabled();
    } catch (error) {
      console.error('Failed to update launch-on-startup setting:', error);
      return false;
    }
  }, [isTauriDesktop]);

  useEffect(() => {
    if (!isTauriDesktop) {
      return;
    }

    let isDisposed = false;
    let pingInterval: number | null = null;

    const sendPing = () => {
      void import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('renderer_ping'))
        .catch((error) => {
          if (!isDisposed) {
            console.error('Failed to ping Tauri renderer state:', error);
          }
        });
    };

    const handleVisibility = () => sendPing();
    const handleFocus = () => sendPing();

    sendPing();
    pingInterval = window.setInterval(sendPing, 30000);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      isDisposed = true;
      if (pingInterval !== null) {
        window.clearInterval(pingInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isTauriDesktop]);

  return {
    isDesktop,
    isElectronDesktop,
    isTauriDesktop,
    desktopPlatform,
    desktopPlatformName,
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
    downloadAndInstallUpdate,
    getLaunchOnStartupEnabled,
    setLaunchOnStartupEnabled,
  };
};
