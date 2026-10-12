SELECT cron.unschedule('daily-edm-news-fetch');
SELECT cron.schedule('daily-edm-news-fetch', '0 7 * * *', $cmd$
  SELECT net.http_post(
    url := 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/edm-news-fetcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := jsonb_build_object('source', 'cron', 'timestamp', now()::text)
  ) AS request_id;
$cmd$);