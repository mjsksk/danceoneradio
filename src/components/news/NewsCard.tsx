import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Tag, Music2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsArticle, NewsCategory } from '@/hooks/useNewsArticles';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const categoryColors: Record<NewsCategory, string> = {
  headline: 'bg-primary/20 text-primary border-primary/30',
  release: 'bg-green-500/20 text-green-400 border-green-500/30',
  event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  artist: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  industry: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const categoryLabels: Record<NewsCategory, string> = {
  headline: 'Headlines',
  release: 'New Release',
  event: 'Event',
  artist: 'Artist',
  industry: 'Industry',
};

export function NewsCard({ article, featured = false }: NewsCardProps) {
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const ImagePlaceholder = () => (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center ${featured ? 'md:w-1/2 md:min-h-[280px]' : 'aspect-video'}`}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
        <Music2 className="w-12 h-12" />
        <span className="text-xs font-medium">{article.source_name}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );

  return (
    <motion.a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="block group"
    >
      <Card className={`h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${featured ? 'md:flex md:flex-row' : ''}`}>
        {article.image_url ? (
          <div className={`relative overflow-hidden ${featured ? 'md:w-1/2 md:min-h-[280px]' : 'aspect-video'}`}>
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                // Replace with placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('hidden');
                target.parentElement?.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        ) : (
          <ImagePlaceholder />
        )}
        
        <div className={featured ? 'md:w-1/2' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${categoryColors[article.category]}`}>
                {categoryLabels[article.category]}
              </Badge>
              <span className="text-xs text-muted-foreground">{article.source_name}</span>
            </div>
            
            <h3 className={`font-bold leading-tight group-hover:text-primary transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
              {article.title}
            </h3>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-1 text-primary group-hover:underline">
                <span>Read More</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
            
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.a>
  );
}
