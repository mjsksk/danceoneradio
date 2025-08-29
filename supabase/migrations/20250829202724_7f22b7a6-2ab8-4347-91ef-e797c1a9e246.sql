-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.validate_unsubscribe_token(token_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  -- Check if a subscriber exists with this unsubscribe token and is active
  RETURN EXISTS (
    SELECT 1 FROM public.newsletter_subscribers 
    WHERE unsubscribe_token = token_input 
    AND is_active = true
  );
END;
$$;