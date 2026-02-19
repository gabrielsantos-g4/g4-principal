'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";

export async function updateCrmStatuses(statuses: any[]) {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) {
        console.error("[updateCrmStatuses] No empresaId found");
        return { success: false, error: "Empresa not found" };
    }

    try {
        // Fetch current settings to preserve other fields
        const { data: currentSettings } = await supabase
            .from('main_crm_settings')
            .select('*')
            .eq('empresa_id', empresaId)
            .single();

        const cleanStatuses = statuses.map(s => ({
            id: s.id || Date.now(),
            label: s.label,
            bg: s.bg,
            text: s.text,
            phase: s.phase || 'not_started',
            temperature: s.temperature || 'Cold'
        }));

        const { error } = await supabase
            .from('main_crm_settings')
            .upsert({
                empresa_id: empresaId,
                ...(currentSettings || {}),
                statuses: cleanStatuses,
                updated_at: new Date().toISOString()
            }, { onConflict: 'empresa_id' });

        if (error) {
            console.error("[updateCrmStatuses] DB Error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/crm');
        return { success: true };
    } catch (e: any) {
        console.error("[updateCrmStatuses] Exception:", e);
        return { success: false, error: e.message };
    }
}
