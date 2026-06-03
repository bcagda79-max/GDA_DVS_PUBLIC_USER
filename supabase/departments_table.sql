-- Run this SQL in your Supabase Dashboard → SQL Editor
-- Creates the `departments` table to store custom department names

CREATE TABLE IF NOT EXISTS public.departments (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow the service role (used by supabaseAdmin) full access
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.departments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant to authenticated if you want officers/admin to read directly
GRANT SELECT ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
