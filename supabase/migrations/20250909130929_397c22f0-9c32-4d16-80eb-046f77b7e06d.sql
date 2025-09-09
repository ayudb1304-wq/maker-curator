-- Add color customization fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name_color text DEFAULT '#ffffff',
ADD COLUMN username_color text DEFAULT '#a1a1aa',  
ADD COLUMN page_title_color text DEFAULT '#ffffff',
ADD COLUMN page_description_color text DEFAULT '#a1a1aa';