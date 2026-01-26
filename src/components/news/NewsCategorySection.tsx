import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NewsArticle } from '@/hooks/useNewsArticles';
import { NewsGrid } from './NewsGrid';

interface NewsCategorySectionProps {
  title: string;
  icon: React.ReactNode;
  articles: NewsArticle[];
  isLoading?: boolean;
  linkTo?: string;
  showAll?: boolean;
}

export function NewsCategorySection({
  title,
  icon,
  articles,
  isLoading,
  linkTo,
  showAll = false,
}: NewsCategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        
        {linkTo && !showAll && (
          <Link
            to={linkTo}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      
      <NewsGrid articles={articles} isLoading={isLoading} columns={showAll ? 3 : 2} />
    </section>
  );
}
