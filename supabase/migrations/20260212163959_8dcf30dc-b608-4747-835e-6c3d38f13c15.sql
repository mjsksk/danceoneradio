-- Create a cleanup function for old site visits (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_site_visits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.site_visits
  WHERE visited_at < now() - INTERVAL '90 days';
$$;