
-- RPC to get subscriber growth data (returns only subscribed_at, no PII)
CREATE OR REPLACE FUNCTION public.get_subscriber_growth(
  start_date timestamptz
)
RETURNS TABLE(subscribed_at timestamptz, is_active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ns.subscribed_at, ns.is_active
  FROM public.newsletter_subscribers ns
  WHERE ns.subscribed_at >= start_date
    AND public.has_role(auth.uid(), 'admin')
  ORDER BY ns.subscribed_at ASC;
$$;

-- RPC to get total active subscriber count
CREATE OR REPLACE FUNCTION public.get_subscriber_count(
  before_date timestamptz DEFAULT NULL
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)
  FROM public.newsletter_subscribers
  WHERE is_active = true
    AND public.has_role(auth.uid(), 'admin')
    AND (before_date IS NULL OR subscribed_at < before_date);
$$;
