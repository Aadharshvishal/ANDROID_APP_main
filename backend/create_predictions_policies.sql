-- Enable RLS and create idempotent policies for the `predictions` table
-- Run this in Supabase SQL editor or via Supabase CLI

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- DROP and CREATE an INSERT policy that enforces a WITH CHECK expression
DROP POLICY IF EXISTS service_insert ON public.predictions;
CREATE POLICY service_insert ON public.predictions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- DROP and CREATE a SELECT policy for authenticated users
DROP POLICY IF EXISTS select_for_auth ON public.predictions;
CREATE POLICY select_for_auth ON public.predictions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional: if you prefer public reads, replace the SELECT policy above with:
-- DROP POLICY IF EXISTS select_public ON public.predictions;
-- CREATE POLICY select_public ON public.predictions
--   FOR SELECT
--   USING (true);
