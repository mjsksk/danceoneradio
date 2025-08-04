interface AlbumArtResponse {
  imageUrl: string | null;
  error?: string;
}

export class AlbumArtService {
  private static cache = new Map<string, string>();

  static async getAlbumArt(songTitle: string): Promise<AlbumArtResponse> {
    // Clean the song title for better search results
    const cleanTitle = this.cleanSongTitle(songTitle);
    
    // Check cache first
    if (this.cache.has(cleanTitle)) {
      return { imageUrl: this.cache.get(cleanTitle)! };
    }

    try {
      // Try multiple sources for album art
      const sources = [
        () => this.searchLastFM(cleanTitle),
        () => this.searchDeezer(cleanTitle),
        () => this.searchiTunes(cleanTitle),
        () => this.searchMusicBrainz(cleanTitle)
      ];

      for (const searchFunction of sources) {
        try {
          const result = await searchFunction();
          if (result.imageUrl) {
            this.cache.set(cleanTitle, result.imageUrl);
            return result;
          }
        } catch (error) {
          console.log('Album art search failed, trying next source:', error);
          continue;
        }
      }

      // Fallback to a default music-themed image
      const defaultImage = this.getDefaultAlbumArt();
      return { imageUrl: defaultImage };
    } catch (error) {
      console.error('Error fetching album art:', error);
      return { imageUrl: this.getDefaultAlbumArt(), error: 'Failed to fetch album art' };
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
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const track = data.results[0];
        // Get high resolution artwork
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