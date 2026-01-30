'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface UpdateLeadParams {
    status?: string;
    source?: string;
    responsible?: string;
    custom_field?: string;
    amount?: number;
    product?: string;
    lost_reason?: string;
}

export async function updateLead(id: number, data: UpdateLeadParams) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('main_crm')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error("Error updating lead:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');
    return { success: true };
}
