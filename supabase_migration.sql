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
