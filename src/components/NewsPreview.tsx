import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { StaggeredItem } from '@/components/ui/staggered-animation';
import { Skeleton } from '@/components/ui/skeleton';
import stationLogo from '@/assets/dance-one-logo.png';
import { useState } from 'react';

const NewsPreview = () => {
  const { data: articles, isLoading } = useNewsArticles({ limit: 3 });

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-['Orbitron'] font-bold">
                <span className="text-neon">LATEST</span>{" "}
                <span className="text-neon-purple">NEWS</span>
              </h2>
              <p className="text-muted-foreground text-sm">EDM & Dance Music Updates</p>
            </div>
          </div>
          
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/news">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <StaggeredItem key={i} index={i}>
                <div className="bg-card/50 rounded-lg overflow-hidden border border-border/50">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-5 w-full mb-1" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              </StaggeredItem>
            ))
          ) : (
            articles?.slice(0, 3).map((article, index) => (
              <StaggeredItem key={article.id} index={index}>
                <NewsPreviewCard article={article} />
              </StaggeredItem>
            ))
          )}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button asChild>
            <Link to="/news">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface NewsPreviewCardProps {
  article: {
    id: string;
    title: string;
    source_url: string;
    source_name: string;
    image_url: string | null;
    published_at: string;
    category: string;
  };
}

function NewsPreviewCard({ article }: NewsPreviewCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const categoryColors: Record<string, string> = {
    headline: 'text-primary',
    release: 'text-green-400',
    event: 'text-purple-400',
    artist: 'text-blue-400',
    industry: 'text-orange-400',
  };

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="bg-card/50 rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
        <div className="relative aspect-video overflow-hidden">
          {article.image_url && !imageError ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center">
              <img 
                src={stationLogo} 
                alt="Dance One Radio" 
                className="w-16 h-16 object-contain opacity-60"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <span className={`text-xs font-medium capitalize ${categoryColors[article.category] || 'text-primary'}`}>
              {article.category}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">{article.source_name}</p>
        </div>
      </div>
    </a>
  );
}

export default NewsPreview;
