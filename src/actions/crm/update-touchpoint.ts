'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateTouchpoint(leadId: number, progress: number) {
    const supabase = await createClient();

    // 1. Fetch current next_step to preserve other fields (like date)
    const { data: current, error: fetchError } = await supabase
        .from('main_crm')
        .select('next_step')
        .eq('id', leadId)
        .single();

    if (fetchError) {
        return { success: false, error: fetchError.message };
    }

    const currentNextStep = current?.next_step || { date: 'Pending', total: 6 };

    // 2. Update progress
    const updatedNextStep = {
        ...currentNextStep,
        progress: progress,
        total: 6, // Ensure total is 6
        // Optional: Update current_touchpoint label for clarity
        current_touchpoint: progress === 5 ? 'msg_saida' : (progress === 6 ? 'conversation_established' : `tp${progress}`)
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
