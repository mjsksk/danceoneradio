import { useEffect } from 'react';

export const useTrackHistoryUpdater = () => {
  useEffect(() => {
    const updateTrackHistory = async () => {
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
        }
      } catch (error) {
        console.log('⚠️ Track history update failed:', error);
      }
    };

    // Update immediately on mount
    updateTrackHistory();

    // Then update every 30 seconds to catch new tracks
    const interval = setInterval(updateTrackHistory, 30000);

    return () => clearInterval(interval);
  }, []);
};