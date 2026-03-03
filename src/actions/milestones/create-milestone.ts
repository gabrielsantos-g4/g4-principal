'use server'

import { createClient } from '@/lib/supabase'

export async function createMilestone(empresaId: string, monthIndex: number, monthLabel: string) {
    if (!empresaId) {
        return { error: 'Empresa ID is required.' }
    }

    const supabase = await createClient()

    const newMilestone = {
        empresa_id: empresaId,
        month_index: monthIndex,
        month_label: monthLabel,
        action_title: "Novo Objetivo",
        description: "",
        status: "To Do",
        target_metric: "",
        assignees: [],
        comments: "",
        deadline: null
    }

    const { data, error } = await supabase
        .from('project_milestones')
        .insert([newMilestone])
        .select()
        .single()

    if (error) {
        console.error('Error creating milestone:', error)
        return { error: 'Ocorreu um erro ao criar a nova milestone.' }
    }

    return { data }
}
