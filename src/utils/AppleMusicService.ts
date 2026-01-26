interface AppleMusicTrack {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    previews?: Array<{
      url: string;
    }>;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

interface AppleMusicSearchResponse {
  results: {
    songs?: {
      data: AppleMusicTrack[];
    };
  };
}

export class AppleMusicService {
  private static baseUrl = 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/apple-music-search';
  private static cache = new Map<string, Promise<string | null>>();
  private static connectionTestPromise: Promise<boolean> | null = null;
  private static requestQueue: Array<() => Promise<void>> = [];
  private static isProcessingQueue = false;
  private static REQUEST_DELAY = 100; // 100ms between requests to avoid bursts

  private static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Small delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
      }
    }
    
    this.isProcessingQueue = false;
  }

  static async testConnection(): Promise<boolean> {
    // Return existing promise if test is in progress or completed
    if (this.connectionTestPromise) {
      return await this.connectionTestPromise;
    }
    
    // Create and store the test promise
    this.connectionTestPromise = (async () => {
      try {
        console.log('🔧 Testing Apple Music API connection...');
        const testResponse = await fetch(`${this.baseUrl}?q=test`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const result = testResponse.ok;
        console.log('🔧 Connection test result:', result);
        return result;
      } catch (error) {
        console.error('🔧 Apple Music API connection test failed:', error);
        return false;
      }
    })();
    
    return await this.connectionTestPromise;
  }

  static async searchTrack(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${artist} ${title}`.trim();
      const cacheKey = query.toLowerCase();
      
      // Return cached promise if available
      if (this.cache.has(cacheKey)) {
        return await this.cache.get(cacheKey)!;
      }
      
      // Create promise that will be resolved through the queue
      const searchPromise = new Promise<string | null>((resolve) => {
        this.requestQueue.push(async () => {
          const result = await this.performSearch(query);
          resolve(result);
        });
        // Start processing queue
        this.processQueue();
      });
      
      this.cache.set(cacheKey, searchPromise);
      
      return await searchPromise;
    } catch (error) {
      console.error('🎵 Error searching Apple Music:', error);
      return null;
    }
  }

  private static async performSearch(query: string): Promise<string | null> {
    try {
      console.log('🎵 Searching Apple Music for:', query);

      // Test connection (will use cached promise if already tested)
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.error('🎵 Apple Music API connection failed, skipping search');
        return null;
      }

      const fullUrl = `${this.baseUrl}?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error('🎵 Apple Music search failed:', response.status);
        return null;
      }

      const data: AppleMusicSearchResponse = await response.json();
      
      if (data.results.songs?.data && data.results.songs.data.length > 0) {
        const track = data.results.songs.data[0];
        const previewUrl = track.attributes.previews?.[0]?.url;
        
        if (previewUrl) {
          console.log('🎵 Found Apple Music preview URL for:', query);
          return previewUrl;
        }
      }

      return null;
    } catch (error) {
      console.error('🎵 Error in performSearch:', error);
      return null;
    }
  }

  static async getTrackPreview(trackId: number, artist: string, title: string): Promise<string | null> {
    // Clean the track info for better search results
    const cleanArtist = artist
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/[^\w\s&'-]/g, '')
      .trim();
    
    const cleanTitle = title
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/\(.*?extended.*?\)/gi, '')
      .replace(/\(.*?remix.*?\)/gi, '')
      .replace(/\(.*?edit.*?\)/gi, '')
      .replace(/\(.*?mix.*?\)/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/feat\..*$/gi, '')
      .replace(/ft\..*$/gi, '')
      .replace(/vs\..*$/gi, '')
      .replace(/\d{4}$/, '')
      .replace(/[^\w\s&'-]/g, '')
      .trim();

    return this.searchTrack(cleanArtist, cleanTitle);
  }
}