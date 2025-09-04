-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to update track history every minute
SELECT cron.schedule(
  'update-radio-track-history',
  '* * * * *', -- Run every minute
  $$
  SELECT
    net.http_post(
        url := 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/track-history-updater',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYndsbnB5Y3JiaHhhaGp6dHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODQ3MzQsImV4cCI6MjA3MDM2MDczNH0.3N7hPJIiHokZvHZQSnQqZl1xu2POj4FrNyVPMQxF55U"}'::jsonb,
        body := concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);