interface StreamMetadata {
  title?: string;
  artist?: string;
  song?: string;
  listeners?: string;
  bitrate?: string;
  status?: string;
}

export class RadioStreamService {
  private static streamUrl = 'http://s9.myradiostream.com:14296/';
  private static statusUrl = 'http://s9.myradiostream.com:14296/7.html'; // Common SHOUTcast status endpoint
  
  static async getStreamMetadata(): Promise<StreamMetadata | null> {
    try {
      // Try to fetch stream metadata using common SHOUTcast endpoints
      const endpoints = [
        'http://s9.myradiostream.com:14296/7.html',
        'http://s9.myradiostream.com:14296/stats',
        'http://s9.myradiostream.com:14296/status-json.xsl'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml,application/json',
            },
          });

          if (response.ok) {
            const text = await response.text();
            return this.parseStreamData(text, endpoint);
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}:`, error);
          continue;
        }
      }

      // Fallback: try to get metadata from stream headers
      return await this.getMetadataFromHeaders();
    } catch (error) {
      console.error('Error fetching stream metadata:', error);
      return null;
    }
  }

  private static async getMetadataFromHeaders(): Promise<StreamMetadata | null> {
    try {
      const response = await fetch(this.streamUrl, {
        method: 'HEAD',
        headers: {
          'Icy-MetaData': '1',
        },
      });

      const icyName = response.headers.get('icy-name');
      const icyDescription = response.headers.get('icy-description');
      const icyGenre = response.headers.get('icy-genre');
      const icyBitrate = response.headers.get('icy-br');

      if (icyName || icyDescription) {
        return {
          title: icyName || icyDescription || 'Dance One Radio',
          artist: icyGenre || 'Electronic Music',
          bitrate: icyBitrate || '128kbps',
          status: 'live'
        };
      }
    } catch (error) {
      console.log('CORS error or stream headers not accessible:', error);
    }

    return null;
  }

  private static parseStreamData(data: string, endpoint: string): StreamMetadata | null {
    try {
      // Parse SHOUTcast 7.html format
      if (endpoint.includes('7.html')) {
        const lines = data.split(',');
        if (lines.length >= 7) {
          return {
            listeners: lines[0],
            status: lines[1] === '1' ? 'live' : 'offline',
            title: lines[6] || 'Dance One Radio',
            bitrate: lines[5] || '128kbps'
          };
        }
      }

      // Parse JSON format
      if (data.startsWith('{')) {
        const json = JSON.parse(data);
        return {
          title: json.songtitle || json.title || json.streamtitle,
          listeners: json.listeners,
          bitrate: json.bitrate,
          status: json.status
        };
      }

      // Parse XML format
      if (data.includes('<SONGTITLE>')) {
        const titleMatch = data.match(/<SONGTITLE>(.*?)<\/SONGTITLE>/i);
        const listenersMatch = data.match(/<CURRENTLISTENERS>(.*?)<\/CURRENTLISTENERS>/i);
        
        return {
          title: titleMatch?.[1] || 'Dance One Radio',
          listeners: listenersMatch?.[1],
          status: 'live'
        };
      }
    } catch (error) {
      console.error('Error parsing stream data:', error);
    }

    return null;
  }

  static formatTitle(metadata: StreamMetadata | null): string {
    if (!metadata?.title) {
      return '🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵';
    }

    const title = metadata.title;
    const listeners = metadata.listeners ? ` • ${metadata.listeners} Listeners` : '';
    const bitrate = metadata.bitrate ? ` • ${metadata.bitrate}` : '';
    
    return `🎵 ${title}${listeners}${bitrate} • Dance One Radio 🎵`;
  }
}