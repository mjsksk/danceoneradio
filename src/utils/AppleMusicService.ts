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

  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔧 Testing Apple Music API connection...');
      const testResponse = await fetch(`${this.baseUrl}?q=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔧 Test response status:', testResponse.status);
      console.log('🔧 Test response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('🔧 Test response error:', errorText);
        return false;
      }
      
      const testData = await testResponse.json();
      console.log('🔧 Test response data:', testData);
      return true;
    } catch (error) {
      console.error('🔧 Apple Music API connection test failed:', error);
      return false;
    }
  }

  static async searchTrack(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${artist} ${title}`.trim();
      console.log('🎵 Searching Apple Music for:', query);
      console.log('🎵 Using API endpoint:', this.baseUrl);

      // Test connection first if this is the first call
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.error('🎵 Apple Music API connection failed, skipping search');
        return null;
      }

      const fullUrl = `${this.baseUrl}?q=${encodeURIComponent(query)}`;
      console.log('🎵 Making request to:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🎵 Response status:', response.status);
      console.log('🎵 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎵 Apple Music search failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return null;
      }

      const data: AppleMusicSearchResponse = await response.json();
      console.log('🎵 Apple Music API response:', data);
      
      if (data.results.songs?.data && data.results.songs.data.length > 0) {
        const track = data.results.songs.data[0];
        console.log('🎵 Found track:', track.attributes.name, 'by', track.attributes.artistName);
        
        const previewUrl = track.attributes.previews?.[0]?.url;
        
        if (previewUrl) {
          console.log('🎵 Found Apple Music preview URL:', previewUrl);
          return previewUrl;
        } else {
          console.log('🎵 Track found but no preview available');
        }
      }

      console.log('🎵 No Apple Music results found for:', query);
      return null;
    } catch (error) {
      console.error('🎵 Error searching Apple Music:', {
        error: error.message,
        stack: error.stack,
        query: `${artist} ${title}`
      });
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