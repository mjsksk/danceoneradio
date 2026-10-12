-- lovable-cron-fallback-reviewed: existing every-minute now-playing job, only its auth header changes; cadence unchanged
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'cron_secret') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cron_secret', 'Shared secret for scheduled edge function calls');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_cron_secret(_secret text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT _secret IS NOT NULL AND length(_secret) > 0 AND EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'cron_secret' AND decrypted_secret = _secret
  );
$$;
REVOKE ALL ON FUNCTION public.verify_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;

SELECT cron.unschedule('update-radio-track-history');
SELECT cron.schedule('update-radio-track-history', '* * * * *', $cmd$
  SELECT net.http_post(
    url := 'https://upbwlnpycrbhxahjztrf.supabase.co/functions/v1/track-history-updater',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := jsonb_build_object('time', now(), 'source', 'cron')
  ) AS request_id;
$cmd$);