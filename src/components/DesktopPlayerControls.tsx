import { useEffect, useState } from 'react';
import type { Update } from '@tauri-apps/plugin-updater';
import { Monitor, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { Switch } from '@/components/ui/switch';

interface DesktopPlayerControlsProps {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  currentTrack?: {
    title?: string;
    artist?: string;
  };
  notificationsEnabled: boolean;
  onNotificationsChange: (enabled: boolean) => void;
}

export const DesktopPlayerControls = ({
  isPlaying,
  onTogglePlayback,
  currentTrack,
  notificationsEnabled,
  onNotificationsChange,
}: DesktopPlayerControlsProps) => {
  const {
    isDesktop,
    isTauriDesktop,
    updatePlaybackState,
    updateTrackInfo,
    registerMediaKeyHandlers,
    getAppVersion,
    checkForUpdates,
    downloadAndInstallUpdate,
  } = useDesktopIntegration();

  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'installing' | 'not-configured' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('Check for updates and install the next release without leaving the app.');
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);

  useEffect(() => {
    if (isDesktop) {
      updatePlaybackState(isPlaying);
    }
  }, [isDesktop, isPlaying, updatePlaybackState]);

  useEffect(() => {
    if (isDesktop && currentTrack) {
      updateTrackInfo(currentTrack);
    }
  }, [currentTrack, isDesktop, updateTrackInfo]);

  useEffect(() => {
    if (isDesktop) {
      const cleanup = registerMediaKeyHandlers(onTogglePlayback);
      return cleanup;
    }
  }, [isDesktop, onTogglePlayback, registerMediaKeyHandlers]);

  useEffect(() => {
    if (isDesktop) {
      getAppVersion().then(setAppVersion);
    }
  }, [getAppVersion, isDesktop]);

  useEffect(() => {
    return () => {
      if (pendingUpdate) {
        void pendingUpdate.close().catch(() => undefined);
      }
    };
  }, [pendingUpdate]);

  const handleCheckForUpdates = async () => {
    if (!isTauriDesktop) {
      setUpdateState('not-configured');
      setUpdateMessage('In-app updates are only available in the installed Tauri desktop app.');
      return;
    }

    if (pendingUpdate) {
      void pendingUpdate.close().catch(() => undefined);
      setPendingUpdate(null);
    }

    setUpdateState('checking');
    setUpdateProgress(null);
    setAvailableVersion(null);
    setUpdateMessage('Checking for a new Dance One Radio release...');

    const result = await checkForUpdates();

    if (result.status === 'available') {
      setPendingUpdate(result.update);
      setAvailableVersion(result.version);
      setUpdateState('available');
      setUpdateMessage(`Version ${result.version} is ready. Install it in place when you are ready.`);
      return;
    }

    if (result.status === 'up-to-date') {
      setUpdateState('up-to-date');
      setUpdateMessage('You are already on the latest version.');
      return;
    }

    if (result.status === 'not-configured') {
      setUpdateState('not-configured');
      setUpdateMessage('Automatic updates are ready in the app, but the signed update feed has not been published yet.');
      return;
    }

    if (result.status === 'error') {
      setUpdateState('error');
      setUpdateMessage(result.message);
      return;
    }

    setUpdateState('not-configured');
    setUpdateMessage('Automatic updates are only available in the installed Tauri desktop app.');
  };

  const handleInstallUpdate = async () => {
    if (!pendingUpdate || !availableVersion) {
      return;
    }

    const approved = window.confirm(`Install Dance One Radio ${availableVersion} now? The app will restart after the update finishes.`);
    if (!approved) {
      return;
    }

    let downloadedBytes = 0;
    let totalBytes = 0;

    try {
      setUpdateState('installing');
      setUpdateProgress(0);
      setUpdateMessage(`Downloading version ${availableVersion}...`);

      await downloadAndInstallUpdate(pendingUpdate, (event) => {
        if (event.event === 'Started') {
          totalBytes = event.data.contentLength ?? 0;
          setUpdateProgress(totalBytes > 0 ? 1 : null);
          return;
        }

        if (event.event === 'Progress') {
          downloadedBytes += event.data.chunkLength;

          if (totalBytes > 0) {
            setUpdateProgress(Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)));
          }

          return;
        }

        if (event.event === 'Finished') {
          setUpdateProgress(100);
          setUpdateMessage('Installing update and restarting Dance One Radio...');
        }
      });
    } catch (error) {
      setUpdateState('error');
      setUpdateProgress(null);
      setUpdateMessage(error instanceof Error ? error.message : 'Unable to install the update right now.');
    }
  };

  const updateButtonLabel = updateState === 'checking'
    ? 'Checking...'
    : updateState === 'installing'
      ? updateProgress !== null ? `Updating ${updateProgress}%` : 'Installing...'
      : updateState === 'available'
        ? 'Update Now'
        : 'Check For Updates';

  if (!isDesktop) {
    return null;
  }

  return (
    <div className="desktop-controls">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Monitor className="h-3 w-3" />
        <span>Desktop App</span>
        {appVersion && <span>v{appVersion}</span>}
      </div>

      <div className="text-xs text-muted-foreground">
        <div>Shortcuts: Ctrl+Shift+P (Play/Pause) | Ctrl+M (Hide)</div>
        <div>Close hides to tray | Use the tray menu to fully quit</div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
        <div>
          <div className="font-medium text-foreground">Track notifications</div>
          <div>Off by default. Turn on to get native now-playing alerts.</div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={onNotificationsChange}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-600"
        />
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-3 text-xs text-muted-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="font-medium text-foreground">App updates</div>
            <div>{updateMessage}</div>
            {availableVersion && updateState === 'available' ? (
              <div className="text-primary">Ready to install: v{availableVersion}</div>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={updateState === 'available' ? handleInstallUpdate : handleCheckForUpdates}
            disabled={updateState === 'checking' || updateState === 'installing'}
            className="min-w-[148px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${updateState === 'checking' || updateState === 'installing' ? 'animate-spin' : ''}`} />
            {updateButtonLabel}
          </Button>
        </div>
        {updateState === 'installing' && updateProgress !== null ? (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${updateProgress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
