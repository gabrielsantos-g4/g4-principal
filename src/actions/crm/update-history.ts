'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateHistory(leadId: number, message: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // 1. Fetch current history_log
    const { data: current, error: fetchError } = await supabase
        .from('main_crm')
        .select('history_log')
        .eq('id', leadId)
        .single();

    if (fetchError) {
        return { success: false, error: fetchError.message };
    }

    const currentHistory = Array.isArray(current?.history_log) ? current.history_log : [];

    // 2. Append new message with userId
    const newHistoryItem = {
        id: Date.now().toString(),
        message: message,
        date: new Date().toISOString(),
        userId: user.id
    };

    const updatedHistory = [...currentHistory, newHistoryItem];

    // 3. Update database
    const { error: updateError } = await supabase
        .from('main_crm')
        .update({ history_log: updatedHistory })
        .eq('id', leadId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/crm');
    return { success: true, newItem: newHistoryItem };
}
