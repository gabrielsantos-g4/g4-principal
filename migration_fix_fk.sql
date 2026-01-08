-- ==============================================================================
-- MIGRATION: CORRIGIR FOREIGN KEY (FK) DE ADS_REPORTS
-- Objetivo: Fazer a tabela de reports apontar para main_empresas ao invés de ads_empresas
-- ==============================================================================

-- 1. Remover a restrição antiga (que aponta para ads_empresas)
-- Isso remove o bloqueio que está impedindo o salvamento.
ALTER TABLE public.ads_reports 
DROP CONSTRAINT IF EXISTS ads_reports_empresa_id_fkey;

-- 2. Adicionar a nova restrição (aponta para main_empresas)
-- Isso garante integridade referencial com a nova tabela.
-- NOTA: Se este comando falhar, significa que existem relatórios antigos com IDs que não estão na main_empresas.
-- Nesse caso, você pode rodar apenas o passo 1 (DROP) e deixar sem FK por enquanto.

DO $$ 
BEGIN 
    ALTER TABLE public.ads_reports 
    ADD CONSTRAINT ads_reports_main_empresa_fkey 
    FOREIGN KEY (empresa_id) 
    REFERENCES public.main_empresas (id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Não foi possível criar a nova FK (talvez dados inconsistentes). O bloqueio antigo foi removido, então o salvar deve funcionar.';
END $$;
