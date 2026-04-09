export type DesktopPlatform = 'windows' | 'macos' | 'linux' | 'unknown';

const normalizeElectronPlatform = (platform: string): DesktopPlatform => {
  switch (platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
};

export const detectDesktopPlatform = (): DesktopPlatform => {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const electronPlatform = (window as typeof window & {
    electronAPI?: { platform?: string };
  }).electronAPI?.platform;

  if (electronPlatform) {
    return normalizeElectronPlatform(electronPlatform);
  }

  const userAgentDataPlatform =
    'userAgentData' in navigator
      ? (navigator as Navigator & {
          userAgentData?: { platform?: string };
        }).userAgentData?.platform
      : undefined;

  const fingerprint = [
    userAgentDataPlatform,
    navigator.platform,
    navigator.userAgent,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (fingerprint.includes('mac') || fingerprint.includes('darwin')) {
    return 'macos';
  }

  if (fingerprint.includes('win')) {
    return 'windows';
  }

  if (fingerprint.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
};

export const getDesktopPlatformName = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'macos':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Desktop';
  }
};

export const getDesktopPlayerLabel = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Windows Desktop Player';
    case 'macos':
      return 'macOS Desktop Player';
    case 'linux':
      return 'Linux Desktop Player';
    default:
      return 'Desktop Player';
  }
};

export const getHideDestinationLabel = (platform: DesktopPlatform): string => {
  return platform === 'macos' ? 'menu bar' : 'tray';
};

export const getHideActionLabel = (platform: DesktopPlatform): string => {
  return platform === 'macos' ? 'Hide To Menu Bar' : 'Hide To Tray';
};

export const getLaunchOnStartupLabel = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Start with Windows';
    case 'macos':
      return 'Open at Login';
    default:
      return 'Launch on Startup';
  }
};

export const getLaunchOnStartupDescription = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Launch Dance One Radio automatically when you sign in.';
    case 'macos':
      return 'Launch Dance One Radio automatically when you log in to your Mac.';
    default:
      return 'Launch Dance One Radio automatically when you sign in.';
  }
};

export const getPlaybackShortcutLabel = (platform: DesktopPlatform): string => {
  return platform === 'macos' ? 'Cmd+Shift+P' : 'Ctrl+Shift+P';
};

export const getHideShortcutLabel = (platform: DesktopPlatform): string => {
  return platform === 'macos' ? 'Cmd+M' : 'Ctrl+M';
};

export const getCloseBehaviorLabel = (platform: DesktopPlatform): string => {
  const destination = getHideDestinationLabel(platform);
  return `Close hides to ${destination} | Use the ${destination} menu to fully quit`;
};

export const getInstallerHandoffErrorMessage = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Windows could not finish the installer handoff. Close Dance One Radio from the tray and try again.';
    case 'macos':
      return 'macOS could not finish opening the update package. Close Dance One Radio from the menu bar and try again.';
    default:
      return 'The update package could not be opened right now. Close Dance One Radio and try again.';
  }
};

export const getInstallerReadyMessage = (platform: DesktopPlatform): string => {
  switch (platform) {
    case 'windows':
      return 'Windows has the update package. If the installer does not appear, close Dance One Radio from the tray and try again.';
    case 'macos':
      return 'macOS has the update package. If the installer does not appear, close Dance One Radio from the menu bar and try again.';
    default:
      return 'The update package is ready. If it does not appear, close Dance One Radio and try again.';
  }
};
