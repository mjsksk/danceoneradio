import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, ExternalLink, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { Link } from 'react-router-dom';
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
const availableEpisodePages = [389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402];

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use global audio player context
  const { playEpisode, pause, resume, isPlaying, episodeInfo, seek, audioRef: globalAudioRef } = useAudioPlayer();
  const { user } = useAuth();

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
      // the preview isn’t a clickable link. Sharing URL-only encourages a proper link attachment.
      const isDesktopPointer = (() => {
        try {
          return window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false;
        } catch {
          return false;
        }
      })();

      const systemShareData: ShareData = isDesktopPointer ? { url: socialShareUrl } : shareData;

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
                <span className="text-neon">FUTURE DANCE</span>{" "}
                <span className="text-neon-purple">ANTHEMS</span>
              </h1>
              <p className="text-xl text-muted-foreground font-['Rajdhani'] max-w-3xl mx-auto mb-8">
                Dance anthems that consistently rule the dance and electronic scene. Featuring infectious beats, catchy hooks, and high-energy vibes perfect for both clubbing and radio airplay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                    onClick={() => {
                      if (episodes.length > 0 && episodes[0].enclosure.url) {
                        handlePlayPauseWithProgress(episodes[0]);
                      }
                    }}
                  disabled={loading || episodes.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Listen Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 hover:scale-105 transition-transform"
                  onClick={() => window.open('https://podcasts.apple.com/us/podcast/future-dance-anthems-with-mario/id1439656478', '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Apple Podcasts
                </Button>
                
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

        {/* Podcast Stats */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-neon mb-2">
                    {totalEpisodes}
                  </div>
                  <div className="text-muted-foreground">Latest Episodes</div>
                </Card>
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-neon-purple mb-2">
                    Bi-Weekly
                  </div>
                  <div className="text-muted-foreground">Release Schedule</div>
                </Card>
                <Card className="card-cyber p-6 text-center">
                  <div className="text-3xl font-['Orbitron'] font-bold text-primary mb-2">
                    EDM
                  </div>
                  <div className="text-muted-foreground">Genre Focus</div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <GoogleAds key="shows-ad" slot="6777392184" />

        {/* Episodes List */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-12 text-center">
                <span className="text-neon-purple">LATEST EPISODES</span>
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
                <div className="grid gap-8">
                  {episodes.map((episode, index) => (
                    <Card key={episode.guid || index} className="card-cyber p-8 hover:scale-[1.01] transition-all duration-300 group">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Episode Number Badge */}
                        <div className="lg:w-20 flex lg:flex-col items-center lg:items-start gap-4">
                           <div className="bg-gradient-to-br from-neon to-neon-purple text-background rounded-full w-16 h-16 flex items-center justify-center font-['Orbitron'] font-bold text-lg">
                             #{episode.episodeNumber || (totalEpisodes - index)}
                           </div>
                        </div>

                        {/* Episode Content */}
                         <div className="flex-1 space-y-4">
                              <div id={`episode-${episode.episodeNumber || (totalEpisodes - index)}`}>
                               {episode.episodeNumber && availableEpisodePages.includes(episode.episodeNumber) ? (
                                 <Link 
                                   to={`/episode/${episode.episodeNumber}`}
                                   className="block group/link"
                                   key={`link-${index}-${episode.guid || 'no-guid'}`}
                                 >
                                   <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary group-hover/link:text-neon transition-colors cursor-pointer hover:underline">
                                     {episode.title}
                                   </h3>
                                 </Link>
                               ) : (
                                 <h3 className="text-xl md:text-2xl font-['Orbitron'] font-bold mb-3 text-primary group-hover:text-neon transition-colors">
                                   {episode.title}
                                 </h3>
                               )}
                            
                            <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-neon" />
                                <span>{formatDate(episode.pubDate)}</span>
                              </div>
                              {episode.duration && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-neon-purple" />
                                  <span>{episode.duration}</span>
                                </div>
                              )}
                              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                EDM • House • Dance
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {episode.description.length > 300 
                              ? `${episode.description.substring(0, 300)}...` 
                              : episode.description}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="lg:w-52 flex flex-col gap-3">
                          {episode.enclosure.url && (
                            <Button 
                              className="w-full flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-neon to-neon-purple text-background hover:shadow-lg hover:shadow-neon/25"
                              onClick={() => handlePlayPauseWithProgress(episode)}
                            >
                              {isEpisodePlaying(episode.episodeNumber || 0) ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              {isEpisodePlaying(episode.episodeNumber || 0) ? 'Pause' : 'Play'} Episode
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center gap-2 hover:scale-105 transition-all duration-200 border-primary/30 hover:border-primary hover:bg-primary/10"
                            onClick={() => window.open(`https://podcasts.apple.com/podcast/future-dance-anthems-with-mario/id1439656478`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Apple Podcasts
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleShareEpisode(episode, index)}
                          >
                            Share Episode
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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