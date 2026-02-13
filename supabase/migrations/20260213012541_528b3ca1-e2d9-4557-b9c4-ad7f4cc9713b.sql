
-- Create push_subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to push notifications"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- No public select/delete (service role only)
CREATE POLICY "No public access to push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (false);

-- Create push_notifications log table
CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  sent_by TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view notification log
CREATE POLICY "Admins can view push notification log"
  ON public.push_notifications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- No public insert (service role only)
CREATE POLICY "No public insert to push notifications"
  ON public.push_notifications
  FOR INSERT
  WITH CHECK (false);
