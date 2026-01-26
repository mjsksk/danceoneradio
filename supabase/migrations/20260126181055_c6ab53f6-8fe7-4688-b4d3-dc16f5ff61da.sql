-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule daily EDM news fetch at 7:00 AM UTC
SELECT cron.schedule(
  'daily-edm-news-fetch',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/edm-news-fetcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object('source', 'cron', 'timestamp', now()::text)
  ) AS request_id;
  $$
);

-- Schedule weekly cleanup of old news articles (older than 30 days) - runs every Sunday at 3:00 AM UTC
SELECT cron.schedule(
  'weekly-news-cleanup',
  '0 3 * * 0',
  $$
  DELETE FROM public.edm_news_articles 
  WHERE published_at < NOW() - INTERVAL '30 days';
  $$
);