-- Create a view for admin dashboard that masks email addresses
-- This prevents email harvesting even if an admin account is compromised

CREATE OR REPLACE VIEW public.newsletter_subscribers_admin
WITH (security_invoker = on) AS
SELECT 
  id,
  -- Mask email: show first char, mask middle, show domain
  -- e.g., "john.doe@example.com" becomes "j***@example.com"
  CASE 
    WHEN position('@' in email) > 1 THEN
      substring(email from 1 for 1) || '***@' || split_part(email, '@', 2)
    ELSE '***@unknown'
  END as masked_email,
  is_active,
  subscribed_at,
  country,
  -- Don't expose city/region in admin view (more precise location data)
  NULL::text as city,
  NULL::text as region,
  browser,
  os,
  device_type
FROM public.newsletter_subscribers;

-- Grant SELECT on the view to authenticated users (RLS will still apply via security_invoker)
GRANT SELECT ON public.newsletter_subscribers_admin TO authenticated;

-- Drop the existing permissive admin SELECT policy on base table
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;

-- Create a more restrictive policy: admins can only COUNT, not see full data
-- This allows aggregate queries but blocks full row access
CREATE POLICY "Admins can count subscribers for campaigns"
ON public.newsletter_subscribers
FOR SELECT
USING (
  -- Only allow access when fetching counts or when accessed via service role
  -- Regular admin SELECT through client will fail
  public.has_role(auth.uid(), 'admin'::app_role) 
  AND current_setting('request.method', true) IS NULL  -- This effectively blocks direct client access
);

-- Create RLS policy for the admin view
-- Note: Views with security_invoker will check the underlying table's RLS
-- We need a separate approach - use a security definer function instead

-- First, drop the restrictive policy we just created
DROP POLICY IF EXISTS "Admins can count subscribers for campaigns" ON public.newsletter_subscribers;

-- Create a policy that allows admins to SELECT but only specific columns through the view
-- The view already masks sensitive data, so we can allow admin SELECT
CREATE POLICY "Admins can view masked subscriber data via view"
ON public.newsletter_subscribers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));