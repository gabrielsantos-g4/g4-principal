'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";
import { logAction } from '@/actions/audit';

export async function toggleResponsibility(conversationId: string, currentStatus?: string) {
    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, message: "Unauthorized" };

    const supabaseAdmin = await createAdminClient();

    // 1. Resolve Lead from Conversation ID
    const { data: conversation, error: convError } = await supabaseAdmin
        .from('camp_conversas')
        .select(`
            main_crm!camp_conversas_contact_id_fkey (
                id,
                quem_atende
            )
        `)
        .eq('id', conversationId)
        .eq('empresa_id', empresaId)
        .single();

    if (convError || !conversation || !conversation.main_crm) {
        console.error("Error resolving conversation to lead:", convError);
        return { success: false, message: "Conversation/Lead not found" };
    }

    const lead = conversation.main_crm;
    // @ts-ignore
    const leadId = lead.id;
    // @ts-ignore
    const leadStatus = lead.quem_atende;


    // Determine new status
    // Logic: 
    // If current is 'Agente' or 'agente' -> 'Humano'
    // If current is 'Humano' or 'humano' -> 'Agente'
    // Default fallback if unknown: 'Humano' (taking over)

    let newStatus = 'Humano';

    // Use the status from DB if currentStatus was not provided or differs (safety)
    // But respecting the passed argument if it exists for optimistic consistency? 
    // actually safer to use DB value if we just fetched it.
    const statusToCheck = (currentStatus || leadStatus || '').toLowerCase();

    if (statusToCheck === 'humano') newStatus = 'Agente';

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
        old_status: statusToCheck,
        new_status: newStatus,
        via: 'inbox_toggle' // helpful context
    });

    return { success: true, newStatus };
}
