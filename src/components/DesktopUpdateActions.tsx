import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { getInstallerReadyMessage } from '@/utils/desktopPlatform';

export const DesktopUpdateActions = () => {
  const { isTauriDesktop, desktopPlatform, checkForUpdates, downloadAndInstallUpdate } = useDesktopIntegration();
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'installing' | 'not-configured' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('Check for updates and install the next release without leaving the app.');
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);

  const handleCheckForUpdates = async () => {
    if (!isTauriDesktop) {
      setUpdateState('not-configured');
      setUpdateMessage('In-app updates are only available in the installed Tauri desktop app.');
      return;
    }

    setUpdateState('checking');
    setUpdateProgress(null);
    setAvailableVersion(null);
    setUpdateMessage('Checking for a new Dance One Radio release...');

    const result = await checkForUpdates();

    if (result.status === 'available') {
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
    if (!availableVersion) {
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

      await downloadAndInstallUpdate((event) => {
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

      setUpdateMessage(getInstallerReadyMessage(desktopPlatform));
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

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={updateState === 'available' ? handleInstallUpdate : handleCheckForUpdates}
        disabled={updateState === 'checking' || updateState === 'installing'}
        className="h-12 rounded-xl border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary hover:bg-primary/20 hover:text-primary"
        title={updateState === 'available' ? 'Install the available update' : 'Check for app updates'}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${updateState === 'checking' || updateState === 'installing' ? 'animate-spin' : ''}`} />
        {updateButtonLabel}
      </Button>
      {updateState !== 'idle' ? (
        <p className="max-w-[320px] text-right text-xs text-muted-foreground">
          {updateMessage}
        </p>
      ) : null}
    </div>
  );
};
