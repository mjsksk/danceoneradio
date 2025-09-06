interface AlbumArtResponse {
  imageUrl: string | null;
  error?: string;
}

export class AlbumArtService {
  private static cache = new Map<string, Promise<AlbumArtResponse>>();
  private static requestQueue = new Map<string, number>();
  private static maxConcurrentRequests = 3;

  static async getAlbumArt(songTitle: string): Promise<AlbumArtResponse> {
    const cleanTitle = this.cleanSongTitle(songTitle);
    
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
    // Remove common suffixes and clean the title
    return title
      .replace(/\[.*?\]/g, '') // Remove [label] info
      .replace(/\(.*?remix.*?\)/gi, '') // Remove remix info
      .replace(/\(.*?edit.*?\)/gi, '') // Remove edit info
      .replace(/feat\..*$/gi, '') // Remove featuring info
      .replace(/ft\..*$/gi, '') // Remove ft. info
      .trim();
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
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=music&limit=1`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return { imageUrl: null };
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const track = data.results[0];
        const artworkUrl = track.artworkUrl100?.replace('100x100', '600x600');
        return { imageUrl: artworkUrl };
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