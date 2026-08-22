import { Newspaper, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { buildNewsCollectionSchema } from '@/lib/newsSchema';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { NewsFeaturedHero } from '@/components/news/NewsFeaturedHero';
import { NewsGrid } from '@/components/news/NewsGrid';
import { useFeaturedArticle, useTodayTopStories, useNewsArticles } from '@/hooks/useNewsArticles';

const NewsTopStories = () => {
  const { data: featuredArticle, isLoading: featuredLoading } = useFeaturedArticle();
  const { data: todayStories, isLoading: todayLoading } = useTodayTopStories(20);
  const { data: allHeadlines, isLoading: headlinesLoading } = useNewsArticles({ category: 'headline', limit: 30 });

  // Combine today's stories with recent headlines, removing featured
  const displayArticles = todayStories?.length 
    ? todayStories.filter(a => a.id !== featuredArticle?.id)
    : allHeadlines?.filter(a => a.id !== featuredArticle?.id) || [];

  const newsSchema = buildNewsCollectionSchema({
    path: '/news/top-stories',
    name: "Top EDM Stories Today",
    description: "Today's top electronic dance music headlines, breaking news, and trending stories.",
    articles: [featuredArticle, ...displayArticles],
  });

  return (
    <>
      <SEO 
        title="Top EDM Stories Today - Latest Dance Music News | Dance One Radio"
        description="Today's top electronic dance music headlines. Breaking news, major announcements, and trending stories from the EDM world."
        keywords="EDM news today, dance music headlines, electronic music breaking news, DJ announcements"
        url="https://danceoneradio.com/news/top-stories"
        image="https://danceoneradio.com/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
        imageAlt="Top EDM stories today — Dance One Radio"
        type="article"
        structuredData={newsSchema}
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <Newspaper className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Top Stories</h1>
              <p className="text-muted-foreground">Today's biggest EDM news</p>
            </div>
          </div>

          <section className="mb-12">
            <NewsFeaturedHero article={featuredArticle || null} isLoading={featuredLoading} />
          </section>

          <GoogleAds key="news-top-stories-ad" slot={AD_SLOTS.NEWS} />

          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Latest Headlines</h2>
            </div>
            <NewsGrid 
              articles={displayArticles} 
              isLoading={todayLoading || headlinesLoading}
              columns={3}
            />
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NewsTopStories;
