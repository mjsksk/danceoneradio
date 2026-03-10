import { TrendingUp, Building2, Radio, Globe } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { NewsGrid } from '@/components/news/NewsGrid';
import { useNewsArticles } from '@/hooks/useNewsArticles';

const NewsIndustryCulture = () => {
  const { data: industryNews, isLoading } = useNewsArticles({ category: 'industry', limit: 30 });

  return (
    <>
      <SEO 
        title="EDM Industry & Culture News | Dance One Radio"
        description="Deep dives into electronic music industry trends, streaming updates, label news, and dance music culture. Understand the business behind the beats."
        keywords="EDM industry news, dance music culture, music streaming, record labels, electronic music trends"
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-4xl font-bold">Industry & Culture</h1>
              <p className="text-muted-foreground">Trends, business, and scene updates</p>
            </div>
          </div>

          {/* Industry Topics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold">Labels & Business</h3>
              </div>
              <p className="text-sm text-muted-foreground">Record label news and industry deals</p>
            </div>
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">Streaming & Charts</h3>
              </div>
              <p className="text-sm text-muted-foreground">Streaming trends and chart updates</p>
            </div>
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-pink-400" />
                <h3 className="font-semibold">Scene & Culture</h3>
              </div>
              <p className="text-sm text-muted-foreground">Community news and cultural shifts</p>
            </div>
          </div>

          <GoogleAds key="news-industry-ad" slot={AD_SLOTS.NEWS} />

          <section>
            <NewsGrid 
              articles={industryNews || []} 
              isLoading={isLoading}
              columns={3}
            />
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NewsIndustryCulture;
