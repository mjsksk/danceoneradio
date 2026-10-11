/**
 * Track history is now updated server-side by a scheduled job (every minute),
 * so browsers no longer call the updater function. Kept as a no-op so existing
 * imports keep working.
 */
export const useTrackHistoryUpdater = () => {};
