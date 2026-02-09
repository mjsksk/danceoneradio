
## Listener Analytics for Admin Dashboard

### Overview
Add a new admin section showing how many users are playing episodes, which episodes are most popular, and how much listening time each episode has received.

### Approach

Since the `episode_listening_progress` table has RLS restricting users to their own data, a **database function with SECURITY DEFINER** will be created to allow admins to query aggregate listening stats without exposing individual user data directly.

### Steps

1. **Create a database function** `get_listener_analytics()` that:
   - Requires the caller to have the `admin` role
   - Returns aggregate stats: unique listeners per episode, total listening time per episode, completion rates, and overall stats
   - Runs as SECURITY DEFINER to bypass RLS

2. **Create a new component** `src/components/admin/ListenerAnalytics.tsx` that:
   - Calls the database function via `supabase.rpc()`
   - Shows summary cards: total unique listeners (non-admin), total listening hours, most popular episode
   - Shows a table of episodes with columns: Episode Number, Title, Unique Listeners, Total Time Played, Avg Progress %, Completions
   - Sorted by most recent activity
   - Styled consistently with existing admin components (Orbitron headings, Rajdhani body, card style)

3. **Add the component to Admin.tsx** above the subscriber growth chart

### Technical Details

**Database function SQL:**
```sql
CREATE OR REPLACE FUNCTION get_listener_analytics()
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
  GROUP BY elp.episode_number, elp.episode_title
  ORDER BY last_activity DESC;
$$;
```

**Also a summary function:**
```sql
CREATE OR REPLACE FUNCTION get_listener_summary()
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
    ROUND(SUM(playback_position) / 3600, 1),
    COUNT(DISTINCT episode_number),
    COUNT(*) FILTER (WHERE completed = true)
  FROM public.episode_listening_progress
  WHERE public.has_role(auth.uid(), 'admin');
$$;
```

**Component features:**
- Summary stat cards (total unique listeners, total hours listened, episodes played, completions)
- Sortable table with per-episode breakdown
- Time formatting (seconds to hours:minutes)
- Consistent admin styling with existing components
