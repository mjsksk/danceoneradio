import { Music, Users, Disc3 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { buildNewsCollectionSchema } from '@/lib/newsSchema';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { NewsGrid } from '@/components/news/NewsGrid';
import { useNewsArticles } from '@/hooks/useNewsArticles';

const NewsArtistsReleases = () => {
  const { data: releases, isLoading: releasesLoading } = useNewsArticles({ category: 'release', limit: 20 });
  const { data: artistNews, isLoading: artistLoading } = useNewsArticles({ category: 'artist', limit: 20 });

  const newsSchema = buildNewsCollectionSchema({
    path: '/news/artists-releases',
    name: "Artists & Releases",
    description: "The latest EDM releases, new singles, albums, and artist news.",
    articles: [...(releases || []), ...(artistNews || [])],
  });

  return (
    <>
      <SEO 
        title="Artist News & New Releases - EDM Music Updates | Dance One Radio"
        description="Discover the latest EDM releases, new singles, albums, and artist news. Stay updated with DJ spotlights and producer announcements."
        keywords="EDM releases, new dance music, DJ news, producer spotlight, electronic music singles, album releases"
        url="https://danceoneradio.com/news/artists-releases"
        image="/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
        imageAlt="Artist news and new EDM releases — Dance One Radio"
        type="article"
        structuredData={newsSchema}
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <Music className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-4xl font-bold">Artists & Releases</h1>
              <p className="text-muted-foreground">New music and artist spotlights</p>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Disc3 className="w-5 h-5 text-green-400" />
              <h2 className="text-2xl font-bold">New Releases</h2>
            </div>
            <NewsGrid 
              articles={releases || []} 
              isLoading={releasesLoading}
              columns={3}
            />
          </section>

          <GoogleAds key="news-artists-ad" slot={AD_SLOTS.NEWS} />

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold">Artist Spotlight</h2>
            </div>
            <NewsGrid 
              articles={artistNews || []} 
              isLoading={artistLoading}
              columns={3}
            />
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NewsArtistsReleases;
