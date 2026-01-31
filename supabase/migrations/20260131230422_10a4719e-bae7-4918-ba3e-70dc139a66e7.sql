-- Add explicit deny policy for unauthenticated access to profiles table
-- This ensures that anonymous users cannot access any profile data

-- First, check if we need to add a restrictive policy for anonymous access
-- The existing policies only allow users to view/update their own profiles
-- but we should add an explicit deny for service role bypass protection

-- Create a more restrictive SELECT policy that explicitly requires authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND auth.uid() = id
);

-- Update the UPDATE policy to also require authenticated role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND auth.uid() = id
)
WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = id
);