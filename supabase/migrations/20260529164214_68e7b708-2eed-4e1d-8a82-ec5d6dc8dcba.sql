
CREATE TABLE public.track_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  track_history_id UUID,
  action TEXT NOT NULL DEFAULT 'like',
  visitor_hash TEXT NOT NULL,
  user_id UUID,
  country TEXT,
  country_code TEXT,
  page_path TEXT,
  user_agent TEXT,
  liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_likes TO authenticated;
GRANT ALL ON public.track_likes TO service_role;

ALTER TABLE public.track_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view track likes"
ON public.track_likes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No public access to track likes"
ON public.track_likes
FOR SELECT
TO public
USING (false);

CREATE INDEX idx_track_likes_liked_at ON public.track_likes(liked_at DESC);

CREATE OR REPLACE FUNCTION public.get_track_like_summary(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(total_likes BIGINT, unique_listeners BIGINT, top_country TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT
    COUNT(*) FILTER (WHERE tl.action = 'like') as total_likes,
    COUNT(DISTINCT tl.visitor_hash) as unique_listeners,
    (
      SELECT COALESCE(tl2.country_code, 'Unknown')
      FROM public.track_likes tl2
      WHERE public.has_role(auth.uid(), 'admin')
        AND (start_date IS NULL OR tl2.liked_at >= start_date)
        AND (end_date IS NULL OR tl2.liked_at <= end_date)
      GROUP BY tl2.country_code
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as top_country
  FROM public.track_likes tl
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR tl.liked_at >= start_date)
    AND (end_date IS NULL OR tl.liked_at <= end_date);
$$;

CREATE OR REPLACE FUNCTION public.get_track_like_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(title TEXT, artist TEXT, total_likes BIGINT, unique_listeners BIGINT, last_liked TIMESTAMP WITH TIME ZONE)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT
    tl.title,
    tl.artist,
    COUNT(*) FILTER (WHERE tl.action = 'like') as total_likes,
    COUNT(DISTINCT tl.visitor_hash) as unique_listeners,
    MAX(tl.liked_at) as last_liked
  FROM public.track_likes tl
  WHERE public.has_role(auth.uid(), 'admin')
    AND (start_date IS NULL OR tl.liked_at >= start_date)
    AND (end_date IS NULL OR tl.liked_at <= end_date)
  GROUP BY tl.title, tl.artist
  ORDER BY last_liked DESC;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_track_likes()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = 'public'
AS $$
  DELETE FROM public.track_likes WHERE liked_at < now() - INTERVAL '90 days';
$$;
