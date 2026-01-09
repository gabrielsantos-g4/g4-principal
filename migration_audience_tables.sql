-- ==============================================================================
-- MIGRATION: AUDIENCE AGENT TABLES
-- ==============================================================================

-- 1. Create audience_chats table
CREATE TABLE IF NOT EXISTS public.audience_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT,
    company_id UUID NOT NULL REFERENCES public.main_empresas(id) ON DELETE CASCADE
);

-- 2. Create audience_messages table
CREATE TABLE IF NOT EXISTS public.audience_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    chat_id UUID NOT NULL REFERENCES public.audience_chats(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.main_empresas(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT
);

-- 3. Enable RLS
ALTER TABLE public.audience_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Helper to get user's company
-- Note: This assumes auth.uid() maps to a main_profiles row with an empresa_id.

-- Policies for audience_chats
CREATE POLICY "Users can view own company chats" ON public.audience_chats
    FOR SELECT
    USING (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert own company chats" ON public.audience_chats
    FOR INSERT
    WITH CHECK (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update own company chats" ON public.audience_chats
    FOR UPDATE
    USING (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete own company chats" ON public.audience_chats
    FOR DELETE
    USING (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

-- Policies for audience_messages
CREATE POLICY "Users can view own company messages" ON public.audience_messages
    FOR SELECT
    USING (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert own company messages" ON public.audience_messages
    FOR INSERT
    WITH CHECK (company_id IN (
        SELECT empresa_id FROM public.main_profiles WHERE id = auth.uid()
    ));

-- Start Realtime for messages (optional, but good for chat)
alter publication supabase_realtime add table public.audience_messages;
