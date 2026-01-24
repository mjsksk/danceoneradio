-- Drop the existing cron job with hardcoded key
SELECT cron.unschedule('update-radio-track-history');

-- Recreate the cron job using the service role key from vault
-- The edge function already validates and uses SUPABASE_SERVICE_ROLE_KEY internally
-- Using a simpler approach: call the function without Authorization header
-- since internal Supabase cron jobs can use the service role key directly

SELECT cron.schedule(
  'update-radio-track-history',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/track-history-updater',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    ),
    body := jsonb_build_object('time', now(), 'source', 'cron')
  ) AS request_id;
  $$
);