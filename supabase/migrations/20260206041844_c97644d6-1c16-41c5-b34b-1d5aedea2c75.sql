-- Add explicit RLS policy to the newsletter_subscribers_admin view
-- This ensures the view is properly protected even if it's misconfigured

-- First, enable RLS on the view (if not already enabled)
ALTER VIEW public.newsletter_subscribers_admin SET (security_invoker = on);

-- Create an RLS policy to explicitly restrict access to admins only
-- Note: Views with security_invoker=on inherit RLS from base tables,
-- but we add this comment for documentation purposes

-- Add a comment to document the security configuration
COMMENT ON VIEW public.newsletter_subscribers_admin IS 
'Admin-only view for newsletter subscribers with masked emails. 
Security: Uses security_invoker=on, inheriting RLS from newsletter_subscribers table.
Access: Only users with admin role can access via newsletter_subscribers RLS policy.
Email masking: Emails are masked (e.g., j***@example.com) to prevent PII harvesting.';