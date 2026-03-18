import { useCallback } from 'react';

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getUpdateStatus: () => Promise<{ status: string; message: string }>;
  checkForUpdates: () => Promise<{ status: string; message: string }>;
  downloadUpdate: () => Promise<{ status: string; message: string }>;
  installUpdate: () => Promise<boolean>;
  onUpdateStatus: (callback: (payload: { status: string; message: string }) => void) => void;
  onTogglePlayback: (callback: () => void) => void;
  onNextTrack: (callback: () => void) => void;
  onPreviousTrack: (callback: () => void) => void;
  updatePlaybackState: (isPlaying: boolean) => void;
  updateTrackInfo: (trackInfo: { title?: string; artist?: string }) => void;
  showNotification: (options: { title?: string; body: string }) => void;
  hideWindow: () => void;
  showWindow: () => void;
  platform: string;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    __TAURI_INTERNALS__?: unknown;
  }
}

type UpdatePayload = { status: string; message: string };

let tauriUpdateState: UpdatePayload = {
  status: 'idle',
  message: 'Update checks will appear here.',
};

let tauriPendingUpdate: {
  version: string;
  download: (onEvent?: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void) => Promise<void>;
  install: () => Promise<void>;
  close: () => Promise<void>;
} | null = null;

const tauriUpdateListeners = new Set<(payload: UpdatePayload) => void>();

const isTauriDesktop = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const emitTauriUpdate = (payload: UpdatePayload) => {
  tauriUpdateState = payload;
  tauriUpdateListeners.forEach((listener) => listener(payload));
};

export const useDesktopIntegration = () => {
  const isElectronDesktop = typeof window !== 'undefined' && !!window.electronAPI;
  const isDesktop = isElectronDesktop || isTauriDesktop();

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

  const showNotification = useCallback((title: string, body: string) => {
    if (isElectronDesktop) {
      window.electronAPI!.showNotification({ title, body });
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, [isElectronDesktop]);

  const registerMediaKeyHandlers = useCallback((
    onTogglePlayback: () => void,
    onNextTrack?: () => void,
    onPreviousTrack?: () => void
  ) => {
    if (!isElectronDesktop) return () => undefined;

    const electronAPI = window.electronAPI!;
    electronAPI.onTogglePlayback(onTogglePlayback);

    if (onNextTrack) {
      electronAPI.onNextTrack(onNextTrack);
    }

    if (onPreviousTrack) {
      electronAPI.onPreviousTrack(onPreviousTrack);
    }

    return () => {
      electronAPI.removeAllListeners('toggle-playback');
      electronAPI.removeAllListeners('next-track');
      electronAPI.removeAllListeners('previous-track');
    };
  }, [isElectronDesktop]);

  const getAppVersion = useCallback(async (): Promise<string | null> => {
    try {
      if (isElectronDesktop) {
        return await window.electronAPI!.getAppVersion();
      }

      if (isTauriDesktop()) {
        const { getVersion } = await import('@tauri-apps/api/app');
        return await getVersion();
      }
    } catch (error) {
      console.error('Failed to get app version:', error);
    }

    return null;
  }, [isElectronDesktop]);

  const getPlatform = useCallback((): string | null => {
    if (isElectronDesktop) {
      return window.electronAPI!.platform;
    }

    if (isTauriDesktop()) {
      return 'windows';
    }

    return null;
  }, [isElectronDesktop]);

  const hideWindow = useCallback(async () => {
    if (isElectronDesktop) {
      window.electronAPI!.hideWindow();
      return;
    }

    if (isTauriDesktop()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().hide();
    }
  }, [isElectronDesktop]);

  const showWindow = useCallback(async () => {
    if (isElectronDesktop) {
      window.electronAPI!.showWindow();
      return;
    }

    if (isTauriDesktop()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const currentWindow = getCurrentWindow();
      await currentWindow.show();
      await currentWindow.setFocus();
    }
  }, [isElectronDesktop]);

  const getUpdateStatus = useCallback(async () => {
    if (isElectronDesktop) {
      return window.electronAPI!.getUpdateStatus();
    }

    if (isTauriDesktop()) {
      return tauriUpdateState;
    }

    return { status: 'idle', message: 'Desktop updates are only available in the installed app.' };
  }, [isElectronDesktop]);

  const checkForUpdates = useCallback(async () => {
    if (isElectronDesktop) {
      return window.electronAPI!.checkForUpdates();
    }

    if (!isTauriDesktop()) {
      return { status: 'idle', message: 'Desktop updates are only available in the installed app.' };
    }

    try {
      emitTauriUpdate({ status: 'checking', message: 'Checking for updates...' });
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (!update) {
        tauriPendingUpdate = null;
        emitTauriUpdate({ status: 'up-to-date', message: 'You are already on the latest version.' });
        return tauriUpdateState;
      }

      tauriPendingUpdate = update;
      emitTauriUpdate({
        status: 'available',
        message: `Update ${update.version} is available. Click Download Update to continue.`,
      });
    } catch (error) {
      emitTauriUpdate({
        status: 'error',
        message: error instanceof Error ? `Update check failed: ${error.message}` : 'Update check failed.',
      });
    }

    return tauriUpdateState;
  }, [isElectronDesktop]);

  const downloadUpdate = useCallback(async () => {
    if (isElectronDesktop) {
      return window.electronAPI!.downloadUpdate();
    }

    if (!isTauriDesktop()) {
      return { status: 'idle', message: 'Desktop updates are only available in the installed app.' };
    }

    if (!tauriPendingUpdate) {
      return tauriUpdateState;
    }

    try {
      let downloadedBytes = 0;
      emitTauriUpdate({ status: 'downloading', message: 'Downloading update...' });
      await tauriPendingUpdate.download((event) => {
        if (event.event === 'Started') {
          emitTauriUpdate({ status: 'downloading', message: 'Downloading update...' });
        }

        if (event.event === 'Progress') {
          downloadedBytes += event.data?.chunkLength ?? 0;
          const totalBytes = event.data?.contentLength;
          if (totalBytes && totalBytes > 0) {
            const percent = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
            emitTauriUpdate({ status: 'downloading', message: `Downloading update... ${percent}%` });
          }
        }
      });

      emitTauriUpdate({
        status: 'downloaded',
        message: `Update ${tauriPendingUpdate.version} is ready. Click Install Update to restart and update in place.`,
      });
    } catch (error) {
      emitTauriUpdate({
        status: 'error',
        message: error instanceof Error ? `Update download failed: ${error.message}` : 'Update download failed.',
      });
    }

    return tauriUpdateState;
  }, [isElectronDesktop]);

  const installUpdate = useCallback(async () => {
    if (isElectronDesktop) {
      return window.electronAPI!.installUpdate();
    }

    if (!isTauriDesktop() || !tauriPendingUpdate) {
      return false;
    }

    try {
      await tauriPendingUpdate.install();
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
      return true;
    } catch (error) {
      emitTauriUpdate({
        status: 'error',
        message: error instanceof Error ? `Update install failed: ${error.message}` : 'Update install failed.',
      });
      return false;
    }
  }, [isElectronDesktop]);

  const onUpdateStatus = useCallback((callback: (payload: UpdatePayload) => void) => {
    if (isElectronDesktop) {
      window.electronAPI!.onUpdateStatus(callback);
      return () => {
        window.electronAPI!.removeAllListeners('update-status');
      };
    }

    if (!isTauriDesktop()) {
      return () => undefined;
    }

    tauriUpdateListeners.add(callback);
    callback(tauriUpdateState);

    return () => {
      tauriUpdateListeners.delete(callback);
    };
  }, [isElectronDesktop]);

  return {
    isDesktop,
    updatePlaybackState,
    updateTrackInfo,
    showNotification,
    registerMediaKeyHandlers,
    getAppVersion,
    getPlatform,
    hideWindow,
    showWindow,
    getUpdateStatus,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    onUpdateStatus
  };
};
