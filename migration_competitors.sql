-- Create competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    other_link TEXT,
    instagram_profile TEXT,
    linkedin_profile TEXT,
    youtube_channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own competitors"
    ON public.competitors
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competitors"
    ON public.competitors
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
    ON public.competitors
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
    ON public.competitors
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competitors_updated_at
    BEFORE UPDATE ON public.competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_competitors_updated_at();
