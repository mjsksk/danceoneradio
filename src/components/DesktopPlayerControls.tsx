import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { Switch } from '@/components/ui/switch';
import {
  getCloseBehaviorLabel,
  getHideShortcutLabel,
  getLaunchOnStartupDescription,
  getLaunchOnStartupLabel,
  getPlaybackShortcutLabel,
} from '@/utils/desktopPlatform';

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
    desktopPlatform,
    hideWindow,
    updatePlaybackState,
    updateTrackInfo,
    registerMediaKeyHandlers,
    getAppVersion,
    getLaunchOnStartupEnabled,
    setLaunchOnStartupEnabled,
  } = useDesktopIntegration();

  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [launchOnStartupEnabled, setLaunchOnStartupState] = useState(false);
  const [launchOnStartupPending, setLaunchOnStartupPending] = useState(false);

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
    if (!isTauriDesktop) {
      return;
    }

    getLaunchOnStartupEnabled().then(setLaunchOnStartupState);
  }, [getLaunchOnStartupEnabled, isTauriDesktop]);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      if (target.isContentEditable) {
        return true;
      }

      const tagName = target.tagName;
      return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const commandKeyActive = desktopPlatform === 'macos' ? event.metaKey : event.ctrlKey;

      if (commandKeyActive && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        onTogglePlayback();
        return;
      }

      if (commandKeyActive && !event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        hideWindow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desktopPlatform, hideWindow, isDesktop, onTogglePlayback]);

  if (!isDesktop) {
    return null;
  }

  const handleLaunchOnStartupChange = async (enabled: boolean) => {
    setLaunchOnStartupPending(true);
    const nextValue = await setLaunchOnStartupEnabled(enabled);
    setLaunchOnStartupState(nextValue);
    setLaunchOnStartupPending(false);
  };

  return (
    <div className="desktop-controls">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Monitor className="h-3 w-3" />
        <span>Desktop App</span>
        {appVersion && <span>v{appVersion}</span>}
      </div>

      <div className="text-xs text-muted-foreground">
        <div>Shortcuts: {getPlaybackShortcutLabel(desktopPlatform)} (Play/Pause) | {getHideShortcutLabel(desktopPlatform)} (Hide)</div>
        <div>{getCloseBehaviorLabel(desktopPlatform)}</div>
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

      {isTauriDesktop ? (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
          <div>
            <div className="font-medium text-foreground">{getLaunchOnStartupLabel(desktopPlatform)}</div>
            <div>{getLaunchOnStartupDescription(desktopPlatform)}</div>
          </div>
          <Switch
            checked={launchOnStartupEnabled}
            disabled={launchOnStartupPending}
            onCheckedChange={handleLaunchOnStartupChange}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-600"
          />
        </div>
      ) : null}
    </div>
  );
};
