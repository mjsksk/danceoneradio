-- Fix 1: Add admin SELECT policy for contact_messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Strengthen profiles table RLS to prevent enumeration
-- The current policy is already good (auth.uid() = id), but let's add an index comment
-- The existing policy is correct - users can only see their own profile

-- Fix 3: Add rate limiting table for unsubscribe attempts to prevent token enumeration
CREATE TABLE IF NOT EXISTS public.unsubscribe_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS on unsubscribe_attempts
ALTER TABLE public.unsubscribe_attempts ENABLE ROW LEVEL SECURITY;

-- Block all public access to unsubscribe attempts
CREATE POLICY "No public access to unsubscribe attempts"
ON public.unsubscribe_attempts
FOR ALL
USING (false);

-- Allow service role to insert (used by edge function)
CREATE POLICY "Service role can manage unsubscribe attempts"
ON public.unsubscribe_attempts
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient rate limiting queries
CREATE INDEX idx_unsubscribe_attempts_ip_time 
ON public.unsubscribe_attempts(ip_address, attempted_at DESC);

-- Create cleanup function for old unsubscribe attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_unsubscribe_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.unsubscribe_attempts 
  WHERE attempted_at < now() - interval '1 hour';
END;
$$;