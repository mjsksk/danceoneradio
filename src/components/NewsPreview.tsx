import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNewsArticles, useFeaturedArticle } from '@/hooks/useNewsArticles';
import { StaggeredItem } from '@/components/ui/staggered-animation';
import { Skeleton } from '@/components/ui/skeleton';
import stationLogo from '@/assets/dance-one-logo.png';
import { useState } from 'react';

const NewsPreview = () => {
  const { data: featuredArticle, isLoading: featuredLoading } = useFeaturedArticle();
  const { data: articles, isLoading } = useNewsArticles({ limit: 4 });
  
  // Filter out featured article from the regular grid
  const regularArticles = articles?.filter(a => a.id !== featuredArticle?.id).slice(0, 3) || [];

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

        {/* Featured Article Hero */}
        <StaggeredItem index={0} className="mb-6">
          <FeaturedHeroCard article={featuredArticle || articles?.[0] || null} isLoading={featuredLoading && isLoading} />
        </StaggeredItem>

        {/* Regular Articles Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <StaggeredItem key={i} index={i + 1}>
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
            regularArticles.map((article, index) => (
              <StaggeredItem key={article.id} index={index + 1}>
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

interface FeaturedHeroCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    source_url: string;
    source_name: string;
    image_url: string | null;
    published_at: string;
  } | null;
  isLoading?: boolean;
}

function FeaturedHeroCard({ article, isLoading }: FeaturedHeroCardProps) {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-card/50 border border-border/50">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="aspect-video md:aspect-auto md:w-1/2 md:min-h-[240px]" />
          <div className="p-6 md:w-1/2">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="relative rounded-xl overflow-hidden bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-1/2 aspect-video md:aspect-auto md:min-h-[240px] overflow-hidden">
            {article.image_url && !imageError ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center">
                <img 
                  src={stationLogo} 
                  alt="Dance One Radio" 
                  className="w-20 h-20 object-contain opacity-60"
                 loading="lazy" decoding="async"/>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/80" />
          </div>
          
          {/* Content Section */}
          <div className="p-6 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Top Story
              </Badge>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{article.source_name}</span>
              <div className="flex items-center gap-1 text-primary group-hover:underline">
                <span>Read Full Story</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

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
              onError={() = decoding="async"> setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center">
              <img 
                src={stationLogo} 
                alt="Dance One Radio" 
                className="w-16 h-16 object-contain opacity-60"
               loading="lazy" decoding="async"/>
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
