import { NewsArticle } from '@/hooks/useNewsArticles';
import { NewsCard } from './NewsCard';
import { NewsSkeleton } from './NewsSkeleton';

interface NewsGridProps {
  articles: NewsArticle[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3;
}

export function NewsGrid({ articles, isLoading, columns = 2 }: NewsGridProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${
        columns === 1 ? 'grid-cols-1' : 
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No news articles available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back soon for the latest EDM news!</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      columns === 1 ? 'grid-cols-1' : 
      columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {articles.map((article, index) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
