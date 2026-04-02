-- 1. Drop and recreate the view with security_invoker
DROP VIEW IF EXISTS public.newsletter_subscribers_admin;

CREATE VIEW public.newsletter_subscribers_admin
WITH (security_invoker = true) AS
SELECT
  id,
  CASE
    WHEN length(split_part(email, '@', 1)) <= 2 THEN '**@' || split_part(email, '@', 2)
    ELSE left(split_part(email, '@', 1), 2) || '***@' || split_part(email, '@', 2)
  END AS masked_email,
  is_active,
  subscribed_at,
  country,
  city,
  region,
  browser,
  os,
  device_type
FROM public.newsletter_subscribers;

-- 2. Drop public INSERT policy on radio_track_history
DROP POLICY IF EXISTS "Allow inserting radio tracks" ON public.radio_track_history;