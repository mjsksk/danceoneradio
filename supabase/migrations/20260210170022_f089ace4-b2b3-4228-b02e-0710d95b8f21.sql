
-- Update get_listener_analytics to accept optional date range
CREATE OR REPLACE FUNCTION public.get_listener_analytics(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
 RETURNS TABLE(episode_number integer, episode_title text, unique_listeners bigint, total_time_played numeric, avg_progress numeric, completions bigint, last_activity timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    AND (start_date IS NULL OR elp.last_listened_at >= start_date)
    AND (end_date IS NULL OR elp.last_listened_at <= end_date)
  GROUP BY elp.episode_number, elp.episode_title
  ORDER BY last_activity DESC;
$function$;

-- Update get_listener_summary to accept optional date range
CREATE OR REPLACE FUNCTION public.get_listener_summary(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
 RETURNS TABLE(total_unique_listeners bigint, total_listening_hours numeric, total_episodes_played bigint, total_completions bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT
    COUNT(DISTINCT user_id),
    ROUND(COALESCE(SUM(playback_position), 0) / 3600, 1),
    COUNT(DISTINCT episode_number),
    COUNT(*) FILTER (WHERE completed = true)
  FROM public.episode_listening_progress
  WHERE public.has_role(auth.uid(), 'admin')
    AND NOT public.has_role(user_id, 'admin')
    AND (start_date IS NULL OR last_listened_at >= start_date)
    AND (end_date IS NULL OR last_listened_at <= end_date);
$function$;
