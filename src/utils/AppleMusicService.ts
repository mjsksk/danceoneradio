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
  private static connectionTested = false;

  static async testConnection(): Promise<boolean> {
    if (this.connectionTested) {
      return true;
    }
    
    try {
      console.log('🔧 Testing Apple Music API connection...');
      const testResponse = await fetch(`${this.baseUrl}?q=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      this.connectionTested = testResponse.ok;
      return this.connectionTested;
    } catch (error) {
      console.error('🔧 Apple Music API connection test failed:', error);
      return false;
    }
  }

  static async searchTrack(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${artist} ${title}`.trim();
      const cacheKey = query.toLowerCase();
      
      // Return cached promise if available
      if (this.cache.has(cacheKey)) {
        return await this.cache.get(cacheKey)!;
      }
      
      // Create and cache the promise
      const searchPromise = this.performSearch(query);
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

      // Only test connection once
      if (!this.connectionTested) {
        const isConnected = await this.testConnection();
        if (!isConnected) {
          console.error('🎵 Apple Music API connection failed, skipping search');
          return null;
        }
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