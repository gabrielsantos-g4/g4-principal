-- Migration to add avatar_url to main_profiles if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'main_profiles'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.main_profiles ADD COLUMN avatar_url text;
    END IF;
END $$;
