

## Plan: Balance EQ Visualizer Across Full Spectrum

### What changes

**`src/components/LiveRadioPlayer.tsx`** — Modify the frequency emphasis curve to distribute energy evenly across all bars:

- Change `emphasis` from `1.15 - (index / EQ_BAR_COUNT) * 0.35` (bass-heavy: 1.15x → 0.80x) to a flat `1.0` so all frequency bins are treated equally
- Slightly increase the overall multiplier from `1.4` to `1.6` to compensate for the removed bass boost, keeping the visualizer visually active
- Reduce the power curve exponent from `1.35` to `1.2` so mid/high frequencies aren't compressed as much

This is a 1-line change (the emphasis calculation) plus minor constant tweaks. If you don't like the result, revert via chat history.

