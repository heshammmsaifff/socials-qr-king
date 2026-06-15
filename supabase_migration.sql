-- Supabase SQL Migration Script
-- Go to your Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- Paste this entire script and click "Run" to update the database schema.

-- 1. Add the missing `user_id` column referencing the auth.users table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Add the `background_image_url` column for custom profile backgrounds
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_image_url text;

-- 3. Migrate existing values from `created_by` (if it exists and contains data) to `user_id`
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='created_by'
    ) THEN
        UPDATE public.profiles SET user_id = created_by WHERE user_id IS NULL AND created_by IS NOT NULL;
    END IF;
END $$;

-- 4. Re-create RLS Policies to ensure they reference the correct `user_id` column
-- This prevents the 400 Bad Request error when querying profiles.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow users to select their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Create clean policies using the `user_id` column
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create storage bucket for assets and configure policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('socials-assets', 'socials-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled (by default it is enabled in Supabase)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old storage policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create policies for storage.objects
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'socials-assets');

CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'socials-assets' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated updates" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'socials-assets' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'socials-assets' AND
  auth.role() = 'authenticated'
);

