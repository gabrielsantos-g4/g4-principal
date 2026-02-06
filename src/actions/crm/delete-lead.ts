'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

import { logAction } from "@/actions/audit";

export async function deleteLead(id: number) {
    const supabase = await createClient();

    // Fetch lead name before deletion
    const { data: lead } = await supabase
        .from('main_crm')
        .select('name')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from('main_crm')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting lead:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');

    await logAction('LEAD_DELETED', {
        lead_id: id,
        name: lead?.name
    });

    return { success: true };
}
