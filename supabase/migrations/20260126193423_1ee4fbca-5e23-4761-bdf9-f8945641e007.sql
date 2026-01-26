-- Add location columns to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS device_type text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at 
ON public.newsletter_subscribers(subscribed_at DESC);

-- Allow admins to view subscriber list (existing policy blocks all SELECT)
CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));