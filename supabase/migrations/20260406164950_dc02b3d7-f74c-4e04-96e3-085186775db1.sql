
-- Add sam_imported_at tracking column
ALTER TABLE public.song_requests ADD COLUMN IF NOT EXISTS sam_imported_at timestamp with time zone DEFAULT NULL;

-- Drop old check constraint and add expanded one
ALTER TABLE public.song_requests DROP CONSTRAINT IF EXISTS song_requests_status_check;
ALTER TABLE public.song_requests ADD CONSTRAINT song_requests_status_check CHECK (status IN ('new', 'approved', 'rejected', 'played', 'queued', 'imported'));
