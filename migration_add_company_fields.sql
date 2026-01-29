ALTER TABLE public.main_empresas
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS main_challenge text,
ADD COLUMN IF NOT EXISTS main_goal text;
