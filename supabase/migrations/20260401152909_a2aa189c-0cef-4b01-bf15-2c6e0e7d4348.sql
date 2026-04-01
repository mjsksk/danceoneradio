
CREATE TABLE public.app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'windows',
  version text,
  downloaded_at timestamp with time zone NOT NULL DEFAULT now(),
  visitor_hash text,
  country text,
  country_code text
);

ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a download record
CREATE POLICY "Anyone can log a download"
  ON public.app_downloads FOR INSERT
  TO public
  WITH CHECK (true);

-- No public read access
CREATE POLICY "No public read access"
  ON public.app_downloads FOR SELECT
  TO public
  USING (false);

-- Admins can view download stats
CREATE POLICY "Admins can view downloads"
  ON public.app_downloads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- DB function for admin analytics
CREATE OR REPLACE FUNCTION public.get_download_stats(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
  total_downloads bigint,
  downloads_today bigint,
  downloads_this_week bigint,
  downloads_this_month bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    COUNT(*) as total_downloads,
    COUNT(*) FILTER (WHERE downloaded_at >= date_trunc('day', now())) as downloads_today,
    COUNT(*) FILTER (WHERE downloaded_at >= date_trunc('week', now())) as downloads_this_week,
    COUNT(*) FILTER (WHERE downloaded_at >= date_trunc('month', now())) as downloads_this_month
  FROM public.app_downloads
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR downloaded_at >= start_date)
    AND (end_date IS NULL OR downloaded_at <= end_date);
$$;
