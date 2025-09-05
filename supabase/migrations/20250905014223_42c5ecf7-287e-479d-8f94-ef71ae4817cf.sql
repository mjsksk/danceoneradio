-- Clean up duplicate tracks, keeping only the most recent one for each artist-title combination
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY title, artist ORDER BY played_at DESC) as rn
  FROM radio_track_history
)
DELETE FROM radio_track_history 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Also clean up any tracks with "Dance One Radio" as artist or title since they're not real songs
DELETE FROM radio_track_history 
WHERE title ILIKE '%Dance One Radio%' 
   OR artist ILIKE '%Dance One Radio%';