interface StreamMetadata {
  title?: string;
  artist?: string;
  song?: string;
  listeners?: string;
  bitrate?: string;
  status?: string;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  playedAt: string;
  waveform: number[];
  likes: number;
  downloads: number;
}

export class RadioStreamService {
  private static streamUrl = 'http://s9.myradiostream.com:14296/';
  
  static async getStreamMetadata(): Promise<StreamMetadata | null> {
    try {
      // Try CORS proxy services to bypass CORS restrictions
      const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/'
      ];

      const endpoints = [
        'http://s9.myradiostream.com:14296/7.html',
        'http://s9.myradiostream.com:14296/stats',
        'http://s9.myradiostream.com:14296/status-json.xsl'
      ];

      for (const proxy of proxies) {
        for (const endpoint of endpoints) {
          try {
            const proxyUrl = `${proxy}${encodeURIComponent(endpoint)}`;
            const response = await fetch(proxyUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json,text/html,application/xhtml+xml,application/xml',
              },
            });

            if (response.ok) {
              let data = await response.text();
              
              // If using allorigins, extract contents
              if (proxy.includes('allorigins')) {
                const json = JSON.parse(data);
                data = json.contents;
              }
              
              const metadata = this.parseStreamData(data, endpoint);
              if (metadata) {
                return metadata;
              }
            }
          } catch (error) {
            console.log(`Failed to fetch from ${proxy}${endpoint}:`, error);
            continue;
          }
        }
      }

      // Fallback to a simulated live title
      return this.generateLiveTitle();
    } catch (error) {
      console.error('Error fetching stream metadata:', error);
      return this.generateLiveTitle();
    }
  }

  private static generateLiveTitle(): StreamMetadata {
    const titles = [
      'Progressive House Mix - Live from Dance One Radio',
      'Deep Electronic Vibes - Now Playing on Dance One',
      'Trance Journey - Live DJ Set on Dance One Radio',
      'Techno Underground - Broadcasting Live',
      'Melodic House Session - Dance One Radio Live'
    ];
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const listeners = Math.floor(Math.random() * 500) + 50;
    
    return {
      title: randomTitle,
      listeners: listeners.toString(),
      bitrate: '128kbps',
      status: 'live'
    };
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
          let title = lines[6] || 'Dance One Radio';
          // Clean up HTML tags from title
          title = title.replace(/<[^>]*>/g, '').trim();
          
          return {
            listeners: lines[0],
            status: lines[1] === '1' ? 'live' : 'offline',
            title: title,
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

  static async getRecentTracks(): Promise<Track[]> {
    try {
      // Try to fetch from the actual history feed first
      const historyTracks = await this.fetchTrackHistory();
      if (historyTracks.length > 0) {
        return historyTracks;
      }
      
      // Fallback to existing logic if history feed fails
      const currentMetadata = await this.getStreamMetadata();
      const recentTracks: Track[] = [];
      
      // Generate recent tracks based on current playing + some mock recent ones
      if (currentMetadata?.title) {
        const [title, artist] = this.parseTrackInfo(currentMetadata.title);
        
        recentTracks.push({
          id: 1,
          title,
          artist,
          duration: this.generateRandomDuration(),
          genre: this.generateRandomGenre(),
          playedAt: new Date().toISOString(),
          waveform: this.generateWaveform(),
          likes: Math.floor(Math.random() * 2000) + 500,
          downloads: Math.floor(Math.random() * 800) + 200
        });
      }
      
      // Add some recent tracks (simulated)
      const recentTrackTitles = [
        'Deep House Vibes - DJ Shadow',
        'Progressive Journey - Alex Mind',
        'Trance State - Luna Deep',
        'Techno Underground - Dark Matter',
        'Melodic Dreams - Stellar Waves',
        'Cosmic Beats - DJ Galaxy',
        'Synthwave Nights - Neon Pulse',
        'Electronic Fusion - Digital Soul',
        'Ambient Flow - Ocean Deep'
      ];
      
      recentTrackTitles.forEach((trackInfo, index) => {
        const [title, artist] = trackInfo.split(' - ');
        const playedTime = new Date();
        playedTime.setMinutes(playedTime.getMinutes() - (index + 1) * 15);
        
        recentTracks.push({
          id: index + 2,
          title,
          artist,
          duration: this.generateRandomDuration(),
          genre: this.generateRandomGenre(),
          playedAt: playedTime.toISOString(),
          waveform: this.generateWaveform(),
          likes: Math.floor(Math.random() * 2000) + 500,
          downloads: Math.floor(Math.random() * 800) + 200
        });
      });
      
      return recentTracks.slice(0, 10); // Return latest 10 tracks
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
      return this.generateFallbackTracks();
    }
  }

  private static async fetchTrackHistory(): Promise<Track[]> {
    try {
      const historyUrl = 'http://s9.myradiostream.com:14296/admin.cgi?sid=1&mode=history';
      
      // Try CORS proxy services to bypass CORS restrictions
      const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/'
      ];

      for (const proxy of proxies) {
        try {
          const proxyUrl = `${proxy}${encodeURIComponent(historyUrl)}`;
          console.log('Attempting to fetch history from:', proxyUrl);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml',
            },
          });

          if (response.ok) {
            let data = await response.text();
            console.log('Raw history response:', data.substring(0, 500) + '...');
            
            // If using allorigins, extract contents
            if (proxy.includes('allorigins')) {
              const json = JSON.parse(data);
              data = json.contents;
              console.log('Extracted history contents:', data.substring(0, 500) + '...');
            }
            
            const tracks = this.parseHistoryData(data);
            if (tracks.length > 0) {
              console.log('Successfully fetched track history:', tracks);
              return tracks;
            } else {
              console.log('No tracks found in history data, trying next proxy...');
            }
          } else {
            console.log('History fetch failed with status:', response.status);
          }
        } catch (error) {
          console.log(`Failed to fetch history from ${proxy}:`, error);
          continue;
        }
      }

      console.log('All history fetch attempts failed, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching track history:', error);
      return [];
    }
  }

  private static parseHistoryData(data: string): Track[] {
    try {
      const tracks: Track[] = [];
      console.log('Parsing history data, length:', data.length);
      
      // Parse HTML response from SHOUTcast admin interface
      const lines = data.split('\n');
      let trackId = 1;
      
      for (let i = 0; i < lines.length && tracks.length < 10; i++) {
        const line = lines[i].trim();
        
        // Look for various patterns that might contain track information
        // Pattern 1: HTML table cells with time and track info
        if (line.includes('<td>') && (line.includes(':') || line.includes(' - '))) {
          const timeMatch = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
          
          // Extract all text content between HTML tags
          const textMatches = line.match(/>([^<]+)</g);
          if (textMatches) {
            for (const match of textMatches) {
              const content = match.replace(/[><]/g, '').trim();
              
              // Look for content that looks like a track (contains " - " and is not just numbers/time)
              if (content.includes(' - ') && content.length > 5 && !content.match(/^\d+$/) && !content.match(/^\d{1,2}:\d{2}/)) {
                const [artist, title] = content.split(' - ');
                if (artist && title && artist.trim().length > 0 && title.trim().length > 0) {
                  
                  // Calculate played time
                  const playedTime = new Date();
                  if (timeMatch) {
                    const timeParts = timeMatch[1].split(':');
                    const hours = parseInt(timeParts[0]);
                    const minutes = parseInt(timeParts[1]);
                    const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
                    playedTime.setHours(hours, minutes, seconds, 0);
                  } else {
                    playedTime.setMinutes(playedTime.getMinutes() - tracks.length * 5);
                  }
                  
                  tracks.push({
                    id: trackId++,
                    title: title.trim(),
                    artist: artist.trim(),
                    duration: this.generateRandomDuration(),
                    genre: this.generateRandomGenre(),
                    playedAt: playedTime.toISOString(),
                    waveform: this.generateWaveform(),
                    likes: Math.floor(Math.random() * 2000) + 500,
                    downloads: Math.floor(Math.random() * 800) + 200
                  });
                  
                  console.log(`Found track: ${artist.trim()} - ${title.trim()}`);
                  break; // Move to next line after finding a track
                }
              }
            }
          }
        }
        
        // Pattern 2: Plain text lines with track info (fallback)
        else if (line.includes(' - ') && !line.includes('<') && !line.includes('>') && line.length > 10) {
          // Skip lines that are obviously not tracks
          if (line.includes('http') || line.includes('www') || line.includes('admin') || line.includes('mode=')) {
            continue;
          }
          
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const artist = parts[0].trim();
            const title = parts.slice(1).join(' - ').trim();
            
            if (artist.length > 0 && title.length > 0 && !artist.match(/^\d+$/) && !title.match(/^\d+$/)) {
              const playedTime = new Date();
              playedTime.setMinutes(playedTime.getMinutes() - tracks.length * 5);
              
              tracks.push({
                id: trackId++,
                title,
                artist,
                duration: this.generateRandomDuration(),
                genre: this.generateRandomGenre(),
                playedAt: playedTime.toISOString(),
                waveform: this.generateWaveform(),
                likes: Math.floor(Math.random() * 2000) + 500,
                downloads: Math.floor(Math.random() * 800) + 200
              });
              
              console.log(`Found plain text track: ${artist} - ${title}`);
            }
          }
        }
      }
      
      console.log(`Parsed ${tracks.length} tracks from history`);
      
      // Sort by played time (most recent first) and limit to 10 tracks
      return tracks
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error parsing history data:', error);
      return [];
    }
  }

  private static parseTrackInfo(title: string): [string, string] {
    // Try to parse "Artist - Title" or "Title - Artist" format
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      return [parts[1] || parts[0], parts[0]];
    }
    
    // Fallback to just using title as song name with generic artist
    return [title.replace('Dance One Radio - ', ''), 'Dance One Radio'];
  }

  private static generateRandomDuration(): string {
    const minutes = Math.floor(Math.random() * 4) + 4; // 4-7 minutes
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private static generateRandomGenre(): string {
    const genres = ['Progressive House', 'Deep House', 'Trance', 'Techno', 'Electronic'];
    return genres[Math.floor(Math.random() * genres.length)];
  }

  private static generateWaveform(): number[] {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 10);
  }

  private static generateFallbackTracks(): Track[] {
    const fallbackTracks = [
      { title: 'Progressive House Mix', artist: 'DJ Pulse' },
      { title: 'Deep Electronic Vibes', artist: 'DJ Neon' },
      { title: 'Trance Journey', artist: 'DJ Cosmos' },
      { title: 'Techno Underground', artist: 'DJ Aurora' },
      { title: 'Melodic Dreams', artist: 'DJ Stellar' },
      { title: 'Cosmic Beats', artist: 'DJ Galaxy' },
      { title: 'Synthwave Nights', artist: 'DJ Neon Pulse' },
      { title: 'Electronic Fusion', artist: 'DJ Digital Soul' },
      { title: 'Ambient Flow', artist: 'DJ Ocean Deep' },
      { title: 'Future Bass', artist: 'DJ Horizon' }
    ];

    return fallbackTracks.map((track, index) => ({
      id: index + 1,
      title: track.title,
      artist: track.artist,
      duration: this.generateRandomDuration(),
      genre: this.generateRandomGenre(),
      playedAt: new Date(Date.now() - index * 15 * 60 * 1000).toISOString(),
      waveform: this.generateWaveform(),
      likes: Math.floor(Math.random() * 2000) + 500,
      downloads: Math.floor(Math.random() * 800) + 200
    }));
  }

  static formatTitle(metadata: StreamMetadata | null): string {
    if (!metadata?.title) {
      return '🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵';
    }

    const title = metadata.title;
    
    return `🎵 ${title} 🎵`;
  }
}