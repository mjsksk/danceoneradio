DROP POLICY IF EXISTS "Anyone can subscribe to push notifications" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can log a download" ON public.app_downloads;
CREATE POLICY "Anyone can log a valid download" ON public.app_downloads
FOR INSERT TO anon, authenticated
WITH CHECK (
  platform IN ('windows','macos-arm64','macos','ios','android','linux')
  AND (version IS NULL OR length(version) <= 20)
  AND visitor_hash IS NULL AND country IS NULL AND country_code IS NULL
);