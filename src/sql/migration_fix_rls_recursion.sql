-- Migration: Fix infinite recursion in RLS policies for instance creation
-- Created at: 2026-02-07T19:10:21-03:00

BEGIN;

-- 1. Create Security Definer Function to bypass RLS recursion
-- This function runs with the privileges of the creator (likely admin),
-- allowing it to read main_profiles without triggering its own RLS policies.
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT empresa_id
    FROM public.main_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Update RLS Policy on instance_wa_chaterly to use the new function
DROP POLICY IF EXISTS "Users can manage company instances" ON public.instance_wa_chaterly;

CREATE POLICY "Users can manage company instances" ON public.instance_wa_chaterly
FOR ALL
USING (
  empresa = public.get_user_company_id()
)
WITH CHECK (
  empresa = public.get_user_company_id()
);

COMMIT;
