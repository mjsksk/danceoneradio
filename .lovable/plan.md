## Goal
Display the same live frequency-bar EQ that the live radio player uses on each individual episode page (`/episode/389` … `/episode/413`), reacting to the audio when that episode is the one currently playing through the global player.

## Approach
The infrastructure already exists:
- `src/hooks/useLiveEqVisualizer.ts` produces frequency bars from a shared `AnalyserNode` bound to an `HTMLAudioElement`.
- `AudioPlayerContext` owns the single global `<audio ref={audioRef} crossOrigin="anonymous" />` that every episode page already plays through.
- `LiveRadioPlayer` already drives the EQ off `audioPlayer.audioRef`, so reusing the same ref on episode pages won't create a duplicate `MediaElementSourceNode` (the hook caches per element).

So we only need a small presentational component and wire it into the episode pages.

## Steps

1. **Create `src/components/EpisodeEqVisualizer.tsx`**
   - Props: `isActive: boolean`, optional `height`, `barCount` override, `className`.
   - Pull `audioRef` from `useAudioPlayer()`.
   - Detect Electron desktop the same way `LiveRadioPlayer` does (reuse the existing helper / replicate the inline check).
   - Call `useLiveEqVisualizer({ audioRef, isActive, isElectronDesktop })`.
   - Render a horizontal row of 64 bars (matches live player styling) with the neon-purple → spectrum gradient already used in `LiveRadioPlayer` (lines ~291–302), wrapped in a card-friendly container. Idle state shows flat low bars (the hook already returns that when `isActive=false`).
   - Mark `aria-hidden` (decorative).

2. **Mount it on every episode page**
   - In `src/pages/Episode*.tsx` (Episode389 → Episode413, ~25 files), import `EpisodeEqVisualizer` and render it directly above the existing tracklist / play button block.
   - Pass `isActive={isCurrent && audioPlayer.isPlaying}` using the variables already in scope (`isCurrent`, `audioPlayer.isPlaying` — see Episode413.tsx lines 40‑42).
   - Update `scripts/generate-episode.ts` so newly generated episode pages include the visualizer automatically.

3. **(Optional, same change) Shows page hero**
   - In `src/pages/Shows.tsx`, render `<EpisodeEqVisualizer isActive={isPlaying} />` inside the "now playing" header area so the EQ also shows when an episode is launched from the Shows list. No other Shows logic changes.

4. **Memory**
   - Update `mem://audio/eq-visualizer-configuration` to note the visualizer is now reused on episode pages via `EpisodeEqVisualizer`, driven by the global `audioRef`.

## Files touched
- New: `src/components/EpisodeEqVisualizer.tsx`
- Edited: all `src/pages/Episode*.tsx` (~25 files), `src/pages/Shows.tsx`, `scripts/generate-episode.ts`
- Memory: `mem://audio/eq-visualizer-configuration`, `mem://index.md` (if entry text changes)

## Notes / non-goals
- No changes to the EQ hook, audio context, or playback logic — the bars are purely a read-only consumer of the existing shared analyser.
- The EQ only animates while that specific episode is the active playing source; otherwise it shows the idle flat row, matching current UX on the live player.
- On Electron desktop, the existing synthetic animation fallback is used (CORS-safe).
