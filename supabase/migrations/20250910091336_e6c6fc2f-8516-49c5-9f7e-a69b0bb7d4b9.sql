-- Make new profiles public by default so newly registered users can view their page immediately
ALTER TABLE public.profiles
ALTER COLUMN public_profile SET DEFAULT true;