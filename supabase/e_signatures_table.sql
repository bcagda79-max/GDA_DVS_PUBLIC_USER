-- Run this SQL in your Supabase Dashboard → SQL Editor

-- 1. Create a storage bucket for signatures if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read the signatures (or authenticated only)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'signatures');

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'signatures');

-- 2. Create the saved_signatures table
CREATE TABLE IF NOT EXISTS public.saved_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and create policies
ALTER TABLE public.saved_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on saved_signatures" 
ON public.saved_signatures FOR ALL 
USING (true) WITH CHECK (true);

-- Allow authenticated users (Admins/Officers) to view and insert signatures
CREATE POLICY "Authenticated users can select saved_signatures" 
ON public.saved_signatures FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert saved_signatures" 
ON public.saved_signatures FOR INSERT 
TO authenticated 
WITH CHECK (true);
