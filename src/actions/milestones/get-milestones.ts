'use server'

import { createClient } from '@/lib/supabase'

export async function getMilestones(empresaId: string) {
    if (!empresaId) {
        return { error: 'Empresa ID is required to fetch milestones.' }
    }

    const supabase = await createClient()

    // 1. Fetch existing milestones for this company
    const { data: existing, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('month_index', { ascending: true })

    if (error) {
        console.error('Error fetching project milestones:', error)
        return { error: 'Failed to find milestones for this project.' }
    }

    // 2. If milestones exist, return them
    if (existing && existing.length > 0) {
        return { data: existing }
    }

    // 3. Otherwise, generate the default 12-month mock and insert it
    const MOCK_DATA = [
        { action_title: "Setup de Plataformas e Base de Leads", deadline: "30 dias", status: "Approved", target_metric: "1000 leads mapeados" },
        { action_title: "Primeira Campanha de Prospecção e Ajuste de Mídia", deadline: "60 dias", status: "Doing", target_metric: "50 reuniões agendadas" },
        { action_title: "Escala de Mídia e Otimização Orgânica", deadline: "90 dias", status: "To Do", target_metric: "150 reuniões agendadas" },
        { action_title: "Expansão de Canais e Automação de CRM", deadline: "120 dias", status: "To Do", target_metric: "200 reuniões agendadas" },
        { action_title: "Otimização de Conversão de Vendas", deadline: "150 dias", status: "To Do", target_metric: "20% aumento em Vendas" },
        { action_title: "Revisão Trimestral de Metas", deadline: "180 dias", status: "To Do", target_metric: "Redução de CAC em 15%" },
        { action_title: "Lançamento de Novo Canal de Tração", deadline: "210 dias", status: "To Do", target_metric: "Mais 50 leads qualificados/mês" },
        { action_title: "Automação de Retenção e Upsell", deadline: "240 dias", status: "To Do", target_metric: "Aumento de 10% LTV" },
        { action_title: "Escalonamento de Time de SDRs", deadline: "270 dias", status: "To Do", target_metric: "Ramp-up de 2 novos SDRs" },
        { action_title: "Otimização de SEO Avançada", deadline: "300 dias", status: "To Do", target_metric: "Top 3 em 10 palavras-chave" },
        { action_title: "Campanhas de Final de Ano", deadline: "330 dias", status: "To Do", target_metric: "Dobro de receita mensal" },
        { action_title: "Planejamento Anual e Consolidação", deadline: "360 dias", status: "To Do", target_metric: "OKRs do próximo ano definidos" }
    ]

    const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentMonthIndex = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const defaultMilestones = Array.from({ length: 12 }).map((_, i) => {
        const monthIndex = (currentMonthIndex + i) % 12
        const yearOffset = Math.floor((currentMonthIndex + i) / 12)
        const year = currentYear + yearOffset
        const data = MOCK_DATA[i % MOCK_DATA.length]

        // Only insert the fields accepted by the schema
        return {
            empresa_id: empresaId,
            month_index: i,
            month_label: `${MONTHS_PT[monthIndex]} ${year}`,
            action_title: data.action_title,
            description: "",
            status: data.status,
            target_metric: data.target_metric,
            assignees: [],
            comments: "",
            // We set deadline initially as 'null' since it requires an ISO Date string matching TIMESTAMP WITH TIME ZONE
            // The user will pick real deadlines in the editor
            deadline: null
        }
    })

    const { data: inserted, error: insertError } = await supabase
        .from('project_milestones')
        .insert(defaultMilestones)
        .select()
        .order('month_index', { ascending: true })

    if (insertError) {
        console.error('Error generating project milestones:', insertError)
        return { error: 'Failed to initialize default milestones.' }
    }

    return { data: inserted }
}
