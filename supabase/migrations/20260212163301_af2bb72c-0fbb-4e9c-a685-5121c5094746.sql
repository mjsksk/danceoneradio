
CREATE OR REPLACE FUNCTION public.get_visitor_trend(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL,
  granularity text DEFAULT 'daily'
)
RETURNS TABLE(period text, total_visits bigint, unique_visitors bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    CASE
      WHEN granularity = 'weekly' THEN to_char(date_trunc('week', sv.visited_at), 'YYYY-MM-DD')
      ELSE to_char(date_trunc('day', sv.visited_at), 'YYYY-MM-DD')
    END as period,
    COUNT(*) as total_visits,
    COUNT(DISTINCT sv.visitor_hash) as unique_visitors
  FROM public.site_visits sv
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR sv.visited_at >= start_date)
    AND (end_date IS NULL OR sv.visited_at <= end_date)
  GROUP BY period
  ORDER BY period ASC;
$$;
