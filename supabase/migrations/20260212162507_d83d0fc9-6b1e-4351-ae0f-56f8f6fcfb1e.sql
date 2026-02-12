
-- Create site_visits table
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash text NOT NULL,
  country text,
  country_code text,
  page_path text NOT NULL,
  is_returning boolean NOT NULL DEFAULT false,
  visited_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_site_visits_visitor_hash ON public.site_visits (visitor_hash);
CREATE INDEX idx_site_visits_visited_at ON public.site_visits (visited_at DESC);

-- Enable RLS - block all public access
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to site visits"
ON public.site_visits
FOR ALL
USING (false);

-- Allow service role inserts (edge function uses service role)
CREATE POLICY "Service role can insert visits"
ON public.site_visits
FOR INSERT
WITH CHECK (true);

-- Admin-only analytics function: country breakdown
CREATE OR REPLACE FUNCTION public.get_visitor_analytics(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  country text,
  country_code text,
  total_visits bigint,
  unique_visitors bigint,
  returning_visitors bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    COALESCE(sv.country, 'Unknown') as country,
    COALESCE(sv.country_code, '??') as country_code,
    COUNT(*) as total_visits,
    COUNT(DISTINCT sv.visitor_hash) as unique_visitors,
    COUNT(DISTINCT sv.visitor_hash) FILTER (WHERE sv.is_returning = true) as returning_visitors
  FROM public.site_visits sv
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR sv.visited_at >= start_date)
    AND (end_date IS NULL OR sv.visited_at <= end_date)
  GROUP BY sv.country, sv.country_code
  ORDER BY total_visits DESC;
$$;

-- Admin-only summary function
CREATE OR REPLACE FUNCTION public.get_visitor_summary(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  total_visits bigint,
  unique_visitors bigint,
  returning_visitors bigint,
  top_country text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    COUNT(*) as total_visits,
    COUNT(DISTINCT sv.visitor_hash) as unique_visitors,
    COUNT(DISTINCT sv.visitor_hash) FILTER (WHERE sv.is_returning = true) as returning_visitors,
    (
      SELECT COALESCE(sv2.country, 'Unknown')
      FROM public.site_visits sv2
      WHERE public.has_role(auth.uid(), 'admin')
        AND (start_date IS NULL OR sv2.visited_at >= start_date)
        AND (end_date IS NULL OR sv2.visited_at <= end_date)
      GROUP BY sv2.country
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as top_country
  FROM public.site_visits sv
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR sv.visited_at >= start_date)
    AND (end_date IS NULL OR sv.visited_at <= end_date);
$$;
