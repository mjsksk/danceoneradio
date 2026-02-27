
-- Add missing index on api_request_log.created_at for faster cleanup
CREATE INDEX IF NOT EXISTS idx_api_request_log_created_at ON public.api_request_log (created_at);

-- Add index on radio_track_history.played_at for faster cleanup
CREATE INDEX IF NOT EXISTS idx_radio_track_history_played_at ON public.radio_track_history (played_at DESC);

-- Reduce api_request_log retention from 24h to 6h
CREATE OR REPLACE FUNCTION public.cleanup_old_request_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  DELETE FROM public.api_request_log 
  WHERE created_at < now() - interval '6 hours';
END;
$function$;
