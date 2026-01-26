-- Create a function to anonymize old subscriber tracking data (keeps country/is_active for analytics, clears PII)
-- This addresses the privacy concern about detailed user tracking data

CREATE OR REPLACE FUNCTION public.cleanup_old_subscriber_tracking_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Clear detailed tracking data older than 30 days
  -- Keep only country for aggregate analytics
  UPDATE public.newsletter_subscribers 
  SET 
    ip_address = NULL,
    city = NULL,
    region = NULL,
    browser = NULL,
    os = NULL,
    device_type = NULL
  WHERE subscribed_at < now() - interval '30 days'
    AND (ip_address IS NOT NULL OR city IS NOT NULL OR browser IS NOT NULL);
END;
$function$;

-- Grant execute permission to service role only
REVOKE ALL ON FUNCTION public.cleanup_old_subscriber_tracking_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_subscriber_tracking_data() TO service_role;

-- Schedule the cleanup to run daily using pg_cron (if available)
-- Note: pg_cron must be enabled in Supabase dashboard
SELECT cron.schedule(
  'cleanup-subscriber-tracking-data',
  '0 3 * * *',  -- Run at 3 AM UTC daily
  $$ SELECT public.cleanup_old_subscriber_tracking_data(); $$
);