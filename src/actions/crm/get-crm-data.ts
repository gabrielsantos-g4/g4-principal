'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export interface CrmData {
    leads: any[];
    stats: {
        contacts: number;
        pipeline: number;
        today: number;
        tomorrow: number;
        overdue: number;
    };
}

export async function getCrmData(): Promise<CrmData | null> {
    const empresaId = await getEmpresaId();
    if (!empresaId) return null;

    const supabase = await createClient();

    // Buscar leads da empresa
    const { data: leads, error } = await supabase
        .from('main_crm')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

    if (error || !leads) {
        console.error("Error fetching CRM data:", error);
        return null;
    }

    // Calcular estatísticas
    const stats = {
        contacts: leads.length,
        pipeline: leads.reduce((acc, lead) => acc + (Number(lead.amount) || 0), 0),
        today: 0, // Placeholder lógica de data
        tomorrow: 0, // Placeholder lógica de data
        overdue: 0, // Placeholder lógica de data
    };

    // Lógica simples para datas (pode ser refinada)
    const todayStr = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    leads.forEach(lead => {
        // Exemplo: next_step contém { date: "Fri, 09/Jan" } - string formatada é difícil comparar sem parse
        // Se next_step fosse JSONB com ISO date seria melhor. Assumindo string por enquanto conforme mock.
        // TODO: Melhorar parse de data do next_step se for crítico.
    });

    return { leads, stats };
}
