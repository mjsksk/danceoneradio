interface AlbumArtResponse {
  imageUrl: string | null;
  error?: string;
}

export class AlbumArtService {
  private static cache = new Map<string, Promise<AlbumArtResponse>>();
  private static requestQueue: Array<() => Promise<void>> = [];
  private static isProcessing = false;
  private static lastRequestTime = 0;
  private static minRequestInterval = 200; // 200ms between requests (reduced since we control concurrency)

  static async getAlbumArt(songTitle: string): Promise<AlbumArtResponse> {
    if (!songTitle || typeof songTitle !== 'string' || songTitle.trim().length === 0) {
      return { imageUrl: this.getDefaultAlbumArt(), error: 'Invalid song title' };
    }

    const cleanTitle = this.cleanSongTitle(songTitle);
    
    if (!cleanTitle || cleanTitle.length === 0) {
      return { imageUrl: this.getDefaultAlbumArt(), error: 'Empty title after cleaning' };
    }
    
    // Return cached promise if available
    if (this.cache.has(cleanTitle)) {
      return await this.cache.get(cleanTitle)!;
    }

    // Create and cache the promise
    const searchPromise = this.performAlbumArtSearch(cleanTitle);
    this.cache.set(cleanTitle, searchPromise);
    
    return await searchPromise;
  }

  private static async performAlbumArtSearch(cleanTitle: string): Promise<AlbumArtResponse> {
    return new Promise((resolve) => {
      const task = async () => {
        try {
          // Throttle requests to prevent rate limiting
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(r => setTimeout(r, this.minRequestInterval - timeSinceLastRequest));
          }
          this.lastRequestTime = Date.now();

          // Try iTunes with retry logic
          const itunesResult = await this.searchiTunesWithRetry(cleanTitle);
          if (itunesResult.imageUrl) {
            resolve(itunesResult);
            return;
          }

          // Fallback to default
          resolve({ imageUrl: this.getDefaultAlbumArt() });
        } catch (error) {
          console.error('Error fetching album art:', error);
          resolve({ imageUrl: this.getDefaultAlbumArt(), error: 'Failed to fetch album art' });
        }
      };

      this.requestQueue.push(task);
      this.processQueue();
    });
  }

  private static async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const task = this.requestQueue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessing = false;
  }

  private static async searchiTunesWithRetry(title: string, maxRetries = 2): Promise<AlbumArtResponse> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.searchiTunes(title);
        
        // If we got a rate limit error and have retries left, wait and retry
        if (result.error?.includes('rate limit') && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 2000; // 2s, 4s exponential backoff
          console.log(`⏳ Rate limited, retrying in ${delay}ms for: ${title}`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        
        return result;
      } catch (error: any) {
        if (attempt === maxRetries) {
          console.error('Max retries exceeded for:', title);
          return { imageUrl: null, error: 'Max retries exceeded' };
        }
      }
    }
    return { imageUrl: null, error: 'Search failed' };
  }

  private static cleanSongTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      return '';
    }

    const cleaned = title
      .replace(/\[.*?\]/g, '') // Remove [label] info
      .replace(/\(.*?remix.*?\)/gi, '') // Remove remix info
      .replace(/\(.*?edit.*?\)/gi, '') // Remove edit info
      .replace(/feat\..*$/gi, '') // Remove featuring info
      .replace(/ft\..*$/gi, '') // Remove ft. info
      .trim();
    
    return cleaned.length > 0 ? cleaned : title.trim();
  }

  private static async searchiTunes(title: string): Promise<AlbumArtResponse> {
    try {
      if (!title || title.trim().length === 0) {
        return { imageUrl: null };
      }

      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('album-art-search', {
        body: { query: title }
      });
      
      if (error) {
        // Check if it's a rate limit error
        const errorMsg = error.message || JSON.stringify(error);
        if (errorMsg.includes('429') || errorMsg.includes('Too many requests')) {
          return { imageUrl: null, error: 'rate limit' };
        }
        return { imageUrl: null, error: errorMsg };
      }
      
      if (data?.imageUrl) {
        return { imageUrl: data.imageUrl };
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('429') || errorMsg.includes('Too many requests')) {
        return { imageUrl: null, error: 'rate limit' };
      }
    }
    
    return { imageUrl: null };
  }

  private static getDefaultAlbumArt(): string {
    return "/src/assets/dance-one-logo.png";
  }
}
