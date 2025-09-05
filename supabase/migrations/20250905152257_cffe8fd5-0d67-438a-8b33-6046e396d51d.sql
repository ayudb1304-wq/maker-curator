-- Create a storage bucket for recommendation images
INSERT INTO storage.buckets (id, name, public) VALUES ('recommendation-images', 'recommendation-images', true);

-- Create RLS policies for the recommendation images bucket
CREATE POLICY "Users can view recommendation images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'recommendation-images');

CREATE POLICY "Users can upload their own recommendation images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'recommendation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own recommendation images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'recommendation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recommendation images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'recommendation-images' AND auth.uid()::text = (storage.foldername(name))[1]);