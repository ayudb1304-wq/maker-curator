-- Add short and long description columns to recommendations table
ALTER TABLE public.recommendations 
ADD COLUMN short_description TEXT,
ADD COLUMN long_description TEXT;

-- Update existing records to migrate current description to long_description
UPDATE public.recommendations 
SET long_description = description 
WHERE description IS NOT NULL AND long_description IS NULL;