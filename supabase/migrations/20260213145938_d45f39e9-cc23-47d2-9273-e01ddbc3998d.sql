-- Create cleanup function for old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.push_notifications WHERE sent_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.scheduled_notifications WHERE status IN ('sent', 'cancelled') AND scheduled_at < NOW() - INTERVAL '90 days';
$$;

-- Schedule weekly cleanup every Sunday at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * 0',
  $$SELECT public.cleanup_old_notifications();$$
);