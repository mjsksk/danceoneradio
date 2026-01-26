-- Create enum for news categories
CREATE TYPE public.news_category AS ENUM ('headline', 'release', 'event', 'artist', 'industry');

-- Create the EDM news articles table
CREATE TABLE public.edm_news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT,
  category news_category NOT NULL DEFAULT 'headline',
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_edm_news_published_at ON public.edm_news_articles(published_at DESC);
CREATE INDEX idx_edm_news_category ON public.edm_news_articles(category);
CREATE INDEX idx_edm_news_is_featured ON public.edm_news_articles(is_featured) WHERE is_featured = true;
CREATE UNIQUE INDEX idx_edm_news_source_url ON public.edm_news_articles(source_url);

-- Enable Row Level Security
ALTER TABLE public.edm_news_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Anyone can view news articles"
ON public.edm_news_articles
FOR SELECT
USING (true);

-- Create RLS policy for service role insert (edge functions)
CREATE POLICY "Service role can insert news articles"
ON public.edm_news_articles
FOR INSERT
WITH CHECK (true);

-- Create RLS policy for service role update
CREATE POLICY "Service role can update news articles"
ON public.edm_news_articles
FOR UPDATE
USING (true)
WITH CHECK (true);