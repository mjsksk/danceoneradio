
-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
  'process-scheduled-notifications',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/process-scheduled-notifications',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
      ),
      body:='{"time": "now"}'::jsonb
    ) as request_id;
  $$
);
