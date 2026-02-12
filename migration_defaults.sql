-- Migration: Set defaults for main_profiles
-- Description: Sets default values for job_title to '' and has_messaging_access to true to ensure robustness.

ALTER TABLE public.main_profiles 
ALTER COLUMN job_title SET DEFAULT '';

ALTER TABLE public.main_profiles 
ALTER COLUMN has_messaging_access SET DEFAULT true;
