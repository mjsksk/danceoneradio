
-- 1. Realtime: deny-all RLS on realtime.messages (no broadcast/presence usage requires user auth in this app)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all realtime subscriptions" ON realtime.messages;
CREATE POLICY "Deny all realtime subscriptions"
ON realtime.messages
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2. user_roles: explicit restrictive policy blocking non-admins from inserting/updating/deleting their own roles
DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
CREATE POLICY "Only admins can modify roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
