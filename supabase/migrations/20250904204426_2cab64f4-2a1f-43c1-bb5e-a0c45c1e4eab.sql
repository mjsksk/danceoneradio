-- Enable real-time updates for radio track history table
ALTER TABLE public.radio_track_history REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_track_history;