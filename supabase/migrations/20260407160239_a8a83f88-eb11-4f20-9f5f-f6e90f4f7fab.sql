ALTER TABLE public.sam_library
  ADD COLUMN IF NOT EXISTS normalized_artist_nospace TEXT,
  ADD COLUMN IF NOT EXISTS normalized_title_nospace TEXT;

ALTER TABLE public.song_requests
  ADD COLUMN IF NOT EXISTS normalized_request_artist TEXT,
  ADD COLUMN IF NOT EXISTS normalized_request_artist_nospace TEXT,
  ADD COLUMN IF NOT EXISTS normalized_request_title TEXT,
  ADD COLUMN IF NOT EXISTS normalized_request_title_nospace TEXT,
  ADD COLUMN IF NOT EXISTS match_reason TEXT;

CREATE OR REPLACE FUNCTION public.normalize_match_value(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT btrim(
    regexp_replace(
      lower(
        regexp_replace(
          regexp_replace(coalesce(value, ''), '\.mp3$', '', 'gi'),
          '[^a-z0-9\s]',
          ' ',
          'gi'
        )
      ),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.normalize_match_value_nospace(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $$
  SELECT replace(public.normalize_match_value(value), ' ', '');
$$;

CREATE OR REPLACE FUNCTION public.sync_sam_library_normalized_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.filename := btrim(coalesce(NEW.filename, ''));
  NEW.normalized_artist := public.normalize_match_value(NEW.artist);
  NEW.normalized_artist_nospace := public.normalize_match_value_nospace(NEW.artist);
  NEW.normalized_title := public.normalize_match_value(NEW.title);
  NEW.normalized_title_nospace := public.normalize_match_value_nospace(NEW.title);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_sam_library_normalized_fields ON public.sam_library;
CREATE TRIGGER trg_sync_sam_library_normalized_fields
BEFORE INSERT OR UPDATE OF artist, title, filename
ON public.sam_library
FOR EACH ROW
EXECUTE FUNCTION public.sync_sam_library_normalized_fields();

CREATE OR REPLACE FUNCTION public.get_song_request_match_candidates_by_values(
  _request_artist TEXT,
  _request_artist_nospace TEXT,
  _request_title TEXT,
  _request_title_nospace TEXT,
  _candidate_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  library_id UUID,
  artist TEXT,
  title TEXT,
  filename TEXT,
  normalized_artist TEXT,
  normalized_artist_nospace TEXT,
  normalized_title TEXT,
  normalized_title_nospace TEXT,
  confidence INTEGER,
  method TEXT,
  priority INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  WITH req AS (
    SELECT
      coalesce(_request_artist, '') AS request_artist,
      coalesce(_request_artist_nospace, '') AS request_artist_nospace,
      coalesce(_request_title, '') AS request_title,
      coalesce(_request_title_nospace, '') AS request_title_nospace
  ),
  ranked AS (
    SELECT
      lib.id AS library_id,
      lib.artist,
      lib.title,
      btrim(lib.filename) AS filename,
      lib.normalized_artist,
      lib.normalized_artist_nospace,
      lib.normalized_title,
      lib.normalized_title_nospace,
      req.request_artist,
      req.request_title,
      CASE
        WHEN req.request_artist_nospace = lib.normalized_artist_nospace
         AND req.request_title_nospace = lib.normalized_title_nospace THEN 1
        WHEN req.request_title_nospace = lib.normalized_title_nospace
         AND (
           lib.normalized_artist LIKE '%' || req.request_artist || '%'
           OR req.request_artist LIKE '%' || lib.normalized_artist || '%'
         ) THEN 2
        WHEN req.request_title_nospace = lib.normalized_title_nospace THEN 3
        WHEN lib.normalized_title LIKE '%' || req.request_title || '%'
          OR req.request_title LIKE '%' || lib.normalized_title || '%' THEN 4
        ELSE NULL
      END AS priority
    FROM req
    CROSS JOIN public.sam_library lib
    WHERE req.request_title <> ''
      AND req.request_title_nospace <> ''
  )
  SELECT
    library_id,
    artist,
    title,
    filename,
    normalized_artist,
    normalized_artist_nospace,
    normalized_title,
    normalized_title_nospace,
    CASE priority
      WHEN 1 THEN 100
      WHEN 2 THEN 90
      WHEN 3 THEN 80
      WHEN 4 THEN 60
    END AS confidence,
    CASE priority
      WHEN 1 THEN 'priority-1-exact-artist-title-nospace'
      WHEN 2 THEN 'priority-2-title-exact-artist-contains'
      WHEN 3 THEN 'priority-3-title-exact'
      WHEN 4 THEN 'priority-4-title-contains'
    END AS method,
    priority
  FROM ranked
  WHERE priority IS NOT NULL
  ORDER BY
    priority ASC,
    CASE
      WHEN priority = 2 THEN abs(char_length(normalized_artist) - char_length(request_artist))
      ELSE 0
    END ASC,
    CASE
      WHEN priority IN (3, 4) THEN abs(char_length(normalized_title) - char_length(request_title))
      ELSE 0
    END ASC,
    filename ASC
  LIMIT GREATEST(coalesce(_candidate_limit, 5), 1);
$$;

CREATE OR REPLACE FUNCTION public.get_song_request_match_candidates(
  _request_id UUID,
  _candidate_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  library_id UUID,
  artist TEXT,
  title TEXT,
  filename TEXT,
  normalized_artist TEXT,
  normalized_artist_nospace TEXT,
  normalized_title TEXT,
  normalized_title_nospace TEXT,
  confidence INTEGER,
  method TEXT,
  priority INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT c.*
  FROM public.song_requests sr
  CROSS JOIN LATERAL public.get_song_request_match_candidates_by_values(
    coalesce(sr.normalized_request_artist, public.normalize_match_value(sr.artist_name)),
    coalesce(sr.normalized_request_artist_nospace, public.normalize_match_value_nospace(sr.artist_name)),
    coalesce(sr.normalized_request_title, public.normalize_match_value(sr.song_title)),
    coalesce(sr.normalized_request_title_nospace, public.normalize_match_value_nospace(sr.song_title)),
    _candidate_limit
  ) c
  WHERE sr.id = _request_id;
$$;

CREATE OR REPLACE FUNCTION public.sync_song_request_normalized_fields_and_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  best RECORD;
  candidate_json JSONB := '[]'::jsonb;
BEGIN
  NEW.artist_name := btrim(coalesce(NEW.artist_name, ''));
  NEW.song_title := btrim(coalesce(NEW.song_title, ''));
  NEW.normalized_request_artist := public.normalize_match_value(NEW.artist_name);
  NEW.normalized_request_artist_nospace := public.normalize_match_value_nospace(NEW.artist_name);
  NEW.normalized_request_title := public.normalize_match_value(NEW.song_title);
  NEW.normalized_request_title_nospace := public.normalize_match_value_nospace(NEW.song_title);
  NEW.normalized_artist_name := NEW.normalized_request_artist;
  NEW.normalized_song_title := NEW.normalized_request_title;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'library_id', c.library_id,
        'artist', c.artist,
        'title', c.title,
        'filename', c.filename,
        'normalized_artist', c.normalized_artist,
        'normalized_artist_nospace', c.normalized_artist_nospace,
        'normalized_title', c.normalized_title,
        'normalized_title_nospace', c.normalized_title_nospace,
        'confidence', c.confidence,
        'method', c.method,
        'priority', c.priority
      )
      ORDER BY c.priority ASC, c.filename ASC
    ),
    '[]'::jsonb
  )
  INTO candidate_json
  FROM public.get_song_request_match_candidates_by_values(
    NEW.normalized_request_artist,
    NEW.normalized_request_artist_nospace,
    NEW.normalized_request_title,
    NEW.normalized_request_title_nospace,
    5
  ) c;

  SELECT *
  INTO best
  FROM public.get_song_request_match_candidates_by_values(
    NEW.normalized_request_artist,
    NEW.normalized_request_artist_nospace,
    NEW.normalized_request_title,
    NEW.normalized_request_title_nospace,
    1
  )
  LIMIT 1;

  IF best IS NULL THEN
    NEW.matched_artist := NULL;
    NEW.matched_title := NULL;
    NEW.sam_filename := NULL;
    NEW.match_confidence := 0;
    NEW.match_method := 'no-match';
    NEW.match_candidates := candidate_json;
    NEW.match_reason := CASE
      WHEN EXISTS (SELECT 1 FROM public.sam_library) THEN 'No library track matched the normalized artist/title priority rules.'
      ELSE 'SAM library is empty.'
    END;
  ELSE
    NEW.matched_artist := best.artist;
    NEW.matched_title := best.title;
    NEW.sam_filename := nullif(btrim(best.filename), '');
    NEW.match_confidence := best.confidence;
    NEW.match_method := best.method;
    NEW.match_candidates := candidate_json;
    NEW.match_reason := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_song_request_normalized_fields_and_match ON public.song_requests;
CREATE TRIGGER trg_sync_song_request_normalized_fields_and_match
BEFORE INSERT OR UPDATE OF artist_name, song_title
ON public.song_requests
FOR EACH ROW
EXECUTE FUNCTION public.sync_song_request_normalized_fields_and_match();

CREATE OR REPLACE FUNCTION public.apply_song_request_match(_request_id UUID)
RETURNS TABLE (
  id UUID,
  match_method TEXT,
  match_confidence INTEGER,
  matched_artist TEXT,
  matched_title TEXT,
  sam_filename TEXT,
  candidates_count INTEGER,
  no_match_reason TEXT,
  normalized_request_artist TEXT,
  normalized_request_artist_nospace TEXT,
  normalized_request_title TEXT,
  normalized_request_title_nospace TEXT,
  match_candidates JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  WITH updated AS (
    UPDATE public.song_requests
    SET artist_name = public.song_requests.artist_name,
        song_title = public.song_requests.song_title
    WHERE public.song_requests.id = _request_id
    RETURNING public.song_requests.*
  )
  SELECT
    u.id,
    u.match_method,
    coalesce(u.match_confidence, 0)::INTEGER AS match_confidence,
    u.matched_artist,
    u.matched_title,
    u.sam_filename,
    jsonb_array_length(coalesce(u.match_candidates, '[]'::jsonb)) AS candidates_count,
    u.match_reason AS no_match_reason,
    u.normalized_request_artist,
    u.normalized_request_artist_nospace,
    u.normalized_request_title,
    u.normalized_request_title_nospace,
    u.match_candidates
  FROM updated u;
$$;

CREATE OR REPLACE FUNCTION public.apply_song_request_matches(_request_ids UUID[] DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  match_method TEXT,
  match_confidence INTEGER,
  matched_artist TEXT,
  matched_title TEXT,
  sam_filename TEXT,
  candidates_count INTEGER,
  no_match_reason TEXT,
  normalized_request_artist TEXT,
  normalized_request_artist_nospace TEXT,
  normalized_request_title TEXT,
  normalized_request_title_nospace TEXT,
  match_candidates JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  WITH target AS (
    SELECT sr.id
    FROM public.song_requests sr
    WHERE coalesce(array_length(_request_ids, 1), 0) = 0
       OR sr.id = ANY(_request_ids)
    ORDER BY sr.created_at ASC
    LIMIT 500
  ),
  updated AS (
    UPDATE public.song_requests sr
    SET artist_name = sr.artist_name,
        song_title = sr.song_title
    FROM target t
    WHERE sr.id = t.id
    RETURNING sr.*
  )
  SELECT
    u.id,
    u.match_method,
    coalesce(u.match_confidence, 0)::INTEGER AS match_confidence,
    u.matched_artist,
    u.matched_title,
    u.sam_filename,
    jsonb_array_length(coalesce(u.match_candidates, '[]'::jsonb)) AS candidates_count,
    u.match_reason AS no_match_reason,
    u.normalized_request_artist,
    u.normalized_request_artist_nospace,
    u.normalized_request_title,
    u.normalized_request_title_nospace,
    u.match_candidates
  FROM updated u
  ORDER BY u.created_at ASC;
$$;

UPDATE public.sam_library
SET artist = artist,
    title = title,
    filename = filename;

UPDATE public.song_requests
SET artist_name = artist_name,
    song_title = song_title;

CREATE INDEX IF NOT EXISTS idx_sam_library_artist_title_nospace
  ON public.sam_library (normalized_artist_nospace, normalized_title_nospace);

CREATE INDEX IF NOT EXISTS idx_sam_library_title_nospace
  ON public.sam_library (normalized_title_nospace);

CREATE INDEX IF NOT EXISTS idx_song_requests_sam_queue
  ON public.song_requests (status, sam_imported_at, sam_filename)
  WHERE status = 'approved' AND sam_imported_at IS NULL AND sam_filename IS NOT NULL;