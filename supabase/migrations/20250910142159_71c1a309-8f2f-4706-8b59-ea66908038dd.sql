-- Add welcome_email_sent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE;