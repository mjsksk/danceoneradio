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
  private static baseUrl = 'https://kjhjrjgfbyvfzztwgkzg.supabase.co/functions/v1/apple-music-search';

  static async searchTrack(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${artist} ${title}`.trim();
      console.log('🎵 Searching Apple Music for:', query);

      const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        console.error('Apple Music search failed:', response.status);
        return null;
      }

      const data: AppleMusicSearchResponse = await response.json();
      
      if (data.results.songs?.data && data.results.songs.data.length > 0) {
        const track = data.results.songs.data[0];
        const previewUrl = track.attributes.previews?.[0]?.url;
        
        if (previewUrl) {
          console.log('🎵 Found Apple Music preview for:', query);
          return previewUrl;
        }
      }

      console.log('🎵 No Apple Music preview found for:', query);
      return null;
    } catch (error) {
      console.error('Error searching Apple Music:', error);
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