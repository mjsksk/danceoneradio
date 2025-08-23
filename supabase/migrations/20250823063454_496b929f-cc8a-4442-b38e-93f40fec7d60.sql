-- Fix the function search path security warning by setting search_path for the existing function
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;