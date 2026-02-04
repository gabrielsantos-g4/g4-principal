'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteLead(id: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('main_crm')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting lead:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');
    return { success: true };
}
