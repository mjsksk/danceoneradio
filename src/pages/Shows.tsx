import { useState, useEffect, useMemo, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { useSearchParams } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { parseBroadcastDate } from '@/lib/broadcastTime';
import { WH0_SESSIONS } from '@/data/wh0Sessions';
import Wh0SessionCard from '@/components/shows/Wh0SessionCard';
import MarioEpisodeCard, { type MarioEpisode } from '@/components/shows/MarioEpisodeCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type Episode = MarioEpisode;

// Array of episode numbers that have dedicated pages
const availableEpisodePages = [0, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421];

const PAGE_SIZE = 10;

type ShowFilter = 'all' | 'fda' | 'wh0';

const SHOW_TABS: { value: ShowFilter; label: string }[] = [
  { value: 'all', label: 'All Shows' },
  { value: 'fda', label: 'Future Dance Anthems' },
  { value: 'wh0', label: 'Wh0 Plays Sessions' },
];

type FeedItem =
  | { kind: 'fda'; key: string; date: number; episode: Episode; episodeNumber: number }
  | { kind: 'wh0'; key: string; date: number; session: (typeof WH0_SESSIONS)[number] };

const Shows = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Use global audio player context
  const { playEpisode, pause, resume, isPlaying, episodeInfo, seek } = useAudioPlayer();
  const { user } = useAuth();

  const showParam = (searchParams.get('show') || 'all') as ShowFilter;
  const activeTab: ShowFilter = SHOW_TABS.some((t) => t.value === showParam) ? showParam : 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const requestedPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

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
        body: { url: rssUrl },
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data || !data.content) {
        throw new Error('No RSS content received');
      }

      const xmlContent = data.content;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent);
        throw new Error('Failed to parse RSS feed');
      }

      const items = xmlDoc.querySelectorAll('item');
      console.log(`🎵 Found ${items.length} episodes in RSS feed`);

      // Helper function to extract episode number from title
      const extractEpisodeNumber = (title: string): number => {
        const patterns = [
          /Future Dance Anthems with Mario\s+(\d+)/i,
          /(?:episode|anthems|show)\s*#?(\d+)/i,
          /(\d+)(?:\s*-|\s*:|$)/,
          /\b(\d{1,4})\b/,
        ];

        for (const pattern of patterns) {
          const match = title.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (num >= 1 && num <= 1000) {
              return num;
            }
          }
        }
        return 0;
      };

      const episodeList: Episode[] = Array.from(items).map((item, index) => {
        const description = item.querySelector('description')?.textContent || '';
        const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
        const title = item.querySelector('title')?.textContent || '';

        return {
          title,
          description: cleanDescription,
          pubDate: item.querySelector('pubDate')?.textContent || '',
          enclosure: {
            url: item.querySelector('enclosure')?.getAttribute('url') || '',
            type: item.querySelector('enclosure')?.getAttribute('type') || '',
          },
          duration: item.querySelector('itunes\\:duration, duration')?.textContent || '',
          guid: item.querySelector('guid')?.textContent || `episode-${index}`,
          episodeNumber: extractEpisodeNumber(title),
        };
      });

      const sortedEpisodes = episodeList.sort((a, b) => {
        if (a.episodeNumber && b.episodeNumber) return b.episodeNumber - a.episodeNumber;
        if (a.episodeNumber && !b.episodeNumber) return -1;
        if (!a.episodeNumber && b.episodeNumber) return 1;
        return 0;
      });

      setEpisodes(sortedEpisodes);
      setTotalEpisodes(sortedEpisodes.length);
      console.log(`✅ RSS Update Complete: ${sortedEpisodes.length} episodes loaded`);
      success = true;
    } catch (error) {
      console.error('❌ RSS Update Failed:', error);

      if (retryCount < maxRetries && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
        console.log(`🔄 Retrying RSS fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchEpisodes(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        return;
      }

      setEpisodes([]);
      setTotalEpisodes(0);
    } finally {
      if (success || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEpisodes();
    const refreshInterval = setInterval(() => {
      fetchEpisodes();
    }, 3600000);
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

  // Helper to check if a specific episode is currently playing
  const isEpisodePlaying = useCallback((episodeNumber: number) => {
    return isPlaying && episodeInfo?.number === episodeNumber;
  }, [isPlaying, episodeInfo]);

  // Fetch saved progress and play episode from saved position
  const handlePlayPauseWithProgress = useCallback(async (episode: Episode) => {
    const episodeNumber = episode.episodeNumber || 0;

    if (episodeInfo?.number === episodeNumber) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    playEpisode({
      number: episodeNumber,
      title: episode.title,
      audioUrl: episode.enclosure.url,
    });

    if (user) {
      try {
        const { data } = await supabase
          .from('episode_listening_progress')
          .select('playback_position')
          .eq('user_id', user.id)
          .eq('episode_number', episodeNumber)
          .maybeSingle();

        if (data && data.playback_position > 0) {
          setTimeout(() => {
            seek(data.playback_position);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }
  }, [user, episodeInfo, isPlaying, playEpisode, pause, resume, seek]);

  const handleShareEpisode = async (episode: Episode, episodeNumber: number) => {
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
      text: `${socialShareUrl}\n\nListen to "${episode.title}" from Future Dance Anthems with Mario podcast. ${episode.description.substring(0, 100)}...`,
      url: socialShareUrl,
    };

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

    const systemShareData: ShareData = !isLikelyMobile
      ? { url: socialShareUrl, text: socialShareUrl }
      : shareData;

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(systemShareData))) {
        await navigator.share(systemShareData);
      } else {
        await navigator.clipboard.writeText(`${socialShareUrl}\n\n${shareData.title}\n\n${episode.description}\n\n${canonicalEpisodeUrl}`);
        alert('Episode link copied to clipboard!');
      }
    } catch (error) {
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

  // ---- Unified, sorted feed -------------------------------------------------
  const feedItems: FeedItem[] = useMemo(() => {
    const fdaItems: FeedItem[] = episodes.map((episode, index) => ({
      kind: 'fda',
      key: episode.guid || `fda-${index}`,
      date: new Date(episode.pubDate).getTime() || 0,
      episode,
      episodeNumber: episode.episodeNumber || (totalEpisodes - index),
    }));

    const wh0Items: FeedItem[] = WH0_SESSIONS.map((session) => ({
      kind: 'wh0',
      key: `wh0-${session.number}`,
      date: parseBroadcastDate(session.broadcastDate).getTime(),
      session,
    }));

    const merged =
      activeTab === 'fda' ? fdaItems : activeTab === 'wh0' ? wh0Items : [...fdaItems, ...wh0Items];

    return merged.sort((a, b) => b.date - a.date);
  }, [episodes, totalEpisodes, activeTab]);

  const totalPages = Math.max(1, Math.ceil(feedItems.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  // Cumulative "load more" feed: page N shows the first N * PAGE_SIZE items
  const pageItems = feedItems.slice(0, currentPage * PAGE_SIZE);
  const hasMore = currentPage < totalPages;

  const scrollToFeed = () => {
    const el = document.getElementById('shows-feed');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('show');
    } else {
      params.set('show', value);
    }
    params.delete('page');
    setSearchParams(params, { replace: false });
    scrollToFeed();
  };

  const goToPage = (page: number, scroll = true) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    setSearchParams(params, { replace: false });
    if (scroll) scrollToFeed();
  };

  const loadMore = () => goToPage(currentPage + 1, false);


  const activeTabLabel = SHOW_TABS.find((t) => t.value === activeTab)?.label ?? 'All Shows';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <SEO
        title="DJ Shows & Podcasts - Dance One Radio"
        description="Listen to exclusive DJ mixes, podcasts, and radio shows from Dance One Radio. New episodes weekly featuring the best electronic and dance music."
        keywords="DJ shows, dance music podcast, electronic music mixes, radio shows, DJ mixes, Future Dance Anthems, Wh0 Plays Sessions"
        image="/lovable-uploads/mario-show.jpg"
        url={`${window.location.origin}/shows`}
        noindex={currentPage > 1}
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
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10">
        <Navigation />

        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 animate-fade-in">
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

          {/* Unified, tabbed and paginated episode feed */}
          <section className="py-12 relative" id="shows-feed">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
                  <TabsList className="mx-auto flex h-auto w-full max-w-2xl flex-wrap justify-center gap-1 bg-card/60 backdrop-blur border border-primary/20 p-1">
                    {SHOW_TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="font-['Rajdhani'] text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon data-[state=active]:to-neon-purple data-[state=active]:text-background"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <h2 className="sr-only">{activeTabLabel} episodes</h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading episodes...</p>
                  </div>
                ) : pageItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No episodes available</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-sm text-muted-foreground mb-6 font-['Rajdhani']">
                      Showing {pageItems.length} of {feedItems.length} episodes
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr items-stretch">
                      {pageItems.map((item, index) => (
                        <Fragment key={item.key}>
                          <div className="h-full">
                            {item.kind === 'fda' ? (
                              <MarioEpisodeCard
                                episode={item.episode}
                                episodeNumber={item.episodeNumber}
                                hasDedicatedPage={
                                  item.episode.episodeNumber !== undefined &&
                                  item.episode.episodeNumber > 0 &&
                                  availableEpisodePages.includes(item.episode.episodeNumber)
                                }
                                isPlaying={isEpisodePlaying(item.episode.episodeNumber || 0)}
                                onPlayPause={handlePlayPauseWithProgress}
                                onShare={handleShareEpisode}
                              />
                            ) : (
                              <Wh0SessionCard show={item.session} />
                            )}
                          </div>
                          {(index + 1) % 10 === 0 && index < pageItems.length - 1 && (
                            <div className="lg:col-span-2 row-auto">
                              <GoogleAds
                                key={`shows-between-${index}`}
                                slot={AD_SLOTS.BETWEEN_EPISODES}
                                format="fluid"
                                layout="in-article"
                              />
                            </div>
                          )}
                        </Fragment>
                      ))}
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-3">
                      {hasMore ? (
                        <>
                          <Button
                            onClick={loadMore}
                            size="lg"
                            className="font-['Rajdhani'] font-bold bg-gradient-to-r from-neon to-neon-purple text-background hover:opacity-90"
                          >
                            Load more episodes
                          </Button>
                          <p className="text-xs text-muted-foreground font-['Rajdhani']">
                            Page {currentPage} of {totalPages}
                          </p>
                        </>
                      ) : (
                        totalPages > 1 && (
                          <p className="text-sm text-muted-foreground font-['Rajdhani']">
                            You&apos;ve reached the end of the archive
                          </p>
                        )
                      )}
                    </div>

                  </>
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
