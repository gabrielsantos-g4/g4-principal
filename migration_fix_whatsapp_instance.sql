-- Migration: Relink instance_wa_chaterly to main_empresas
-- Objective: Change FK on 'empresa' column from 'empresas' table to 'main_empresas' table.
-- Strategy: Delete existing data to avoid conflicts, then alter constraint.

BEGIN;

-- 1. Clear existing data to avoid FK violations during migration
TRUNCATE TABLE public.instance_wa_chaterly CASCADE;

-- 2. Drop existing foreign key constraint
ALTER TABLE public.instance_wa_chaterly
DROP CONSTRAINT IF EXISTS instance_wa_chaterly_empresa_fkey;

-- 3. Add new foreign key constraint pointing to main_empresas
ALTER TABLE public.instance_wa_chaterly
ADD CONSTRAINT instance_wa_chaterly_empresa_fkey
FOREIGN KEY (empresa)
REFERENCES public.main_empresas (id)
ON DELETE CASCADE;

-- 4. Enable RLS if not enabled (Standard practice)
ALTER TABLE public.instance_wa_chaterly ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policy: Users can view/manage tokens for their company
DROP POLICY IF EXISTS "Users can manage company instances" ON public.instance_wa_chaterly;

CREATE POLICY "Users can manage company instances" ON public.instance_wa_chaterly
FOR ALL
USING (
  empresa IN (
    SELECT empresa_id FROM public.main_profiles
    WHERE id = auth.uid()
  )
);

COMMIT;
