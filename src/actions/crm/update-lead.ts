'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

import { logAction } from "@/actions/audit";

interface UpdateLeadParams {
    status?: string;
    source?: string;
    responsible?: string;
    custom_field?: string;
    amount?: number;
    product?: string;
    lost_reason?: string;
    qualification_details?: any; // JSONB
}

export async function updateLead(id: number, data: UpdateLeadParams) {
    const supabase = await createClient();

    // Fetch current lead data for audit logging
    const { data: currentLead } = await supabase
        .from('main_crm')
        .select('status, name')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from('main_crm')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error("Error updating lead:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');

    await logAction('LEAD_UPDATED', {
        lead_id: id,
        name: currentLead?.name,
        old_status: currentLead?.status,
        updates: data
    });

    return { success: true };
}
