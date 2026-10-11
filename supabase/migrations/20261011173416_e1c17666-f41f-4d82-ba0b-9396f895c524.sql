CREATE TABLE IF NOT EXISTS public.now_playing (
  id smallint PRIMARY KEY DEFAULT 1,
  raw_title text,
  artist text,
  title text,
  album_art_url text,
  preview_url text,
  status text NOT NULL DEFAULT 'live',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT now_playing_single_row CHECK (id = 1)
);
GRANT SELECT ON public.now_playing TO anon, authenticated;
GRANT ALL ON public.now_playing TO service_role;
ALTER TABLE public.now_playing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read now playing" ON public.now_playing FOR SELECT USING (true);
INSERT INTO public.now_playing (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER PUBLICATION supabase_realtime ADD TABLE public.now_playing;

ALTER TABLE public.radio_track_history ADD COLUMN IF NOT EXISTS album_art_url text;
ALTER TABLE public.radio_track_history ADD COLUMN IF NOT EXISTS preview_url text;