import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Heart, Share2, Clock, RefreshCw, Radio } from 'lucide-react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { AlbumArtService } from '@/utils/AlbumArtService';
import { AppleMusicService } from '@/utils/AppleMusicService';
import { supabase } from '@/integrations/supabase/client';
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
  const [previewUrls, setPreviewUrls] = useState<{[key: number]: string | null}>({});
  const [loadingPreviews, setLoadingPreviews] = useState<{[key: number]: boolean}>({});
  const [previewErrors, setPreviewErrors] = useState<{[key: number]: string}>({});
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
  const fetchingPreviewsRef = useRef(false);

  // Initialize audio element and load liked tracks
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('ended', () => {
      setPlayingTrack(null);
    });
    setAudioRef(audio);
    
    // Load liked tracks from localStorage
    const savedLikes = localStorage.getItem('likedTracks');
    if (savedLikes) {
      try {
        const likedTrackIds = JSON.parse(savedLikes);
        setLikedTracks(new Set(likedTrackIds));
      } catch (error) {
        console.error('Failed to load liked tracks:', error);
      }
    }
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

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

  // Fetch album art when tracks change or are added
  useEffect(() => {
    const fetchAlbumArt = async () => {
      for (const track of tracks) {
        // Skip if we already have album art for this track
        if (albumArt[track.id]) continue;

        try {
          const cleanedQuery = cleanTrackForSearch(track.artist, track.title);
          console.log(`🎵 Fetching album art for: "${track.artist} - ${track.title}" -> cleaned: "${cleanedQuery}"`);
          
          const result = await AlbumArtService.getAlbumArt(cleanedQuery);
          console.log(`🎵 Album art result for "${cleanedQuery}":`, result);
          
          // Only use valid album art from iTunes
          if (result.imageUrl && !result.error) {
            setAlbumArt(prev => ({...prev, [track.id]: result.imageUrl}));
            console.log(`🎵 Using album art for: ${cleanedQuery}`);
          } else {
            console.log(`🎵 No album art found for: ${cleanedQuery}, using station logo`);
          }
        } catch (error) {
          console.error(`🎵 Failed to fetch album art for ${track.artist} - ${track.title}:`, error);
        }
      }
    };

    if (tracks.length > 0) {
      fetchAlbumArt();
    }
  }, [tracks]);

  // Enable Apple Music preview fetching now that the API token is configured
  useEffect(() => {
    const fetchPreviews = async () => {
      if (fetchingPreviewsRef.current || tracks.length === 0) return;
      
      fetchingPreviewsRef.current = true;
      console.log('🎵 Starting to fetch Apple Music previews for', tracks.length, 'tracks');
      
      for (const track of tracks) {
        if (!previewUrls[track.id] && !previewErrors[track.id]) {
          setLoadingPreviews(prev => ({...prev, [track.id]: true}));
          
          try {
            console.log(`🎵 Fetching Apple Music preview for: ${track.artist} - ${track.title}`);
            const previewUrl = await AppleMusicService.getTrackPreview(track.id, track.artist, track.title);
            
            if (previewUrl) {
              setPreviewUrls(prev => ({...prev, [track.id]: previewUrl}));
              console.log(`🎵 ✅ Found Apple Music preview for: ${track.artist} - ${track.title}`);
            } else {
              setPreviewErrors(prev => ({...prev, [track.id]: 'No preview available'}));
              console.log(`🎵 ❌ No Apple Music preview found for: ${track.artist} - ${track.title}`);
            }
          } catch (error) {
            console.error(`🎵 ❌ Failed to fetch Apple Music preview for ${track.artist} - ${track.title}:`, error);
            setPreviewErrors(prev => ({...prev, [track.id]: error.message || 'Failed to fetch preview'}));
          } finally {
            setLoadingPreviews(prev => ({...prev, [track.id]: false}));
          }
        }
      }
      
      fetchingPreviewsRef.current = false;
    };

    if (tracks.length > 0) {
      console.log('🎵 Tracks loaded, starting preview fetch process');
      fetchPreviews();
    }
  }, [tracks]);

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
    
    // Set up real-time subscription for new tracks
    console.log('🎵 Setting up real-time subscription for track history');
    const channel = supabase
      .channel('radio-track-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'radio_track_history'
        },
        (payload) => {
          console.log('🎵 New track detected via real-time:', payload.new);
          // Refresh tracks when new ones are added
          fetchRecentTracks();
        }
      )
      .subscribe();
    
    // Also refresh tracks every 2 minutes as backup
    const interval = setInterval(fetchRecentTracks, 2 * 60 * 1000);
    
    return () => {
      console.log('🎵 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handlePlayPause = async (trackId: number) => {
    if (!audioRef) return;

    if (playingTrack === trackId) {
      // Pause current track
      audioRef.pause();
      setPlayingTrack(null);
    } else {
      // Stop any currently playing track
      audioRef.pause();
      
      // Find the preview URL for this track
      const previewUrl = previewUrls[trackId];
      if (previewUrl) {
        try {
          audioRef.src = previewUrl;
          await audioRef.play();
          setPlayingTrack(trackId);
          console.log(`🎵 Playing Apple Music preview for track ${trackId}`);
        } catch (error) {
          console.error('Failed to play Apple Music preview:', error);
          setPlayingTrack(null);
        }
      } else {
        console.log(`🎵 No Apple Music preview available for track ${trackId}`);
        // For now, just show visual feedback without playing audio
        setPlayingTrack(trackId);
        setTimeout(() => setPlayingTrack(null), 3000); // Auto-stop after 3 seconds
      }
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

  const handleTrackClick = (track: Track) => {
    const query = encodeURIComponent(`${track.artist} ${track.title}`);
    const appleMusicUrl = `https://music.apple.com/search?term=${query}`;
    window.open(appleMusicUrl, '_blank');
  };

  const handleShare = (track: Track) => {
    console.log('🎵 Share button clicked for track:', track.title);
    const shareText = `🎵 Now playing: ${track.title} by ${track.artist} on Dance One Radio`;
    const shareUrl = encodeURIComponent('https://danceoneradio.com');
    const text = encodeURIComponent(shareText);
    
    // Create social media sharing URLs
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${text}%20${shareUrl}`,
      telegram: `https://t.me/share/url?url=${shareUrl}&text=${text}`
    };
    
    // Show sharing options popup
    const platforms = [
      { name: 'Facebook', url: shareUrls.facebook, color: '#1877F2' },
      { name: 'X (Twitter)', url: shareUrls.twitter, color: '#000000' },
      { name: 'LinkedIn', url: shareUrls.linkedin, color: '#0A66C2' },
      { name: 'WhatsApp', url: shareUrls.whatsapp, color: '#25D366' },
      { name: 'Telegram', url: shareUrls.telegram, color: '#0088CC' }
    ];
    
    // Create a simple popup with sharing options
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      padding: 20px;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      min-width: 300px;
    `;
    
    // Helper function to safely escape HTML
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    // Create elements safely using DOM methods instead of innerHTML
    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 15px 0; color: hsl(var(--foreground)); font-family: "Orbitron", sans-serif;';
    title.textContent = 'Share Track';
    
    const trackInfo = document.createElement('p');
    trackInfo.style.cssText = 'margin: 0 0 15px 0; color: hsl(var(--muted-foreground)); font-size: 14px;';
    trackInfo.textContent = `${track.title} by ${track.artist}`;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    
    // Create platform buttons safely
    platforms.forEach(platform => {
      const button = document.createElement('button');
      button.style.cssText = `padding: 10px 15px; background: ${platform.color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;`;
      button.textContent = `Share on ${platform.name}`;
      button.onclick = () => {
        window.open(platform.url, '_blank', 'width=600,height=400');
        document.body.removeChild(backdrop);
      };
      buttonsContainer.appendChild(button);
    });
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.style.cssText = 'padding: 10px 15px; background: hsl(var(--secondary)); color: hsl(var(--secondary-foreground)); border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => document.body.removeChild(backdrop);
    buttonsContainer.appendChild(cancelButton);
    
    // Append all elements safely
    popup.appendChild(title);
    popup.appendChild(trackInfo);
    popup.appendChild(buttonsContainer);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    `;
    backdrop.onclick = () => document.body.removeChild(backdrop);
    
    document.body.appendChild(backdrop);
    backdrop.appendChild(popup);
    
    console.log('🎵 Social sharing popup opened');
  };

  const handleLike = (track: Track) => {
    const newLikedTracks = new Set(likedTracks);
    
    if (likedTracks.has(track.id)) {
      newLikedTracks.delete(track.id);
      console.log(`🎵 Unliked track: ${track.title} by ${track.artist}`);
    } else {
      newLikedTracks.add(track.id);
      console.log(`🎵 Liked track: ${track.title} by ${track.artist}`);
    }
    
    setLikedTracks(newLikedTracks);
    
    // Save to localStorage
    localStorage.setItem('likedTracks', JSON.stringify(Array.from(newLikedTracks)));
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
            tracks.filter(track => !track.title.includes("Dance One Radio") && !track.artist.includes("Dance One Radio")).map((track, index) => (
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
                        <div className="track-logo">
                          <img 
                            src={stationLogo} 
                            alt="Dance One Radio Logo" 
                            loading="lazy"
                            width="64"
                            height="64"
                            onError={() => {
                              setLogoError(prev => ({...prev, [track.id]: true}));
                              console.log('Station logo failed to load for track:', track.title);
                            }}
                          />
                        </div>
                     )}
                   </div>

                  <Button
                    onClick={() => handlePlayPause(track.id)}
                    className={`w-16 h-16 rounded-full relative ${
                      playingTrack === track.id
                        ? 'bg-primary text-primary-foreground animate-glow-pulse'
                        : previewUrls[track.id]
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    disabled={!previewUrls[track.id] && playingTrack !== track.id}
                    title={
                      loadingPreviews[track.id] 
                        ? 'Loading preview...' 
                        : previewUrls[track.id] 
                        ? 'Play 30-second preview' 
                        : previewErrors[track.id] 
                        ? `Preview not available: ${previewErrors[track.id]}`
                        : 'No preview available'
                    }
                  >
                    {loadingPreviews[track.id] ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : playingTrack === track.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                    
                    {previewUrls[track.id] && !loadingPreviews[track.id] && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    )}
                    
                    {previewErrors[track.id] && !loadingPreviews[track.id] && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background text-xs flex items-center justify-center">
                        ✕
                      </div>
                    )}
                  </Button>

                   <div className="flex-1 cursor-pointer" onClick={() => handleTrackClick(track)}>
                     <h3 className="text-xl font-['Orbitron'] font-bold text-primary mb-1 hover:text-neon transition-colors">
                       {track.title}
                     </h3>
                     <p className="text-lg text-accent font-['Rajdhani'] font-medium mb-1 hover:text-neon-purple transition-colors">
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
                       className={`transition-colors ${
                         likedTracks.has(track.id)
                           ? 'text-red-400 hover:text-red-500 bg-red-400/20'
                           : 'text-muted-foreground hover:text-red-400 hover:bg-red-400/20'
                       }`}
                       onClick={() => handleLike(track)}
                       title={likedTracks.has(track.id) ? 'Remove from favorites' : 'Add to favorites'}
                     >
                       <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                     </Button>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="text-muted-foreground hover:text-primary hover:bg-primary/20"
                       onClick={() => handleShare(track)}
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