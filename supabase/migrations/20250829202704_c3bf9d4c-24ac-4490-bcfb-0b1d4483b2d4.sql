-- Fix critical RLS policy vulnerability for newsletter_subscribers

-- First, drop the conflicting policies
DROP POLICY IF EXISTS "Allow unsubscribe via token" ON newsletter_subscribers;
DROP POLICY IF EXISTS "No public updates to subscribers" ON newsletter_subscribers;

-- Create a security definer function to safely validate unsubscribe tokens
-- This prevents RLS recursion issues
CREATE OR REPLACE FUNCTION public.validate_unsubscribe_token(token_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Check if a subscriber exists with this unsubscribe token and is active
  RETURN EXISTS (
    SELECT 1 FROM newsletter_subscribers 
    WHERE unsubscribe_token = token_input 
    AND is_active = true
  );
END;
$$;

-- Create a proper RLS policy that validates the unsubscribe token
CREATE POLICY "Allow unsubscribe with valid token" 
ON newsletter_subscribers 
FOR UPDATE 
USING (
  -- Only allow updates if the unsubscribe_token matches an active subscriber
  public.validate_unsubscribe_token(unsubscribe_token)
) 
WITH CHECK (
  -- Only allow deactivating the subscription
  is_active = false AND 
  public.validate_unsubscribe_token(unsubscribe_token)
);