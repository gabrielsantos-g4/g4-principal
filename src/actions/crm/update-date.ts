'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateDate(leadId: number, newDate: string) {
    const supabase = await createClient();

    // 1. Fetch current next_step
    const { data: current, error: fetchError } = await supabase
        .from('main_crm')
        .select('next_step')
        .eq('id', leadId)
        .single();

    if (fetchError) {
        return { success: false, error: fetchError.message };
    }

    const currentNextStep = current?.next_step || { progress: 0, total: 5 };

    // 2. Update date
    const updatedNextStep = {
        ...currentNextStep,
        date: newDate
    };

    const { error: updateError } = await supabase
        .from('main_crm')
        .update({ next_step: updatedNextStep })
        .eq('id', leadId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/crm');
    return { success: true };
}
