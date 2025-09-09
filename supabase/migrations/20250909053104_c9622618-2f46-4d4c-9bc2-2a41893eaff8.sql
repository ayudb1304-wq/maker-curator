-- Drop existing policies that use auth.uid() directly
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);