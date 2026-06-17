import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import TrackAffiliateLinks from '@/components/TrackAffiliateLinks';
import { Play, Pause, Download, Heart, Share2, Clock, RefreshCw, Radio } from 'lucide-react';
import { RadioStreamService } from '@/utils/RadioStreamService';
import { supabase } from '@/integrations/supabase/client';
import stationLogo from '@/assets/dance-one-logo.png';

interface Track {
  id: string;
  stableKey: string;
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
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [albumArt, setAlbumArt] = useState<Record<string, string | null>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string | null>>({});
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  const getTrackLikeKey = (track: Track) => track.stableKey || `${track.artist}::${track.title}::${track.playedAt}`;
  

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
         setLikedTracks(new Set((Array.isArray(likedTrackIds) ? likedTrackIds : []).map(String)));
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

  // Fetch album art AND preview URLs when tracks change - batched and parallelized
  useEffect(() => {
    const fetchAlbumArtBatched = async () => {
      const tracksNeedingArt = tracks.filter(track => albumArt[track.id] === undefined);
      if (tracksNeedingArt.length === 0) return;

      console.log(`🎵 Fetching album art + previews for ${tracksNeedingArt.length} tracks`);
      
      const CONCURRENCY = 5;
      const artResults: Record<number, string | null> = {};
      const previewResults: Record<number, string | null> = {};
      
      for (let i = 0; i < tracksNeedingArt.length; i += CONCURRENCY) {
        const batch = tracksNeedingArt.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async (track) => {
          try {
            const cleanedQuery = cleanTrackForSearch(track.artist, track.title);
            const { data, error } = await supabase.functions.invoke('album-art-search', {
              body: { query: cleanedQuery }
            });
            if (!error && data) {
              if (data.imageUrl) artResults[track.id] = data.imageUrl;
              if (data.previewUrl) previewResults[track.id] = data.previewUrl;
            }
          } catch (error) {
            console.error(`🎵 Failed to fetch art for ${track.artist}:`, error);
          }
        }));
      }
      
      if (Object.keys(artResults).length > 0) {
        setAlbumArt(prev => ({ ...prev, ...artResults }));
      }
      if (Object.keys(previewResults).length > 0) {
        setPreviewUrls(prev => ({ ...prev, ...previewResults }));
        console.log(`🎵 ✅ Found ${Object.keys(previewResults).length} iTunes previews`);
      }
    };

    if (tracks.length > 0) {
      fetchAlbumArtBatched();
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

  const recentlyTrackedRef = useRef<Map<string, number>>(new Map());

  const recordPreviewPlay = (track: Track) => {
    const now = Date.now();
    const last = recentlyTrackedRef.current.get(track.id) ?? 0;
    if (now - last < 5000) return; // debounce 5s per track
    recentlyTrackedRef.current.set(track.id, now);
    supabase.functions
      .invoke('track-preview-play', {
        body: {
          title: track.title,
          artist: track.artist,
          pagePath: typeof window !== 'undefined' ? window.location.pathname : null,
        },
      })
      .catch((err) => console.warn('🎵 Failed to record preview play:', err));
  };

  const handlePlayPause = async (trackId: string) => {
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
          const track = tracks.find(t => t.id === trackId);
          if (track) recordPreviewPlay(track);
        } catch (error) {
          console.error('Failed to play Apple Music preview:', error);
          setPlayingTrack(null);
        }
      } else {
        console.log(`🎵 No Apple Music preview available for track ${trackId}`);
        // For now, just show visual feedback without playing audio
        setPlayingTrack(trackId);
        const track = tracks.find(t => t.id === trackId);
        if (track) recordPreviewPlay(track);
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
    const likeKey = getTrackLikeKey(track);
    const newLikedTracks = new Set(likedTracks);
    const isLiking = !likedTracks.has(likeKey);

    if (isLiking) {
      newLikedTracks.add(likeKey);
    } else {
      newLikedTracks.delete(likeKey);
    }

    setLikedTracks(newLikedTracks);
    localStorage.setItem('likedTracks', JSON.stringify(Array.from(newLikedTracks)));

    // Fire-and-forget tracking (uses supabase client so apikey header is included)
    supabase.functions
      .invoke('track-like', {
        body: {
          title: track.title,
          artist: track.artist,
          action: isLiking ? 'like' : 'unlike',
          trackHistoryId: track.id,
          pagePath: window.location.pathname,
        },
      })
      .catch(() => {});
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
              key={track.stableKey}
              className="card-cyber p-6 animate-fade-in group"
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
                          loading="lazy"
                          decoding="async"
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
                            decoding="async"
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
                    aria-label={playingTrack === track.id ? `Pause preview of ${track.title}` : `Play preview of ${track.title}`}
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
                       <span className="hidden sm:inline">•</span>
                       <div className="hidden sm:flex">
                         <TrackAffiliateLinks title={track.title} artist={track.artist} variant="desktop" />
                       </div>
                     </div>
                      {track.artist && track.title && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <a
                            href={`https://www.amazon.com/s?k=${encodeURIComponent(`${track.artist} ${track.title}`)}&tag=danceone-20`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-['Rajdhani'] bg-primary text-primary-foreground hover:bg-primary/80 transition-colors shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🛒 Buy on Amazon
                          </a>
                          <a
                            href={`https://www.beatport.com/search?q=${encodeURIComponent(`${track.artist} ${track.title}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-['Rajdhani'] border border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎵 Open on Beatport
                          </a>
                        </div>
                      )}
                     <div className="sm:hidden">
                       <TrackAffiliateLinks title={track.title} artist={track.artist} variant="mobile" />
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
                         likedTracks.has(getTrackLikeKey(track))
                           ? 'text-red-400 hover:text-red-500 bg-red-400/20'
                           : 'text-muted-foreground hover:text-red-400 hover:bg-red-400/20'
                       }`}
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleLike(track);
                       }}
                        title={likedTracks.has(getTrackLikeKey(track)) ? 'Remove from favorites' : 'Add to favorites'}
                     >
                        <Heart className={`w-4 h-4 ${likedTracks.has(getTrackLikeKey(track)) ? 'fill-current' : ''}`} />
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
