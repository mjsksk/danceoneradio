import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, ExternalLink, Calendar, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';

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
}

interface EpisodeCache {
  episodes: Episode[];
  totalEpisodes: number;
  lastFetch: number;
  lastEpisodeGuid: string;
  cacheVersion: string;
}

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [backgroundUpdating, setBackgroundUpdating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const CACHE_KEY = 'podcast_episodes_cache';
  const CACHE_VERSION = '1.0';
  const CACHE_EXPIRY_HOURS = 2;

  // Cache management functions
  const saveEpisodesToCache = (episodes: Episode[], totalEpisodes: number) => {
    const cache: EpisodeCache = {
      episodes,
      totalEpisodes,
      lastFetch: Date.now(),
      lastEpisodeGuid: episodes[0]?.guid || '',
      cacheVersion: CACHE_VERSION
    };
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Episodes cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache episodes:', error);
    }
  };

  const loadEpisodesFromCache = (): EpisodeCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cache: EpisodeCache = JSON.parse(cached);
      
      // Check cache version
      if (cache.cacheVersion !== CACHE_VERSION) {
        console.log('🔄 Cache version mismatch, clearing cache');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Check cache expiry
      const cacheAge = Date.now() - cache.lastFetch;
      const cacheExpired = cacheAge > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      console.log(`📦 Cache found: ${cache.episodes.length} episodes, age: ${Math.round(cacheAge / 60000)}min, expired: ${cacheExpired}`);
      
      return cache;
    } catch (error) {
      console.warn('⚠️ Failed to load cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const fetchEpisodes = async (retryCount = 0, isBackgroundUpdate = false) => {
    console.log(`📺 Shows: fetchEpisodes called - retry: ${retryCount}, background: ${isBackgroundUpdate}`);
    const maxRetries = 3;
    
    // Set loading states
    if (!isBackgroundUpdate && retryCount === 0) {
      setLoading(true);
    }
    if (isBackgroundUpdate && retryCount === 0) {
      setBackgroundUpdating(true);
    }
    
    try {
      console.log(`🔄 Fetching RSS feed (attempt ${retryCount + 1})${isBackgroundUpdate ? ' [background]' : ''}...`);
      
      // Add timeout for mobile connections
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Try multiple proxy services for better reliability
      const proxyUrls = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy/?quest='
      ];
      
      let response;
      let lastError;
      
      for (const proxyUrl of proxyUrls) {
        try {
          const fullUrl = `${proxyUrl}${encodeURIComponent('https://feeds.blubrry.com/feeds/biggest_tunes_with_mario_135.xml')}`;
          response = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (response.ok) {
            break; // Success, exit loop
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          lastError = error;
          console.warn(`Failed with proxy ${proxyUrl}:`, error);
          continue; // Try next proxy
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All proxy services failed');
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we received HTML instead of XML
      if (data.contents && data.contents.includes('<!DOCTYPE html>')) {
        throw new Error('Invalid podcast feed URL');
      }
      
      // Handle base64 encoded data
      let xmlContent = data.contents;
      if (typeof data.contents === 'string' && data.contents.startsWith('data:application/rss+xml')) {
        const base64Content = data.contents.split(',')[1];
        xmlContent = atob(base64Content);
      }
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Failed to parse RSS feed');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      
      const episodeList: Episode[] = Array.from(items).map((item, index) => {
        const description = item.querySelector('description')?.textContent || '';
        const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
        
        return {
          title: item.querySelector('title')?.textContent || '',
          description: cleanDescription,
          pubDate: item.querySelector('pubDate')?.textContent || '',
          enclosure: {
            url: item.querySelector('enclosure')?.getAttribute('url') || '',
            type: item.querySelector('enclosure')?.getAttribute('type') || ''
          },
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || `episode-${index}`
        };
      });
      
      // Check if this is a background update and if there are new episodes
      if (isBackgroundUpdate) {
        const currentLatestGuid = episodes[0]?.guid;
        const newLatestGuid = episodeList[0]?.guid;
        
        if (currentLatestGuid === newLatestGuid) {
          console.log('✅ Background check: No new episodes found');
          setBackgroundUpdating(false);
          return;
        } else {
          console.log('🆕 New episodes detected, updating...');
        }
      }
      
      const displayEpisodes = episodeList.slice(0, 10);
      setEpisodes(displayEpisodes);
      setTotalEpisodes(episodeList.length);
      
      // Save to cache
      saveEpisodesToCache(displayEpisodes, episodeList.length);
      
      console.log(`✅ RSS Update Complete: Updated with ${episodeList.length} total episodes, showing latest 10`);
      
      if (!isBackgroundUpdate) {
        setLoading(false);
      } else {
        setBackgroundUpdating(false);
      }
      
    } catch (error) {
      console.error(`❌ RSS Update Failed${isBackgroundUpdate ? ' [background]' : ''}:`, error);
      
      // Retry mechanism
      if (retryCount < maxRetries && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`🔄 Retrying RSS fetch (attempt ${retryCount + 1}/${maxRetries}) in ${Math.pow(2, retryCount)}s...`);
        setTimeout(() => {
          fetchEpisodes(retryCount + 1, isBackgroundUpdate);
        }, Math.pow(2, retryCount) * 1000);
        return;
      }
      
      // Final failure
      console.log(`❌ All RSS fetch attempts failed${isBackgroundUpdate ? ' [background]' : ''}`);
      
      if (!isBackgroundUpdate) {
        setEpisodes([]);
        setTotalEpisodes(0);
        setLoading(false);
      } else {
        setBackgroundUpdating(false);
      }
    }
  };

  useEffect(() => {
    console.log('📺 Shows page: useEffect running, loading episodes...');
    // Load cached episodes immediately
    const cache = loadEpisodesFromCache();
    
    if (cache) {
      setEpisodes(cache.episodes);
      setTotalEpisodes(cache.totalEpisodes);
      setLoading(false);
      console.log('⚡ Loaded episodes from cache immediately');
      
      // Check cache age
      const cacheAge = Date.now() - cache.lastFetch;
      const shouldUpdate = cacheAge > (30 * 60 * 1000); // Update if cache older than 30 minutes
      
      if (shouldUpdate) {
        console.log('🔄 Cache is getting stale, checking for updates in background...');
        setTimeout(() => {
          fetchEpisodes(0, true);
        }, 1000); // Start background update after 1 second
      }
    } else {
      // No cache, do initial fetch
      console.log('📭 No cache found, fetching episodes...');
      fetchEpisodes();
    }

    // Set up background refresh every 2 hours
    const refreshInterval = setInterval(() => {
      console.log('⏰ Scheduled background update...');
      fetchEpisodes(0, true);
    }, 2 * 60 * 60 * 1000); // 2 hours

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

  const handlePlayPause = (episodeUrl: string, episodeGuid: string) => {
    // If same episode is playing, toggle play/pause
    if (currentlyPlaying === episodeGuid && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Start new episode
    const audio = new Audio(episodeUrl);
    audioRef.current = audio;
    setCurrentlyPlaying(episodeGuid);
    
    audio.play().catch(console.error);
    
    // Handle when audio ends
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    // Handle errors
    audio.addEventListener('error', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });
  };

   const handleShareEpisode = async (episode: Episode, episodeIndex: number) => {
     const episodeUrl = `${window.location.origin}/shows#episode-${totalEpisodes - episodeIndex}`;
     const shareData = {
       title: `${episode.title} - Future Dance Anthems with Mario`,
       text: `Listen to "${episode.title}" from Future Dance Anthems with Mario podcast. ${episode.description.substring(0, 100)}...`,
       url: episodeUrl
     };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        // You could add a toast notification here if you have one
        alert('Episode link copied to clipboard!');
      }
    } catch (error) {
      // Final fallback: just copy the URL
      try {
        await navigator.clipboard.writeText(episodeUrl);
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
        title="Future Dance Anthems with Mario - Shows | Dance One Radio"
        description="Weekly episodes featuring the latest in electronic dance music. Dance anthems that consistently rule the dance and electronic scene."
        image="/lovable-uploads/39bbc48a-9525-463e-bca3-5c21e59f1db7.png"
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
                <Button size="lg" className="text-lg px-8 py-4 hover:scale-105 transition-transform">
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
                  url={`${window.location.origin}/shows`}
                  title="Future Dance Anthems with Mario - Shows"
                  description="Weekly episodes featuring the latest in electronic dance music"
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

        {/* Episodes List */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-['Orbitron'] font-bold mb-12 text-center">
                <span className="text-neon-purple">LATEST EPISODES</span>
                {backgroundUpdating && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="animate-pulse text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon rounded-full animate-ping"></div>
                      Checking for new episodes...
                    </div>
                  </div>
                )}
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
                             #{totalEpisodes - index}
                           </div>
                        </div>

                        {/* Episode Content */}
                        <div className="flex-1 space-y-4">
                          <div id={`episode-${totalEpisodes - index}`}>
                            {(episode.title.toLowerCase().includes("389") || 
                              episode.title.toLowerCase().includes("anthems of the week 389") ||
                              episode.title.toLowerCase().includes("anthems") && episode.title.includes("389")) ? (
                              <Link 
                                to="/episode/389"
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
                              onClick={() => handlePlayPause(episode.enclosure.url, episode.guid)}
                            >
                              {currentlyPlaying === episode.guid && audioRef.current && !audioRef.current.paused ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              {currentlyPlaying === episode.guid && audioRef.current && !audioRef.current.paused ? 'Pause' : 'Play'} Episode
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