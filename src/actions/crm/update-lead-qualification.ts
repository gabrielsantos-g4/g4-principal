'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { logAction } from "@/actions/audit";

export async function updateLeadQualification(leadId: string | number, status: string) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('main_crm')
            .update({ qualification_status: status })
            .eq('id', leadId);

        if (error) {
            console.error("Error updating lead qualification:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/dashboard/crm');

        await logAction('LEAD_QUALIFICATION_UPDATED', {
            lead_id: leadId,
            new_status: status
        });

        return { success: true };
    } catch (error) {
        console.error("Unexpected error updating lead qualification:", error);
        return { success: false, error: "Unexpected error" };
    }
}
