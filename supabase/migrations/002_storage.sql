-- Run this in Supabase SQL Editor to add images support

-- Add images array column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow service role to upload
CREATE POLICY "Service Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');
