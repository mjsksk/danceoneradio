
-- SAM Library table for imported track files
CREATE TABLE public.sam_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist text NOT NULL,
  title text NOT NULL,
  filename text NOT NULL,
  normalized_artist text NOT NULL,
  normalized_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint on filename
ALTER TABLE public.sam_library ADD CONSTRAINT sam_library_filename_unique UNIQUE (filename);

-- Index for matching
CREATE INDEX idx_sam_library_normalized ON public.sam_library (normalized_artist, normalized_title);

-- RLS
ALTER TABLE public.sam_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SAM library"
  ON public.sam_library FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No public access to SAM library"
  ON public.sam_library FOR SELECT
  TO public
  USING (false);

-- Add match metadata columns to song_requests
ALTER TABLE public.song_requests
  ADD COLUMN IF NOT EXISTS matched_artist text,
  ADD COLUMN IF NOT EXISTS matched_title text,
  ADD COLUMN IF NOT EXISTS match_confidence numeric,
  ADD COLUMN IF NOT EXISTS match_method text,
  ADD COLUMN IF NOT EXISTS match_candidates jsonb;
