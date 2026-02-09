
CREATE OR REPLACE FUNCTION public.get_listener_analytics()
RETURNS TABLE (
  episode_number int,
  episode_title text,
  unique_listeners bigint,
  total_time_played numeric,
  avg_progress numeric,
  completions bigint,
  last_activity timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    elp.episode_number,
    elp.episode_title,
    COUNT(DISTINCT elp.user_id) as unique_listeners,
    SUM(elp.playback_position) as total_time_played,
    AVG(CASE WHEN elp.duration > 0 THEN (elp.playback_position / elp.duration) * 100 ELSE 0 END) as avg_progress,
    COUNT(*) FILTER (WHERE elp.completed = true) as completions,
    MAX(elp.last_listened_at) as last_activity
  FROM public.episode_listening_progress elp
  WHERE public.has_role(auth.uid(), 'admin')
    AND NOT public.has_role(elp.user_id, 'admin')
  GROUP BY elp.episode_number, elp.episode_title
  ORDER BY last_activity DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_listener_summary()
RETURNS TABLE (
  total_unique_listeners bigint,
  total_listening_hours numeric,
  total_episodes_played bigint,
  total_completions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COUNT(DISTINCT user_id),
    ROUND(COALESCE(SUM(playback_position), 0) / 3600, 1),
    COUNT(DISTINCT episode_number),
    COUNT(*) FILTER (WHERE completed = true)
  FROM public.episode_listening_progress
  WHERE public.has_role(auth.uid(), 'admin')
    AND NOT public.has_role(user_id, 'admin');
$$;
