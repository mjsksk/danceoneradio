import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Heart, Share2, Clock, RefreshCw, Radio } from 'lucide-react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';
import stationLogo from '/lovable-uploads/72d04e54-23af-4f4a-bf39-efcc6c6b2150.png';

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

const TracksSection = () => {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoError, setLogoError] = useState<{[key: number]: boolean}>({});
  const [albumArt, setAlbumArt] = useState<{[key: number]: string | null}>({});

  // Clean and format track info for better album art search
  const cleanTrackForSearch = (artist: string, title: string): string => {
    // Clean artist name
    const cleanArtist = artist
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/[^\w\s&'-]/g, '')
      .trim();
    
    // Clean title
    const cleanTitle = title
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, "'")
      .replace(/\(.*?extended.*?\)/gi, '') // Remove (Extended)
      .replace(/\(.*?remix.*?\)/gi, '') // Remove remix info
      .replace(/\(.*?edit.*?\)/gi, '') // Remove edit info
      .replace(/\(.*?mix.*?\)/gi, '') // Remove mix info
      .replace(/\[.*?\]/g, '') // Remove [brackets]
      .replace(/feat\..*$/gi, '') // Remove featuring
      .replace(/ft\..*$/gi, '') // Remove ft.
      .replace(/vs\..*$/gi, '') // Remove vs.
      .replace(/\d{4}$/, '') // Remove year at end
      .replace(/[^\w\s&'-]/g, '')
      .trim();
    
    return `${cleanArtist} ${cleanTitle}`;
  };

  // Disabled album art fetching to avoid wrong images - always use station logo
  // useEffect(() => {
  //   const fetchAlbumArt = async () => {
  //     for (const track of tracks) {
  //       if (!albumArt[track.id]) {
  //         try {
  //           const cleanedQuery = cleanTrackForSearch(track.artist, track.title);
  //           console.log(`🎵 Fetching album art for: "${track.artist} - ${track.title}" -> cleaned: "${cleanedQuery}"`);
  //           const result = await AlbumArtService.getAlbumArt(cleanedQuery);
  //           console.log(`🎵 Album art result for "${cleanedQuery}":`, result);
  //           
  //           // Be more strict about what we consider valid album art
  //           if (result.imageUrl && 
  //               !result.imageUrl.includes('unsplash.com') && 
  //               !result.imageUrl.includes('placeholder') &&
  //               !result.error) {
  //             setAlbumArt(prev => ({...prev, [track.id]: result.imageUrl}));
  //             console.log(`🎵 Using real album art for: ${cleanedQuery}`);
  //           } else {
  //             console.log(`🎵 No valid album art found for: ${cleanedQuery}, using station logo`);
  //             // Don't set anything in albumArt state - this will make it fall back to station logo
  //           }
  //         } catch (error) {
  //           console.error(`🎵 Failed to fetch album art for ${track.artist} - ${track.title}:`, error);
  //         }
  //       }
  //     }
  //   };

  //   if (tracks.length > 0) {
  //     fetchAlbumArt();
  //   }
  // }, [tracks, albumArt]);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      console.log('🎵 TracksSection: Starting to fetch recent tracks...');
      try {
        setLoading(true);
        const recentTracks = await RadioStreamService.getRecentTracks();
        console.log('🎵 TracksSection: Received tracks:', recentTracks.length, recentTracks);
        setTracks(recentTracks);
      } catch (error) {
        console.error('🎵 TracksSection: Failed to fetch recent tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTracks();
    
    // Refresh tracks every 30 seconds for testing (was 5 minutes)
    const interval = setInterval(fetchRecentTracks, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = (trackId: number) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  const handleManualRefresh = async () => {
    console.log('🎵 Manual refresh triggered');
    setRefreshing(true);
    try {
      const recentTracks = await RadioStreamService.getRecentTracks();
      console.log('🎵 Manual refresh received tracks:', recentTracks.length, recentTracks);
      setTracks(recentTracks);
    } catch (error) {
      console.error('🎵 Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section id="tracks" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
            <span className="text-neon">LATEST PLAYED</span>{" "}
            <span className="text-neon-purple">TRACKS</span>
          </h2>
          <Button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn-cyber"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Tracks'}
          </Button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading recent tracks...</div>
            </div>
          ) : (
            tracks.map((track, index) => (
            <div
              key={track.id}
              className="card-cyber p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Album Art & Play Button & Track Info */}
                <div className="flex items-center space-x-4 flex-1">
                   {/* Album Art */}
                   <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0 flex items-center justify-center">
                     {logoError[track.id] ? (
                       <Radio className="w-8 h-8 text-primary" />
                     ) : albumArt[track.id] ? (
                       <img 
                         src={albumArt[track.id]} 
                         alt={`${track.artist} - ${track.title} Album Art`}
                         className="w-full h-full object-cover"
                         onError={() => {
                           setLogoError(prev => ({...prev, [track.id]: true}));
                           console.log('Album art failed to load for track:', track.title);
                         }}
                       />
                     ) : (
                       <img 
                         src={stationLogo} 
                         alt="Dance One Radio Logo" 
                         className="w-full h-full object-contain"
                         onError={() => {
                           setLogoError(prev => ({...prev, [track.id]: true}));
                           console.log('Station logo failed to load for track:', track.title);
                         }}
                       />
                     )}
                   </div>

                  <Button
                    onClick={() => handlePlayPause(track.id)}
                    className={`w-16 h-16 rounded-full ${
                      playingTrack === track.id
                        ? 'bg-primary text-primary-foreground animate-glow-pulse'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {playingTrack === track.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <h3 className="text-xl font-['Orbitron'] font-bold text-primary mb-1">
                      {track.title}
                    </h3>
                    <p className="text-lg text-accent font-['Rajdhani'] font-medium mb-1">
                      {track.artist}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground font-['Rajdhani']">
                      <span>{track.genre}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {track.duration}
                      </div>
                      <span>•</span>
                      <span>{new Date(track.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-center justify-center space-x-1 flex-1">
                  {track.waveform.map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-300 ${
                        playingTrack === track.id
                          ? 'bg-primary wave-animation'
                          : 'bg-muted hover:bg-primary/50'
                      }`}
                      style={{
                        height: `${height * 2}px`,
                        animationDelay: playingTrack === track.id ? `${i * 0.1}s` : '0s'
                      }}
                    />
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-400/20"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default TracksSection;