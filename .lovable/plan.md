

## Plan: Enable Downloads Page with Live Download Link

### What changes

1. **Downloads page (`src/pages/Downloads.tsx`)**
   - Set `isComingSoon = false` (or remove the flag entirely)
   - Replace the "Coming Soon" badge with a "New Release" or "Available Now" badge
   - Replace the disabled button and "Under Development" card with an active download button pointing to: `https://github.com/mjsksk/danceoneradio/releases/download/v1.0.6/dance-one-radio-setup-1.0.6-x64.exe`
   - Update version text from `1.0.0` to `1.0.6`
   - Update the installation guide section to reflect the installer workflow (not portable)

2. **DesktopDownloadSection component (`src/components/DesktopDownloadSection.tsx`)**
   - Update the installer URL to the new GitHub releases link
   - Update version references from `1.0.0` to `1.0.6`

### Technical details

- The hero section will show a prominent download button that triggers `window.open()` to the GitHub releases URL
- The "Coming Soon" placeholder (animated glow, Clock icon, disabled button) will be replaced with an active download card
- Both the Downloads page and the DesktopDownloadSection dialog will use the same GitHub URL for consistency

### Build errors

Will also fix the two existing build errors:
- `LiveRadioPlayer.tsx` line 183: Cast `Uint8Array` to fix the `ArrayBufferLike` type mismatch
- `newsletter-campaign/index.ts`: Add resend dependency or adjust import (Deno edge function issue — will investigate)

