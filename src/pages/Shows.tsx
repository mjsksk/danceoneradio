import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, ExternalLink, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { Link, useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
interface Episode {
  title: string;
  description: string;
  pubDate: string;
  enclosure: {
    url: string;
    type: string;
  };
  duration?: string;
  guid: string;
  episodeNumber?: number;
}

// Array of episode numbers that have dedicated pages
const availableEpisodePages = [0, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415];

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use global audio player context
  const { playEpisode, pause, resume, isPlaying, episodeInfo, seek, audioRef: globalAudioRef } = useAudioPlayer();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEpisodes = async (retryCount = 0) => {
    const maxRetries = 3;
    let success = false;
    setLoading(true);
    
    // Add cache busting to get fresh RSS data
    const rssUrl = `https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml?t=${Date.now()}`;
    
    try {
      console.log('🔄 Fetching RSS feed via Supabase Edge Function with cache bust...', new Date().toISOString());
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('rss-feed-fetch', {
        body: { url: rssUrl }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data || !data.content) {
        throw new Error('No RSS content received');
      }

      const xmlContent = data.content;
      console.log('📄 XML Content preview:', xmlContent.substring(0, 200) + '...');
      
      console.log('📄 XML Content preview:', xmlContent?.substring(0, 200) + '...');
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check if parsing was successful
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent);
        throw new Error('Failed to parse RSS feed');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      console.log(`🎵 Found ${items.length} episodes in RSS feed`);
      
      // Log ALL episode titles for debugging
      console.log('📋 All episodes found in RSS feed:');
      Array.from(items).forEach((item, index) => {
        const title = item.querySelector('title')?.textContent;
        const pubDate = item.querySelector('pubDate')?.textContent;
        console.log(`  ${index + 1}. "${title}" - ${pubDate}`);
      });
      
      // Helper function to extract episode number from title
      const extractEpisodeNumber = (title: string): number => {
        // Look for patterns like "Future Dance Anthems with Mario 380", "Episode 389", etc.
        const patterns = [
          /Future Dance Anthems with Mario\s+(\d+)/i,
          /(?:episode|anthems|show)\s*#?(\d+)/i,
          /(\d+)(?:\s*-|\s*:|$)/,
          /\b(\d{1,4})\b/
        ];
        
        for (const pattern of patterns) {
          const match = title.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            // Only consider reasonable episode numbers (1-1000)
            if (num >= 1 && num <= 1000) {
              return num;
            }
          }
        }
        return 0; // Default if no episode number found
      };

      const episodeList: Episode[] = Array.from(items).map((item, index) => {
        const description = item.querySelector('description')?.textContent || '';
        const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
        const title = item.querySelector('title')?.textContent || '';
        
        const episode = {
          title,
          description: cleanDescription,
          pubDate: item.querySelector('pubDate')?.textContent || '',
          enclosure: {
            url: item.querySelector('enclosure')?.getAttribute('url') || '',
            type: item.querySelector('enclosure')?.getAttribute('type') || ''
          },
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || `episode-${index}`,
          episodeNumber: extractEpisodeNumber(title)
        };
        
        if (index < 3) {
          console.log(`Episode ${index + 1}:`, { 
            title: episode.title, 
            pubDate: episode.pubDate,
            episodeNumber: episode.episodeNumber 
          });
        }
        
        return episode;
      });

      // Sort episodes by episode number (highest to lowest)
      const sortedEpisodes = episodeList.sort((a, b) => {
        // If both have episode numbers, sort by number (highest first)
        if (a.episodeNumber && b.episodeNumber) {
          return b.episodeNumber - a.episodeNumber;
        }
        // If only one has episode number, prioritize it
        if (a.episodeNumber && !b.episodeNumber) return -1;
        if (!a.episodeNumber && b.episodeNumber) return 1;
        // If neither has episode number, maintain original RSS order
        return 0;
      });

      // Find the highest episode number for proper numbering
      const maxEpisodeNumber = Math.max(...sortedEpisodes.map(ep => ep.episodeNumber || 0));
      
      setEpisodes(sortedEpisodes.slice(0, 10));
      setTotalEpisodes(sortedEpisodes.length);
      console.log(`✅ RSS Update Complete: Updated with ${sortedEpisodes.length} total episodes, showing latest 10`);
      console.log(`📊 Latest episode number: ${maxEpisodeNumber}`);
      console.log(`🎵 Episode numbers found:`, sortedEpisodes.slice(0, 5).map(ep => ({ 
        title: ep.title, 
        number: ep.episodeNumber,
        pubDate: ep.pubDate 
      })));
      success = true;
    } catch (error) {
      console.error('❌ RSS Update Failed:', error);
      
      // Retry mechanism for mobile reliability
      if (retryCount < maxRetries && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`🔄 Retrying RSS fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchEpisodes(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        return;
      }
      
      // Set empty state on final failure
      setEpisodes([]);
      setTotalEpisodes(0);
    } finally {
      // Only set loading false when we're done with all retries or succeeded
      if (success || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEpisodes();

    // Set up hourly refresh
    const refreshInterval = setInterval(() => {
      fetchEpisodes();
    }, 3600000); // 1 hour = 3600000ms

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Scroll to episode if hash is present
  useEffect(() => {
    if (episodes.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#episode-')) {
        const episodeElement = document.querySelector(hash);
        if (episodeElement) {
          setTimeout(() => {
            episodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    }
  }, [episodes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to check if a specific episode is currently playing
  const isEpisodePlaying = useCallback((episodeNumber: number) => {
    return isPlaying && episodeInfo?.number === episodeNumber;
  }, [isPlaying, episodeInfo]);

  // Fetch saved progress and play episode from saved position
  const handlePlayPauseWithProgress = useCallback(async (episode: Episode) => {
    const episodeNumber = episode.episodeNumber || 0;
    
    // If this episode is already playing, toggle pause/resume
    if (episodeInfo?.number === episodeNumber) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }
    
    // Start playing the new episode
    playEpisode({
      number: episodeNumber,
      title: episode.title,
      audioUrl: episode.enclosure.url
    });
    
    // If user is logged in, fetch saved progress and seek to it
    if (user) {
      try {
        const { data } = await supabase
          .from('episode_listening_progress')
          .select('playback_position')
          .eq('user_id', user.id)
          .eq('episode_number', episodeNumber)
          .maybeSingle();
        
        if (data && data.playback_position > 0) {
          // Wait a moment for audio to load, then seek
          setTimeout(() => {
            seek(data.playback_position);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }
  }, [user, episodeInfo, isPlaying, playEpisode, pause, resume, seek]);

   const handleShareEpisode = async (episode: Episode, episodeIndex: number) => {
     const episodeNumber = episode.episodeNumber || (totalEpisodes - episodeIndex);

     // For episodes that have dedicated pages, share the ROOT-LEVEL social preview HTML.
     // This gives Facebook a stable, scraper-friendly URL with correct OG tags.
     const origin = window.location.origin;
     const hasDedicatedEpisodePage = availableEpisodePages.includes(episodeNumber);
     const canonicalEpisodeUrl = hasDedicatedEpisodePage
       ? `${origin}/episode/${episodeNumber}`
       : `${origin}/shows#episode-${episodeNumber}`;
     const socialShareUrl = hasDedicatedEpisodePage
       ? `${origin}/share-episode-${episodeNumber}.html`
       : canonicalEpisodeUrl;

     const shareData = {
       title: `${episode.title} - Future Dance Anthems with Mario`,
       // URL first: increases the chance Facebook turns it into a clickable link.
       text: `${socialShareUrl}\n\nListen to "${episode.title}" from Future Dance Anthems with Mario podcast. ${episode.description.substring(0, 100)}...`,
       url: socialShareUrl
     };

      // Desktop system share targets (notably Facebook) can produce a photo-style post where
      // the preview isn’t a clickable link. Detect “mobile” explicitly; otherwise treat it as desktop.
      const isLikelyMobile = (() => {
        try {
          const uaDataMobile = (navigator as unknown as { userAgentData?: { mobile?: boolean } })
            ?.userAgentData?.mobile;
          if (typeof uaDataMobile === 'boolean') return uaDataMobile;
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        } catch {
          return false;
        }
      })();

      // Some desktop share targets ignore the `url` field and only use `text`.
      // Keep it URL-only but provide it in both fields.
      const systemShareData: ShareData = !isLikelyMobile
        ? { url: socialShareUrl, text: socialShareUrl }
        : shareData;

    try {
       if (navigator.share && (!navigator.canShare || navigator.canShare(systemShareData))) {
         await navigator.share(systemShareData);
      } else {
        // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${socialShareUrl}\n\n${shareData.title}\n\n${episode.description}\n\n${canonicalEpisodeUrl}`);
        // You could add a toast notification here if you have one
        alert('Episode link copied to clipboard!');
      }
    } catch (error) {
      // Final fallback: just copy the URL
      try {
         await navigator.clipboard.writeText(canonicalEpisodeUrl);
        alert('Episode link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to share or copy:', error, clipboardError);
      }
    }
  };

  // Preload background image for better performance
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png';
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO 
        title="DJ Shows & Podcasts - Dance One Radio"
        description="Listen to exclusive DJ mixes, podcasts, and radio shows from Dance One Radio. New episodes weekly featuring the best electronic and dance music."
        keywords="DJ shows, dance music podcast, electronic music mixes, radio shows, DJ mixes, Future Dance Anthems"
        image="/lovable-uploads/mario-show.jpg"
        url={`${window.location.origin}/shows`}
      />
      {/* Optimized Background Image with lazy loading */}
      <div 
        className={`fixed inset-0 z-0 opacity-20 transition-opacity duration-500 ${
          bgLoaded ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          transform: 'translateZ(0)', // Force GPU acceleration
          backfaceVisibility: 'hidden'
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
        <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold mb-6">
                <span className="text-neon">SHOWS &</span>{" "}
                <span className="text-neon-purple">PODCASTS</span>
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-3xl mx-auto mb-8">
                Exclusive DJ mixes, podcasts, and guest sessions from Dance One Radio. Featuring infectious beats, catchy hooks, and high-energy vibes perfect for both clubbing and radio airplay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SocialShare 
                  url={window.location.href}
                  title="Future Dance Anthems with Mario - DJ Shows & Podcasts"
                  description="Listen to exclusive DJ mixes and podcasts featuring the best electronic and dance music. New episodes weekly."
                  image={`${window.location.origin}/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png`}
                  className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="shows-ad" slot={AD_SLOTS.HEADER} format="horizontal" />

        {/* Episodes + Guest Shows side-by-side */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Latest Episodes Column */}
              <div>
                <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-8 text-center">
                  <span className="text-neon">FUTURE DANCE ANTHEMS</span>{" "}
                  <span className="text-neon-purple">WITH MARIO</span>
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading episodes...</p>
                  </div>
                ) : episodes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No episodes available</p>
                  </div>
                ) : (
                  <div className="grid gap-6 content-start">
                    {episodes.map((episode, index) => {
                      const episodeNumber = episode.episodeNumber || (totalEpisodes - index);
                      const hasDedicatedPage = episode.episodeNumber !== undefined && episode.episodeNumber > 0 && availableEpisodePages.includes(episode.episodeNumber);

                      const cardContent = (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-4">
                            <img
                              src="/lovable-uploads/mario-show.jpg"
                              alt="Future Dance Anthems with Mario"
                              loading="lazy"
                              decoding="async"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                            />
                            <div className="bg-gradient-to-br from-neon to-neon-purple text-background rounded-full w-12 h-12 flex items-center justify-center font-['Orbitron'] font-bold text-base shrink-0">
                              #{episodeNumber}
                            </div>
                            <div className="flex-1 min-w-0" id={`episode-${episodeNumber}`}>
                              <h3 className={`text-lg md:text-xl font-['Orbitron'] font-bold mb-2 text-primary transition-colors break-words ${hasDedicatedPage ? 'group-hover:text-neon cursor-pointer' : ''}`}>
                                {episode.title}
                                {hasDedicatedPage && (
                                  <span className="inline-block ml-2 text-sm text-neon opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                )}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-neon" />
                                  <span>{formatDate(episode.pubDate)}</span>
                                </div>
                                {episode.duration && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-neon-purple" />
                                    <span>{episode.duration}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {episode.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {episode.enclosure.url && (
                              <Button
                                size="sm"
                                className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlayPauseWithProgress(episode);
                                }}
                              >
                                {isEpisodePlaying(episode.episodeNumber || 0) ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                {isEpisodePlaying(episode.episodeNumber || 0) ? 'Pause' : 'Play'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(`https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478`, '_blank');
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Apple
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShareEpisode(episode, index);
                              }}
                            >
                              Share
                            </Button>
                          </div>
                        </div>
                      );

                      const episodeCard = hasDedicatedPage ? (
                        <Card
                          key={episode.guid || index}
                          role="link"
                          tabIndex={0}
                          onClick={() => navigate(`/episode/${episode.episodeNumber}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/episode/${episode.episodeNumber}`);
                            }
                          }}
                          className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group cursor-pointer hover:border-neon/50"
                        >
                          {cardContent}
                        </Card>
                      ) : (
                        <Card key={episode.guid || index} className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group">
                          {cardContent}
                        </Card>
                      );

                      return (
                        <div key={episode.guid || index}>
                          {episodeCard}
                          {(index + 1) % 5 === 0 && index < episodes.length - 1 && (
                            <div className="mt-6">
                              <GoogleAds key={`shows-between-${index}`} slot={AD_SLOTS.BETWEEN_EPISODES} format="fluid" layout="in-article" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Guest Shows Column */}
              <div>
                <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-8 text-center">
                  <span className="text-neon">GUEST</span>{" "}
                  <span className="text-neon-purple">SHOWS</span>
                </h2>
                <div className="grid gap-6 content-start">
                  {(() => {
                    const guestShows = [
                      {
                        number: 236,
                        title: 'Wh0 Plays Sessions Episode 236',
                        subtitle: <span>House • Tech House • Dance</span>,
                        link: '/show/wh0-plays-sessions/236',
                        broadcastDate: '2026-07-03T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 235,
                        title: 'Wh0 Plays Sessions Episode 235 - Bad Intentions',
                        subtitle: <span>Guest Mix by <span className="text-primary font-semibold">Bad Intentions</span></span>,
                        link: '/show/wh0-plays-sessions/235',
                        broadcastDate: '2026-06-26T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 233,
                        title: 'Wh0 Plays Sessions Episode 233 with Johan S',
                        subtitle: <span>Guest Mix by <span className="text-primary font-semibold">Johan S</span></span>,
                        link: '/show/wh0-plays-sessions/233',
                        broadcastDate: '2026-06-19T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 232,
                        title: 'Wh0 Plays Sessions Episode 232 with Molly Mouse',
                        subtitle: <span>Guest Mix by <span className="text-primary font-semibold">Molly Mouse</span></span>,
                        link: '/show/wh0-plays-sessions/232',
                        broadcastDate: '2026-06-12T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 230,
                        title: 'Wh0 Plays Sessions Episode 230',
                        subtitle: '14 tracks • Wh0, Rue Jay, Jewel Kid, Mercer, LEFTI & more',
                        link: '/show/wh0-plays-sessions/230',
                        broadcastDate: '2026-05-29T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 226,
                        title: 'Wh0 Plays Sessions Episode 226',
                        subtitle: '15 tracks • Mark Knight, Wh0, Cristoph, CASSIMM & more',
                        link: '/show/wh0-plays-sessions/226',
                        broadcastDate: '2026-04-24T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 225,
                        title: 'Wh0 Plays Sessions Episode 225',
                        subtitle: '14 tracks • Mark Knight, Wh0, Rue Jay, Joshwa & more',
                        link: '/show/wh0-plays-sessions/225',
                        broadcastDate: '2026-04-17T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 224,
                        title: 'Wh0 Plays Sessions Episode 224',
                        subtitle: '15 tracks • Mark Knight, Wh0, Low Steppa & more',
                        link: '/show/wh0-plays-sessions/224',
                        broadcastDate: '2026-04-10T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 223,
                        title: 'Wh0 Plays Sessions Episode 223 — Bad Intentions',
                        subtitle: '17 tracks • Mark Knight, Afrojack, LP Giobbi & more',
                        link: '/show/wh0-plays-sessions/223',
                        broadcastDate: '2026-04-03T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                      {
                        number: 222,
                        title: 'Wh0 Plays Sessions Episode 222',
                        subtitle: <span>Guest Mix by <span className="text-primary font-semibold">Johan S</span></span>,
                        link: '/show/wh0-plays-sessions/222',
                        broadcastDate: '2026-03-27T18:00:00',
                        genres: 'House • Tech House • Dance',
                      },
                    ];

                    return guestShows.map((show) => {
                      const broadcastDate = new Date(show.broadcastDate);
                      const now = new Date();
                      const isPast = now > broadcastDate;
                      const isUpcoming = !isPast;

                      const formattedDate = broadcastDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      const shareGuestShow = async (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url = `${window.location.origin}${show.link}`;
                        const shareData = {
                          title: `${show.title} - Dance One Radio`,
                          text: `Listen to ${show.title} on Dance One Radio`,
                          url,
                        };
                        try {
                          if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
                            await navigator.share(shareData);
                          } else {
                            await navigator.clipboard.writeText(url);
                            alert('Episode link copied to clipboard!');
                          }
                        } catch {
                          try {
                            await navigator.clipboard.writeText(url);
                            alert('Episode link copied to clipboard!');
                          } catch (err) {
                            console.error('Failed to share:', err);
                          }
                        }
                      };

                      return (
                        <Link key={show.number} to={show.link} className="block">
                          <Card className="card-cyber p-5 hover:scale-[1.01] transition-all duration-300 group cursor-pointer hover:border-neon/50 h-full">
                            <div className="flex flex-col gap-4 h-full">
                              <div className="flex items-start gap-4">
                                <img
                                  src="/images/wh0-plays-sessions-logo.jpg"
                                  alt={`Wh0 Plays Sessions Episode ${show.number}`}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
                                />
                                <div className={`bg-gradient-to-br ${isUpcoming ? 'from-neon to-neon-purple' : 'from-neon/60 to-neon-purple/60'} text-background rounded-full w-12 h-12 flex items-center justify-center font-['Orbitron'] font-bold text-base shrink-0`}>
                                  #{show.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg md:text-xl font-['Orbitron'] font-bold text-primary group-hover:text-neon transition-colors break-words mb-2">
                                    {show.title}
                                    <span className="inline-block ml-2 text-sm text-neon opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      {isUpcoming ? (
                                        <>
                                          <Calendar className="w-3.5 h-3.5 text-neon" />
                                          <span>
                                            {broadcastDate.toLocaleDateString('en-US', { weekday: 'long' })} at{' '}
                                            {broadcastDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                          <span>Aired {formattedDate}</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                      {show.genres}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {show.subtitle}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-auto">
                                <Button
                                  size="sm"
                                  className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(show.link);
                                  }}
                                >
                                  <Play className="w-4 h-4" />
                                  Open
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-muted-foreground hover:text-primary"
                                  onClick={shareGuestShow}
                                >
                                  Share
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default Shows;