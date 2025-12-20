-- Fix search_path for cleanup_old_request_logs function to prevent schema poisoning
CREATE OR REPLACE FUNCTION public.cleanup_old_request_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.api_request_log 
  WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Fix search_path for handle_new_user function to prevent schema poisoning  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;