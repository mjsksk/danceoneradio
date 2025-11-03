interface AlbumArtResponse {
  imageUrl: string | null;
  error?: string;
}

export class AlbumArtService {
  private static cache = new Map<string, Promise<AlbumArtResponse>>();
  private static requestQueue = new Map<string, number>();
  private static maxConcurrentRequests = 3;

  static async getAlbumArt(songTitle: string): Promise<AlbumArtResponse> {
    // Validate input
    if (!songTitle || typeof songTitle !== 'string' || songTitle.trim().length === 0) {
      console.log('⚠️ Invalid song title provided to getAlbumArt');
      return { imageUrl: this.getDefaultAlbumArt(), error: 'Invalid song title' };
    }

    const cleanTitle = this.cleanSongTitle(songTitle);
    
    // Double-check after cleaning
    if (!cleanTitle || cleanTitle.length === 0) {
      console.log('⚠️ Title became empty after cleaning:', songTitle);
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
    try {
      // Rate limit requests
      const currentRequests = Array.from(this.requestQueue.values()).filter(time => Date.now() - time < 1000).length;
      if (currentRequests >= this.maxConcurrentRequests) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.requestQueue.set(cleanTitle, Date.now());

      // Try iTunes first (most reliable)
      const itunesResult = await this.searchiTunes(cleanTitle);
      if (itunesResult.imageUrl) {
        return itunesResult;
      }

      // Fallback to default
      return { imageUrl: this.getDefaultAlbumArt() };
    } catch (error) {
      console.error('Error fetching album art:', error);
      return { imageUrl: this.getDefaultAlbumArt(), error: 'Failed to fetch album art' };
    } finally {
      // Clean up old requests
      setTimeout(() => this.requestQueue.delete(cleanTitle), 2000);
    }
  }

  private static cleanSongTitle(title: string): string {
    // Return original if title is empty or invalid
    if (!title || typeof title !== 'string') {
      return '';
    }

    // Remove common suffixes and clean the title
    const cleaned = title
      .replace(/\[.*?\]/g, '') // Remove [label] info
      .replace(/\(.*?remix.*?\)/gi, '') // Remove remix info
      .replace(/\(.*?edit.*?\)/gi, '') // Remove edit info
      .replace(/feat\..*$/gi, '') // Remove featuring info
      .replace(/ft\..*$/gi, '') // Remove ft. info
      .trim();
    
    // If cleaning removed everything, return original title
    return cleaned.length > 0 ? cleaned : title.trim();
  }

  private static async searchLastFM(title: string): Promise<AlbumArtResponse> {
    // Using Last.fm API (no key required for some endpoints)
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(title)}&api_key=YOUR_API_KEY&format=json&limit=1`;
    
    // For now, return null since we need an API key
    return { imageUrl: null };
  }

  private static async searchDeezer(title: string): Promise<AlbumArtResponse> {
    try {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(title)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const track = data.data[0];
        return { imageUrl: track.album?.cover_medium || track.album?.cover };
      }
    } catch (error) {
      console.log('Deezer search failed:', error);
    }
    
    return { imageUrl: null };
  }

  private static async searchiTunes(title: string): Promise<AlbumArtResponse> {
    try {
      // Validate title is not empty
      if (!title || title.trim().length === 0) {
        console.log('⚠️ Empty title provided to iTunes search');
        return { imageUrl: null };
      }

      // Use Supabase edge function to avoid CORS issues
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('album-art-search', {
        body: { query: title }
      });
      
      if (error) {
        console.log('Album art search error:', error);
        return { imageUrl: null };
      }
      
      if (data?.imageUrl) {
        console.log('✅ Found album art for:', title);
        return { imageUrl: data.imageUrl };
      }
    } catch (error) {
      console.log('iTunes search failed:', error);
    }
    
    return { imageUrl: null };
  }

  private static async searchMusicBrainz(title: string): Promise<AlbumArtResponse> {
    try {
      // MusicBrainz has a more complex API, simplified for this example
      const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(title)}&fmt=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      // MusicBrainz doesn't directly provide cover art, would need additional calls
      // This is a placeholder for the more complex implementation
      return { imageUrl: null };
    } catch (error) {
      console.log('MusicBrainz search failed:', error);
    }
    
    return { imageUrl: null };
  }

  private static getDefaultAlbumArt(): string {
    // Return the Dance One radio logo as fallback
    return "/src/assets/dance-one-logo.png";
  }
}