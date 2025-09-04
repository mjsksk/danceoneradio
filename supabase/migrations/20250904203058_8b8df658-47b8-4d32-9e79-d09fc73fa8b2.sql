-- Create a table to store radio track history
CREATE TABLE public.radio_track_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration TEXT,
  genre TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.radio_track_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (since it's radio history)
CREATE POLICY "Anyone can view radio track history" 
ON public.radio_track_history 
FOR SELECT 
USING (true);

-- Create policy to allow inserting new tracks (for the edge function)
CREATE POLICY "Allow inserting radio tracks" 
ON public.radio_track_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on played_at queries
CREATE INDEX idx_radio_track_history_played_at ON public.radio_track_history(played_at DESC);