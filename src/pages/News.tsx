import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Music, CalendarDays, Users, TrendingUp, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NewsFeaturedHero } from '@/components/news/NewsFeaturedHero';
import { NewsCategorySection } from '@/components/news/NewsCategorySection';
import { useNewsArticles, useFeaturedArticle, NewsCategory } from '@/hooks/useNewsArticles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const News = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const { data: featuredArticle, isLoading: featuredLoading } = useFeaturedArticle();
  const { data: headlines, isLoading: headlinesLoading, refetch: refetchHeadlines } = useNewsArticles({ category: 'headline', limit: 4 });
  const { data: releases, isLoading: releasesLoading, refetch: refetchReleases } = useNewsArticles({ category: 'release', limit: 4 });
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useNewsArticles({ category: 'event', limit: 4 });
  const { data: artistNews, isLoading: artistLoading, refetch: refetchArtist } = useNewsArticles({ category: 'artist', limit: 4 });
  const { data: industry, isLoading: industryLoading, refetch: refetchIndustry } = useNewsArticles({ category: 'industry', limit: 4 });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edm-news-fetcher');
      
      if (error) throw error;
      
      toast({
        title: "News Updated!",
        description: `Fetched ${data.fetched} articles, ${data.inserted} new.`,
      });
      
      // Refetch all queries
      await Promise.all([
        refetchHeadlines(),
        refetchReleases(),
        refetchEvents(),
        refetchArtist(),
        refetchIndustry(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not fetch latest news. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <SEO 
        title="EDM News - Dance Music Updates & Festival Announcements | Dance One Radio"
        description="Stay updated with the latest EDM news, dance music releases, festival announcements, and artist spotlights. Your daily source for electronic music culture."
        keywords="EDM news, dance music updates, festival announcements, electronic music news, DJ news, music releases"
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="text-primary">EDM</span> News
              </h1>
              <p className="text-muted-foreground">
                Your daily source for electronic dance music updates
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hidden md:flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Featured Story */}
          <section className="mb-12">
            <NewsFeaturedHero article={featuredArticle || null} isLoading={featuredLoading} />
          </section>

          {/* Category Tabs for Mobile */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="w-full md:w-auto flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All News
              </TabsTrigger>
              <TabsTrigger value="releases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Releases
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Events
              </TabsTrigger>
              <TabsTrigger value="artists" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Artists
              </TabsTrigger>
              <TabsTrigger value="industry" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Industry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <NewsCategorySection
                title="Latest Headlines"
                icon={<Newspaper className="w-6 h-6 text-primary" />}
                articles={headlines || []}
                isLoading={headlinesLoading}
                linkTo="/news/top-stories"
              />
              
              <NewsCategorySection
                title="New Releases"
                icon={<Music className="w-6 h-6 text-green-400" />}
                articles={releases || []}
                isLoading={releasesLoading}
                linkTo="/news/artists-releases"
              />
              
              <NewsCategorySection
                title="Festivals & Events"
                icon={<CalendarDays className="w-6 h-6 text-purple-400" />}
                articles={events || []}
                isLoading={eventsLoading}
                linkTo="/news/festivals-events"
              />
              
              <NewsCategorySection
                title="Artist Spotlight"
                icon={<Users className="w-6 h-6 text-blue-400" />}
                articles={artistNews || []}
                isLoading={artistLoading}
                linkTo="/news/artists-releases"
              />
              
              <NewsCategorySection
                title="Industry & Culture"
                icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
                articles={industry || []}
                isLoading={industryLoading}
                linkTo="/news/industry-culture"
              />
            </TabsContent>

            <TabsContent value="releases">
              <NewsCategorySection
                title="New Releases"
                icon={<Music className="w-6 h-6 text-green-400" />}
                articles={releases || []}
                isLoading={releasesLoading}
                showAll
              />
            </TabsContent>

            <TabsContent value="events">
              <NewsCategorySection
                title="Festivals & Events"
                icon={<CalendarDays className="w-6 h-6 text-purple-400" />}
                articles={events || []}
                isLoading={eventsLoading}
                showAll
              />
            </TabsContent>

            <TabsContent value="artists">
              <NewsCategorySection
                title="Artist Spotlight"
                icon={<Users className="w-6 h-6 text-blue-400" />}
                articles={artistNews || []}
                isLoading={artistLoading}
                showAll
              />
            </TabsContent>

            <TabsContent value="industry">
              <NewsCategorySection
                title="Industry & Culture"
                icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
                articles={industry || []}
                isLoading={industryLoading}
                showAll
              />
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <section className="mt-12 p-6 bg-card/50 rounded-xl border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/news/top-stories" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors">
                <Newspaper className="w-5 h-5 text-primary" />
                <span>Top Stories</span>
              </Link>
              <Link to="/news/artists-releases" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors">
                <Music className="w-5 h-5 text-green-400" />
                <span>Artists & Releases</span>
              </Link>
              <Link to="/news/festivals-events" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors">
                <CalendarDays className="w-5 h-5 text-purple-400" />
                <span>Festivals & Events</span>
              </Link>
              <Link to="/news/industry-culture" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                <span>Industry & Culture</span>
              </Link>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default News;
