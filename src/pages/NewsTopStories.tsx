import { Newspaper, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
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

  return (
    <>
      <SEO 
        title="Top EDM Stories Today - Latest Dance Music News | Dance One Radio"
        description="Today's top electronic dance music headlines. Breaking news, major announcements, and trending stories from the EDM world."
        keywords="EDM news today, dance music headlines, electronic music breaking news, DJ announcements"
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
