
-- Create song_requests table
CREATE TABLE public.song_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  listener_name text NOT NULL,
  email text,
  artist_name text NOT NULL,
  song_title text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new',
  is_duplicate boolean NOT NULL DEFAULT false,
  duplicate_reason text,
  admin_notes text,
  ip_address text,
  user_agent text,
  source text DEFAULT 'website',
  reviewed_by uuid,
  reviewed_at timestamptz,
  normalized_artist_name text,
  normalized_song_title text
);

-- Add constraint for status values
ALTER TABLE public.song_requests
  ADD CONSTRAINT song_requests_status_check
  CHECK (status IN ('new', 'approved', 'rejected', 'played'));

-- Create indexes for common queries
CREATE INDEX idx_song_requests_status ON public.song_requests(status);
CREATE INDEX idx_song_requests_created_at ON public.song_requests(created_at DESC);
CREATE INDEX idx_song_requests_normalized ON public.song_requests(normalized_artist_name, normalized_song_title);

-- Enable RLS
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Public can only insert (via edge function with service role, but allow anon insert for the edge function)
-- Actually, we want submissions to go through edge function only, so block direct public access
CREATE POLICY "No public access to song requests"
  ON public.song_requests FOR SELECT TO public
  USING (false);

CREATE POLICY "No public insert to song requests"
  ON public.song_requests FOR INSERT TO public
  WITH CHECK (false);

-- Admins can do everything
CREATE POLICY "Admins can manage song requests"
  ON public.song_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_song_requests_updated_at
  BEFORE UPDATE ON public.song_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
