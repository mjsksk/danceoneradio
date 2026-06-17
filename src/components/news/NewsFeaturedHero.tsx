import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewsArticle } from '@/hooks/useNewsArticles';
import { Skeleton } from '@/components/ui/skeleton';
import stationLogo from '@/assets/dance-one-logo.png';

interface NewsFeaturedHeroProps {
  article: NewsArticle | null;
  isLoading?: boolean;
}

export function NewsFeaturedHero({ article, isLoading }: NewsFeaturedHeroProps) {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-card/50 border border-border/50">
        <Skeleton className="aspect-[21/9] w-full" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="block group relative rounded-xl overflow-hidden"
    >
      <div className="relative aspect-[21/9] md:aspect-[3/1]">
        {article.image_url && !imageError ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() = loading="lazy" decoding="async"> setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <img 
              src={stationLogo} 
              alt="Dance One Radio" 
              className="w-32 h-32 object-contain opacity-50"
             loading="lazy" decoding="async"/>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary/90 text-primary-foreground border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured Story
          </Badge>
          <span className="text-sm text-muted-foreground">{article.source_name}</span>
        </div>
        
        <h2 className="text-2xl md:text-4xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
          {article.title}
        </h2>
        
        <p className="text-muted-foreground mb-4 line-clamp-2 max-w-3xl">
          {article.summary}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1 text-primary group-hover:underline">
            <span>Read Full Article</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
