import { useEffect, useState } from 'react';
import { useDesktopIntegration } from '@/hooks/useDesktopIntegration';
import { Button } from '@/components/ui/button';
import { Monitor, Minimize2, X } from 'lucide-react';

interface DesktopPlayerControlsProps {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  currentTrack?: {
    title?: string;
    artist?: string;
  };
}

export const DesktopPlayerControls = ({ 
  isPlaying, 
  onTogglePlayback, 
  currentTrack 
}: DesktopPlayerControlsProps) => {
  const { 
    isDesktop, 
    updatePlaybackState, 
    updateTrackInfo, 
    registerMediaKeyHandlers,
    getAppVersion 
  } = useDesktopIntegration();
  
  const [appVersion, setAppVersion] = useState<string | null>(null);

  // Update desktop integration when playback state changes
  useEffect(() => {
    if (isDesktop) {
      updatePlaybackState(isPlaying);
    }
  }, [isPlaying, updatePlaybackState, isDesktop]);

  // Update track info in desktop tray
  useEffect(() => {
    if (isDesktop && currentTrack) {
      updateTrackInfo(currentTrack);
    }
  }, [currentTrack, updateTrackInfo, isDesktop]);

  // Register media key handlers
  useEffect(() => {
    if (isDesktop) {
      const cleanup = registerMediaKeyHandlers(onTogglePlayback);
      return cleanup;
    }
  }, [isDesktop, registerMediaKeyHandlers, onTogglePlayback]);

  // Get app version on mount
  useEffect(() => {
    if (isDesktop) {
      getAppVersion().then(setAppVersion);
    }
  }, [isDesktop, getAppVersion]);

  if (!isDesktop) {
    return null;
  }

  const minimizeToTray = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // The main process will handle minimizing to tray when window is closed
      window.close();
    }
  };

  return (
    <div className="desktop-controls">
      {/* Desktop-specific status indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Monitor className="h-3 w-3" />
        <span>Desktop App</span>
        {appVersion && <span>v{appVersion}</span>}
      </div>

      {/* Desktop window controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={minimizeToTray}
          title="Minimize to system tray"
        >
          <Minimize2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Keyboard shortcuts info */}
      <div className="text-xs text-muted-foreground">
        <div>Shortcuts: Ctrl+Shift+P (Play/Pause) • Ctrl+M (Minimize)</div>
        <div>Media keys supported • Double-click tray to restore</div>
      </div>
    </div>
  );
};