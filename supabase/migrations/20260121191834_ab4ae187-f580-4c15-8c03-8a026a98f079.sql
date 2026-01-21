-- Add database-level validation constraints for defense in depth
-- These complement the edge function rate limiting and validation

-- Add email format validation for newsletter subscribers
ALTER TABLE public.newsletter_subscribers 
  ADD CONSTRAINT newsletter_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add length constraints for contact messages
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_message_length CHECK (length(message) <= 5000);

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_name_length CHECK (length(name) <= 100);

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_subject_length CHECK (length(subject) <= 200);

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraints for radio track history to prevent data pollution
ALTER TABLE public.radio_track_history
  ADD CONSTRAINT track_title_length CHECK (length(title) <= 500);

ALTER TABLE public.radio_track_history
  ADD CONSTRAINT track_artist_length CHECK (length(artist) <= 500);