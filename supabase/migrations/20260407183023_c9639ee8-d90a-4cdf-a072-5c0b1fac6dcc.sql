-- Drop the matching trigger on song_requests
DROP TRIGGER IF EXISTS trg_sync_song_request_normalized_fields_and_match ON public.song_requests;

-- Drop the matching trigger function
DROP FUNCTION IF EXISTS public.sync_song_request_normalized_fields_and_match() CASCADE;

-- Drop website-side matching functions
DROP FUNCTION IF EXISTS public.apply_song_request_match(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.apply_song_request_matches(uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.get_song_request_match_candidates(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_song_request_match_candidates_by_values(text, text, text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_song_request_debug_candidates(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_song_request_debug_candidates_by_values(text, text, text, text, text, integer) CASCADE;

-- Drop SAM library trigger
DROP TRIGGER IF EXISTS trg_sync_sam_library_normalized_fields ON public.sam_library;
DROP FUNCTION IF EXISTS public.sync_sam_library_normalized_fields() CASCADE;

-- Drop library helper functions
DROP FUNCTION IF EXISTS public.effective_library_artist(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.effective_library_title(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.library_filename_artist(text) CASCADE;
DROP FUNCTION IF EXISTS public.library_filename_title(text) CASCADE;
DROP FUNCTION IF EXISTS public.library_filename_stem(text) CASCADE;
DROP FUNCTION IF EXISTS public.basename_text(text) CASCADE;
DROP FUNCTION IF EXISTS public.normalize_match_value(text) CASCADE;
DROP FUNCTION IF EXISTS public.normalize_match_value_nospace(text) CASCADE;

-- Mark sam_library table as deprecated
COMMENT ON TABLE public.sam_library IS 'DEPRECATED: No longer used. Matching now happens locally on the SAM PC against the live MariaDB.';