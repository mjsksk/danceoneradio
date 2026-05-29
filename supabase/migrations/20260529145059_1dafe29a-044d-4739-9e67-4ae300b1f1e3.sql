
-- Track preview plays table
CREATE TABLE public.track_preview_plays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_history_id uuid,
  title text NOT NULL,
  artist text NOT NULL,
  visitor_hash text NOT NULL,
  user_id uuid,
  country text,
  country_code text,
  page_path text,
  user_agent text,
  played_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_track_preview_plays_played_at ON public.track_preview_plays (played_at DESC);
CREATE INDEX idx_track_preview_plays_title_artist ON public.track_preview_plays (title, artist);

GRANT ALL ON public.track_preview_plays TO service_role;

ALTER TABLE public.track_preview_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to track preview plays"
ON public.track_preview_plays
FOR SELECT
USING (false);

CREATE POLICY "Admins can view track preview plays"
ON public.track_preview_plays
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Summary RPC
CREATE OR REPLACE FUNCTION public.get_track_play_summary(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(total_plays bigint, unique_listeners bigint, top_country text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    COUNT(*) as total_plays,
    COUNT(DISTINCT tpp.visitor_hash) as unique_listeners,
    (
      SELECT COALESCE(tpp2.country, 'Unknown')
      FROM public.track_preview_plays tpp2
      WHERE public.has_role(auth.uid(), 'admin')
        AND (start_date IS NULL OR tpp2.played_at >= start_date)
        AND (end_date IS NULL OR tpp2.played_at <= end_date)
      GROUP BY tpp2.country
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as top_country
  FROM public.track_preview_plays tpp
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR tpp.played_at >= start_date)
    AND (end_date IS NULL OR tpp.played_at <= end_date);
$$;

-- Per-track analytics RPC
CREATE OR REPLACE FUNCTION public.get_track_play_analytics(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
  title text,
  artist text,
  total_plays bigint,
  unique_listeners bigint,
  last_played timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT
    tpp.title,
    tpp.artist,
    COUNT(*) as total_plays,
    COUNT(DISTINCT tpp.visitor_hash) as unique_listeners,
    MAX(tpp.played_at) as last_played
  FROM public.track_preview_plays tpp
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR tpp.played_at >= start_date)
    AND (end_date IS NULL OR tpp.played_at <= end_date)
  GROUP BY tpp.title, tpp.artist
  ORDER BY last_played DESC;
$$;

-- Cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_track_preview_plays()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.track_preview_plays WHERE played_at < now() - INTERVAL '90 days';
$$;
