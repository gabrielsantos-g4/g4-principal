'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function transferLeadsTag(oldValue: string, newValue: string, column: string) {
    const supabase = await createClient();

    // Security check: only allow specific columns to be updated dynamically
    const allowedColumns = ['status', 'source', 'responsible', 'lost_reason', 'custom_field'];
    if (!allowedColumns.includes(column)) {
        return { success: false, error: "Invalid column name" };
    }

    try {
        const { data, error } = await supabase
            .from('main_crm')
            .update({ [column]: newValue })
            .eq(column, oldValue)
            .select();

        if (error) {
            console.error(`Error transferring leads for ${column}:`, error);
            return { success: false, error: error.message };
        }

        const count = data?.length || 0;


        revalidatePath('/dashboard/crm');
        return { success: true, count };
    } catch (e) {
        console.error("Transfer exception:", e);
        return { success: false, error: "Unknown error during transfer" };
    }
}
