import { useState, useEffect, useRef } from 'react';
import { AlbumArtService } from '@/utils/AlbumArtService';

interface UseAlbumArtOptions {
  enabled?: boolean;
  cacheTime?: number;
}

export const useAlbumArt = (searchQuery: string, options: UseAlbumArtOptions = {}) => {
  const { enabled = true, cacheTime = 300000 } = options; // 5 min default cache
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');
  const cacheTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !searchQuery || searchQuery === lastQueryRef.current) {
      return;
    }

    // Check if we have fresh cached data
    const now = Date.now();
    if (lastQueryRef.current === searchQuery && 
        now - cacheTimestampRef.current < cacheTime) {
      console.log('🎵 Using cached album art for:', searchQuery);
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchAlbumArt = async () => {
      setIsLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        console.log('🎵 useAlbumArt: Fetching for:', searchQuery);
        const result = await AlbumArtService.getAlbumArt(searchQuery);
        
        if (result.imageUrl && !result.error) {
          setImageUrl(result.imageUrl);
          lastQueryRef.current = searchQuery;
          cacheTimestampRef.current = Date.now();
          console.log('🎵 useAlbumArt: Found album art for:', searchQuery);
        } else {
          setImageUrl(null);
          setError(result.error || 'No album art found');
          console.log('🎵 useAlbumArt: No album art for:', searchQuery);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch album art');
          setImageUrl(null);
          console.error('🎵 useAlbumArt: Error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(() => {
      fetchAlbumArt();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, enabled, cacheTime]);

  const refetch = () => {
    lastQueryRef.current = '';
    cacheTimestampRef.current = 0;
  };

  return { imageUrl, isLoading, error, refetch };
};
