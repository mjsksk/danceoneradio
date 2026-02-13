
-- Create scheduled notifications table
CREATE TABLE public.scheduled_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all scheduled notifications
CREATE POLICY "Admins can view scheduled notifications"
ON public.scheduled_notifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert scheduled notifications
CREATE POLICY "Admins can create scheduled notifications"
ON public.scheduled_notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update scheduled notifications
CREATE POLICY "Admins can update scheduled notifications"
ON public.scheduled_notifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete scheduled notifications
CREATE POLICY "Admins can delete scheduled notifications"
ON public.scheduled_notifications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for efficient processing of pending notifications
CREATE INDEX idx_scheduled_notifications_pending 
ON public.scheduled_notifications (scheduled_at) 
WHERE status = 'pending';
