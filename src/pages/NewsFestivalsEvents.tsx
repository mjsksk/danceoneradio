import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import GoogleAds from '@/components/GoogleAds';
import { AD_SLOTS } from '@/config/adSlots';
import { NewsGrid } from '@/components/news/NewsGrid';
import { useNewsArticles } from '@/hooks/useNewsArticles';

const NewsFestivalsEvents = () => {
  const { data: events, isLoading } = useNewsArticles({ category: 'event', limit: 30 });

  return (
    <>
      <SEO 
        title="Festival & Event Announcements - EDM Shows | Dance One Radio"
        description="Stay updated with the latest festival announcements, EDM event news, concert dates, and tour information. Never miss a show!"
        keywords="EDM festivals, dance music events, concert announcements, DJ tours, rave events, festival lineup"
        url="https://danceoneradio.com/news/festivals-events"
        image="/lovable-uploads/c8f83eb5-b5ed-4bfd-88eb-604ca3cd2fe8.png"
        imageAlt="Festival and event announcements — Dance One Radio"
        type="article"
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <CalendarDays className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold">Festivals & Events</h1>
              <p className="text-muted-foreground">Upcoming shows and announcements</p>
            </div>
          </div>

          {/* Event Categories Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Festival News</h3>
              </div>
              <p className="text-sm text-muted-foreground">Major festival announcements and lineup reveals</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Tour Dates</h3>
              </div>
              <p className="text-sm text-muted-foreground">Artist tours and venue announcements</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold">Ticket Info</h3>
              </div>
              <p className="text-sm text-muted-foreground">On-sale dates and ticket availability</p>
            </div>
          </div>

          <GoogleAds key="news-festivals-ad" slot={AD_SLOTS.NEWS} />

          <section>
            <NewsGrid 
              articles={events || []} 
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

export default NewsFestivalsEvents;
