-- Create table for tracking API requests and rate limiting
CREATE TABLE IF NOT EXISTS public.api_request_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  identifier TEXT NOT NULL, -- Can be IP address or email
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);

-- Create index for efficient rate limit queries
CREATE INDEX idx_api_request_log_endpoint_identifier 
ON public.api_request_log(endpoint, identifier, created_at DESC);

-- Enable RLS
ALTER TABLE public.api_request_log ENABLE ROW LEVEL SECURITY;

-- Policy: No public access (only edge functions with service role can write)
CREATE POLICY "No public access to request logs"
ON public.api_request_log
FOR ALL
USING (false);

-- Function to clean up old logs (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_request_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.api_request_log 
  WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Create API keys table for service authentication
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on API keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: No public access
CREATE POLICY "No public access to API keys"
ON public.api_keys
FOR ALL
USING (false);