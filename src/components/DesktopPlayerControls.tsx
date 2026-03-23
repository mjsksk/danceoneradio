import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
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
    updatePlaybackState,
    updateTrackInfo,
    registerMediaKeyHandlers,
    getAppVersion,
  } = useDesktopIntegration();

  const [appVersion, setAppVersion] = useState<string | null>(null);

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
    </div>
  );
};
