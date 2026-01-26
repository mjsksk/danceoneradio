import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type NewsCategory = 'headline' | 'release' | 'event' | 'artist' | 'industry';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string | null;
  category: NewsCategory;
  source_url: string;
  source_name: string;
  image_url: string | null;
  published_at: string;
  fetched_at: string;
  is_featured: boolean;
  tags: string[];
  created_at: string;
}

export function useNewsArticles(options?: {
  category?: NewsCategory;
  featured?: boolean;
  limit?: number;
}) {
  const { category, featured, limit = 20 } = options || {};

  return useQuery({
    queryKey: ['news-articles', category, featured, limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      let query = supabase
        .from('edm_news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (featured !== undefined) {
        query = query.eq('is_featured', featured);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news articles:', error);
        throw error;
      }

      return (data as NewsArticle[]) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedArticle() {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: async (): Promise<NewsArticle | null> => {
      const { data, error } = await supabase
        .from('edm_news_articles')
        .select('*')
        .eq('is_featured', true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching featured article:', error);
        throw error;
      }

      return data as NewsArticle | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTodayTopStories(limit = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return useQuery({
    queryKey: ['today-top-stories', limit],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from('edm_news_articles')
        .select('*')
        .gte('published_at', today.toISOString())
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching today stories:', error);
        throw error;
      }

      return (data as NewsArticle[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
