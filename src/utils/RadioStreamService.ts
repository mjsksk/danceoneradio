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
    const startTime = Date.now();
    console.log('🔍 RadioStreamService: Starting metadata fetch at', new Date().toISOString());
    
    try {
      // Try our Supabase Edge Function first (bypasses CORS)
      console.log('🔍 Trying Supabase Edge Function...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('stream-metadata', {
        body: {}
      });

      if (!error && data) {
        console.log('✅ Got metadata from Edge Function:', data);
        
        // Add the music note emojis for consistency
        if (data.title && !data.title.includes('🎵')) {
          data.title = `🎵 ${data.title} 🎵`;
        }
        
        const elapsed = Date.now() - startTime;
        console.log(`✅ Got real metadata in ${elapsed}ms:`, data);
        return data;
      } else {
        console.log(`❌ Edge Function failed:`, error);
      }

      // Fallback to a simulated live title
      console.log('🔄 Edge Function failed, using fallback');
      const fallback = this.generateLiveTitle();
      console.log('🔄 Fallback metadata:', fallback);
      return fallback;
    } catch (error) {
      console.error('💥 Error fetching stream metadata:', error);
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
    console.log(`🔍 Parsing data from ${endpoint}:`, data.substring(0, 100));
    
    try {
      // Parse current song endpoint (plain text)
      if (endpoint.includes('currentsong')) {
        console.log('🔍 Parsing as current song plain text format');
        const title = data.trim();
        if (title && title.length > 0) {
          const metadata = {
            title: title,
            status: 'live'
          };
          console.log('✅ Parsed current song metadata:', metadata);
          return metadata;
        }
      }
      
      // Parse SHOUTcast 7.html format
      if (endpoint.includes('7.html')) {
        console.log('🔍 Parsing as SHOUTcast 7.html format');
        const lines = data.split(',');
        console.log('🔍 Split lines:', lines);
        
        if (lines.length >= 7) {
          let title = lines[6] || 'Dance One Radio';
          // Clean up HTML tags from title
          title = title.replace(/<[^>]*>/g, '').trim();
          
          const metadata = {
            listeners: lines[0],
            status: lines[1] === '1' ? 'live' : 'offline',
            title: title,
            bitrate: lines[5] || '128kbps'
          };
          
          console.log('✅ Parsed SHOUTcast metadata:', metadata);
          return metadata;
        } else {
          console.log('❌ Invalid SHOUTcast format - not enough lines');
        }
      }

      // Parse JSON format
      if (data.startsWith('{')) {
        console.log('🔍 Parsing as JSON format');
        const json = JSON.parse(data);
        const metadata = {
          title: json.songtitle || json.title || json.streamtitle,
          listeners: json.listeners,
          bitrate: json.bitrate,
          status: json.status
        };
        console.log('✅ Parsed JSON metadata:', metadata);
        return metadata;
      }

      // Parse XML format
      if (data.includes('<SONGTITLE>')) {
        console.log('🔍 Parsing as XML format');
        const titleMatch = data.match(/<SONGTITLE>(.*?)<\/SONGTITLE>/i);
        const listenersMatch = data.match(/<CURRENTLISTENERS>(.*?)<\/CURRENTLISTENERS>/i);
        
        const metadata = {
          title: titleMatch?.[1] || 'Dance One Radio',
          listeners: listenersMatch?.[1],
          status: 'live'
        };
        console.log('✅ Parsed XML metadata:', metadata);
        return metadata;
      }
      
      console.log('❌ Unknown data format');
    } catch (error) {
      console.error('💥 Error parsing stream data:', error);
    }

    return null;
  }

  static async getRecentTracks(): Promise<Track[]> {
    try {
      console.log('🎵 Starting to fetch recent tracks...');
      
      // Try to fetch from the actual history feed first
      console.log('🎵 Attempting to fetch track history...');
      const historyTracks = await this.fetchTrackHistory();
      console.log('🎵 History fetch result:', historyTracks.length, 'tracks');
      
      if (historyTracks.length > 0) {
        console.log('🎵 Using real history tracks:', historyTracks);
        
        // If we have real history but less than 10 tracks, pad with simulated ones
        if (historyTracks.length < 10) {
          console.log('🎵 Padding history tracks to reach 10 total');
          const paddedTracks = this.padWithSimulatedTracks(historyTracks);
          return paddedTracks;
        }
        
        return historyTracks;
      }
      
      console.log('🎵 History endpoints failed - generating fallback tracks with current song');
      
      // Generate fallback tracks when database is empty
      const recentTracks: Track[] = [];
      
      // Try to get current playing track as the first track
      try {
        const currentMetadata = await this.getStreamMetadata();
        if (currentMetadata?.title) {
          const [title, artist] = this.parseTrackInfo(currentMetadata.title);
          
          const currentTrack: Track = {
            id: 1,
            title,
            artist,
            duration: this.generateRandomDuration(),
            genre: this.generateRandomGenre(),
            playedAt: new Date().toISOString(),
            waveform: this.generateWaveform(),
            likes: Math.floor(Math.random() * 2000) + 500,
            downloads: Math.floor(Math.random() * 800) + 200
          };

          recentTracks.push(currentTrack);
          console.log('🎵 Added current track as fallback:', currentTrack);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch current track for fallback:', error);
      }
      
      // Add some additional fallback tracks if we still have less than 5
      if (recentTracks.length < 5) {
        const fallbackTracks = [
          'DJ Shadow - Deep House Vibes',
          'Alex Mind - Progressive Journey', 
          'Luna Deep - Trance State',
          'Dark Matter - Techno Underground',
          'Stellar Waves - Melodic Dreams'
        ];
        
        fallbackTracks.forEach((trackInfo, index) => {
          if (recentTracks.length >= 5) return;
          
          const [artist, title] = trackInfo.split(' - ');
          const playedTime = new Date();
          playedTime.setMinutes(playedTime.getMinutes() - (index + 2) * 15);
          
          recentTracks.push({
            id: recentTracks.length + 1,
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
      }
      
      console.log('🎵 Total tracks before slicing:', recentTracks.length);
      const finalTracks = recentTracks.slice(0, 10);
      console.log('🎵 Final tracks to return:', finalTracks.length, finalTracks);
      return finalTracks; // Return latest 10 tracks
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
      // Return empty array instead of fake tracks when error occurs
      return [];
    }
  }

  private static async fetchTrackHistory(): Promise<Track[]> {
    try {
      console.log('🎵 Fetching track history from database...');
      
      // First, trigger the track history updater to ensure we have current data
      try {
        const updateResponse = await fetch('https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/track-history-updater', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('✅ Track history updater result:', updateResult);
        }
      } catch (updateError) {
        console.log('⚠️ Track history updater failed:', updateError);
      }

      // Fetch track history from database
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: tracks, error } = await supabase
        .from('radio_track_history')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Error fetching track history from database:', error);
        return [];
      }

      if (!tracks || tracks.length === 0) {
        console.log('📭 No tracks found in database, generating initial tracks');
        
        // Generate some initial tracks based on current playing track
        const currentMetadata = await this.getStreamMetadata();
        if (currentMetadata?.title) {
          const [title, artist] = this.parseTrackInfo(currentMetadata.title);
          
          const initialTrack: Track = {
            id: 1,
            title,
            artist,
            duration: this.generateRandomDuration(),
            genre: this.generateRandomGenre(),
            playedAt: new Date().toISOString(),
            waveform: this.generateWaveform(),
            likes: Math.floor(Math.random() * 2000) + 500,
            downloads: Math.floor(Math.random() * 800) + 200
          };

          return [initialTrack];
        }
        
        return [];
      }

      console.log('✅ Fetched track history from database:', tracks.length, 'tracks');

      // Convert database records to Track interface
      const historyTracks: Track[] = tracks.map((track, index) => ({
        id: index + 1,
        title: track.title,
        artist: track.artist,
        duration: track.duration || this.generateRandomDuration(),
        genre: track.genre || this.generateRandomGenre(),
        playedAt: track.played_at,
        waveform: this.generateWaveform(),
        likes: Math.floor(Math.random() * 2000) + 500,
        downloads: Math.floor(Math.random() * 800) + 200
      }));

      return historyTracks;
    } catch (error) {
      console.error('💥 Error fetching track history:', error);
      return [];
    }
  }

  private static parseHistoryData(data: string): Track[] {
    try {
      const tracks: Track[] = [];
      console.log('Parsing history data, length:', data.length);
      console.log('First 1000 chars of history data:', data.substring(0, 1000));
      
      // Parse HTML response from SHOUTcast admin interface
      const lines = data.split('\n');
      let trackId = 1;
      
      // Look for different patterns that might contain track history
      for (let i = 0; i < lines.length && tracks.length < 10; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Pattern 1: Look for table rows with track data
        if (line.includes('<tr>') || line.includes('<td>')) {
          // Check next few lines for track information
          let combinedLine = line;
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            combinedLine += ' ' + lines[j].trim();
          }
          
          // Extract track info from combined HTML
          const trackMatch = combinedLine.match(/>\s*([^<]+(?:\s+-\s+[^<]+))\s*</g);
          if (trackMatch) {
            for (const match of trackMatch) {
              const content = match.replace(/[><]/g, '').trim();
              
              if (content.includes(' - ') && content.length > 5 && 
                  !content.match(/^\d+$/) && !content.match(/^\d{1,2}:\d{2}/) &&
                  !content.toLowerCase().includes('time') && 
                  !content.toLowerCase().includes('song') &&
                  !content.toLowerCase().includes('artist')) {
                
                const parts = content.split(' - ');
                if (parts.length >= 2) {
                  const artist = parts[0].trim();
                  const title = parts.slice(1).join(' - ').trim();
                  
                  // Skip if already have this track
                  if (tracks.some(t => t.artist === artist && t.title === title)) {
                    continue;
                  }
                  
                  if (artist.length > 0 && title.length > 0) {
                    const playedTime = new Date();
                    playedTime.setMinutes(playedTime.getMinutes() - tracks.length * 5);
                    
                    tracks.push({
                      id: trackId++,
                      title: title,
                      artist: artist,
                      duration: this.generateRandomDuration(),
                      genre: this.generateRandomGenre(),
                      playedAt: playedTime.toISOString(),
                      waveform: this.generateWaveform(),
                      likes: Math.floor(Math.random() * 2000) + 500,
                      downloads: Math.floor(Math.random() * 800) + 200
                    });
                    
                    console.log(`Found track ${tracks.length}: ${artist} - ${title}`);
                  }
                }
              }
            }
          }
        }
        
        // Pattern 2: Direct lines with track info (no HTML)
        else if (line.includes(' - ') && !line.includes('<') && !line.includes('>') && line.length > 10) {
          // Skip lines that are obviously not tracks
          if (line.includes('http') || line.includes('www') || line.includes('admin') || 
              line.includes('mode=') || line.includes('copyright') || line.includes('shoutcast')) {
            continue;
          }
          
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const artist = parts[0].trim();
            const title = parts.slice(1).join(' - ').trim();
            
            // Skip if already have this track
            if (tracks.some(t => t.artist === artist && t.title === title)) {
              continue;
            }
            
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
              
              console.log(`Found plain text track ${tracks.length}: ${artist} - ${title}`);
            }
          }
        }
        
        // Pattern 3: Look for time stamps followed by track info  
        else if (line.match(/\d{1,2}:\d{2}/) && (i + 1 < lines.length)) {
          const nextLine = lines[i + 1]?.trim();
          if (nextLine && nextLine.includes(' - ') && !nextLine.includes('<')) {
            const parts = nextLine.split(' - ');
            if (parts.length >= 2) {
              const artist = parts[0].trim();
              const title = parts.slice(1).join(' - ').trim();
              
              // Skip if already have this track
              if (tracks.some(t => t.artist === artist && t.title === title)) {
                continue;
              }
              
              if (artist.length > 0 && title.length > 0) {
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
                
                console.log(`Found timestamped track ${tracks.length}: ${artist} - ${title}`);
              }
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

  private static padWithSimulatedTracks(realTracks: Track[]): Track[] {
    const targetCount = 10;
    const simulatedTrackTitles = [
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

    const paddedTracks = [...realTracks];
    let nextId = Math.max(...realTracks.map(t => t.id)) + 1;
    
    for (let i = 0; i < simulatedTrackTitles.length && paddedTracks.length < targetCount; i++) {
      const [title, artist] = simulatedTrackTitles[i].split(' - ');
      const playedTime = new Date();
      playedTime.setMinutes(playedTime.getMinutes() - (paddedTracks.length * 5 + 30));
      
      paddedTracks.push({
        id: nextId++,
        title,
        artist,
        duration: this.generateRandomDuration(),
        genre: this.generateRandomGenre(), 
        playedAt: playedTime.toISOString(),
        waveform: this.generateWaveform(),
        likes: Math.floor(Math.random() * 2000) + 500,
        downloads: Math.floor(Math.random() * 800) + 200
      });
    }
    
    console.log(`🎵 Padded ${realTracks.length} real tracks to ${paddedTracks.length} total tracks`);
    return paddedTracks;
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
    console.log('🔍 Formatting title from metadata:', metadata);
    
    if (!metadata?.title) {
      const fallback = '🎵 Dance One Radio - The Future of Electronic Music • Live DJ Sets • Progressive House • Trance • Techno • Deep House 🎵';
      console.log('🔄 Using fallback title:', fallback);
      return fallback;
    }

    const title = metadata.title;
    // Don't add emojis if they're already there
    const formatted = title.includes('🎵') ? title : `🎵 ${title} 🎵`;
    console.log('✅ Formatted title:', formatted);
    
    return formatted;
  }

  static parseTrackInfo(trackStr: string): [string, string] {
    const cleanTrack = trackStr.replace(/🎵/g, '').trim();
    
    // Try to split by " - " first
    if (cleanTrack.includes(' - ')) {
      const parts = cleanTrack.split(' - ');
      return [
        parts.slice(1).join(' - ').trim() || parts[0].trim(), // title
        parts[0].trim() // artist
      ];
    }
    
    // If no " - " separator, treat as title with generic artist
    return [cleanTrack, 'Dance One Radio'];
  }
}