
CREATE TABLE public.show_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_number INTEGER NOT NULL,
  track_order INTEGER NOT NULL,
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  album TEXT,
  duration_seconds INTEGER,
  played_at TIMESTAMP WITH TIME ZONE,
  amazon_url TEXT,
  beatport_url TEXT,
  apple_music_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.show_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view show tracks" ON public.show_tracks
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage show tracks" ON public.show_tracks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_show_tracks_episode ON public.show_tracks (episode_number, track_order);
