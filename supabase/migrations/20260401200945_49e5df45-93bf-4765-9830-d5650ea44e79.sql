
-- 1. Fix unsubscribe_attempts: drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage unsubscribe attempts" ON public.unsubscribe_attempts;

-- 2. Fix edm_news_articles: drop public INSERT/UPDATE policies (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can insert news articles" ON public.edm_news_articles;
DROP POLICY IF EXISTS "Service role can update news articles" ON public.edm_news_articles;

-- 3. Fix storage.objects: add RLS policies for write protection
-- Allow public SELECT (buckets are already public)
CREATE POLICY "Public can read storage objects"
ON storage.objects FOR SELECT
TO public
USING (true);

-- Only admins can upload files
CREATE POLICY "Admins can insert storage objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can update files
CREATE POLICY "Admins can update storage objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can delete files
CREATE POLICY "Admins can delete storage objects"
ON storage.objects FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Fix newsletter_subscribers: drop the public UPDATE policy and handle unsubscribe server-side only
DROP POLICY IF EXISTS "Allow unsubscribe with valid token" ON public.newsletter_subscribers;
