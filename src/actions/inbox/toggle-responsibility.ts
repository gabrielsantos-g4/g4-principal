'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";
import { logAction } from '@/actions/audit';

export async function toggleResponsibility(leadId: string, currentStatus?: string) {
    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, message: "Unauthorized" };

    const supabaseAdmin = await createAdminClient();

    // Determine new status
    // Logic: 
    // If current is 'Agente' or 'agente' -> 'Humano'
    // If current is 'Humano' or 'humano' -> 'Agente'
    // Default fallback if unknown: 'Humano' (taking over)

    let newStatus = 'Humano';
    if (!currentStatus) {
        // Fetch if not provided
        const { data: lead } = await supabaseAdmin
            .from('main_crm')
            .select('quem_atende')
            .eq('id', leadId)
            .eq('empresa_id', empresaId)
            .single();

        const status = lead?.quem_atende?.toLowerCase();
        if (status === 'humano') newStatus = 'Agente';
        // Assign currentStatus for logging if it was missing
        currentStatus = lead?.quem_atende;
    } else {
        const status = currentStatus.toLowerCase();
        if (status === 'humano') newStatus = 'Agente';
    }

    const { error } = await supabaseAdmin
        .from('main_crm')
        .update({ quem_atende: newStatus })
        .eq('id', leadId)
        .eq('empresa_id', empresaId);

    if (error) {
        console.error("Error toggling responsibility:", error);
        return { success: false, message: "Failed to update" };
    }

    revalidatePath('/dashboard/customer-support'); // Revalidate inbox

    // Log the responsibility toggle
    await logAction('RESPONSIBILITY_TOGGLED', {
        lead_id: leadId,
        old_status: currentStatus,
        new_status: newStatus,
        via: 'inbox_toggle' // helpful context
    });

    return { success: true, newStatus };
}
