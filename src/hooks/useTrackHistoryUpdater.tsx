import { useEffect, useRef } from 'react';
import { useTabVisibility } from './useTabVisibility';

export const useTrackHistoryUpdater = () => {
  const { isVisible, wasHidden, clearHiddenFlag } = useTabVisibility();
  const lastUpdateRef = useRef<number>(0);
  const backoffRef = useRef<number>(1);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateTrackHistory = async () => {
      // Skip if tab is not visible (unless it was hidden and now visible)
      if (!isVisible && !wasHidden) {
        console.log('🎵 Track history update skipped - tab not visible');
        return;
      }

      try {
        const response = await fetch('https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/track-history-updater', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('🎵 Track history updated:', result);
          lastUpdateRef.current = Date.now();
          backoffRef.current = 1; // Reset backoff on success
          
          if (wasHidden) {
            clearHiddenFlag();
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.log('⚠️ Track history update failed:', error);
        // Exponential backoff on failure
        backoffRef.current = Math.min(backoffRef.current * 2, 8);
      }
    };

    const scheduleNext = () => {
      // Base interval: 2 minutes (120s) instead of 30s - 75% reduction
      const baseInterval = 120000;
      const actualInterval = baseInterval * backoffRef.current;
      
      timeoutId = setTimeout(() => {
        updateTrackHistory().then(scheduleNext);
      }, actualInterval);
    };

    // Initial update only if tab is visible
    if (isVisible) {
      updateTrackHistory().then(scheduleNext);
    } else {
      scheduleNext();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isVisible, wasHidden, clearHiddenFlag]);
};