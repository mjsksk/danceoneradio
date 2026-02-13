
-- Allow admins to view push subscriptions
CREATE POLICY "Admins can view push subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete push subscriptions
CREATE POLICY "Admins can delete push subscriptions"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
