'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

import { logAction } from "@/actions/audit";

interface UpdateOpportunityParams {
    id: number;
    name: string;
    company: string;
    phone?: string;
    email?: string;
    linkedin?: string;
    website?: string;
    role?: string;
    product?: string;
    customField?: string;
    price?: number; // Optional, to update amount if product changes
}

export async function updateOpportunity(data: UpdateOpportunityParams) {
    const supabase = await createClient();

    // Fetch current name if not provided (though in this specific action 'name' is usually required in updates, checking if we need old values)
    // Actually, 'updateOpportunity' receives 'name' in 'data', so we can use that directly for the log if it's being updated.
    // But let's verify if we want the OLD name. The user prompt was about "Brenda updated lead [NAME]...".
    // Since 'data' has 'name', we can use data.name as the lead name involved.

    const updateData: any = {
        name: data.name,
        company: data.company,
        phone: data.phone,
        email: data.email,
        linkedin: data.linkedin,
        website: data.website,
        role: data.role,
        product: data.product,
        custom_field: data.customField,
    };

    // If price is provided (product changed), update amount
    if (data.price !== undefined) {
        updateData.amount = data.price;
    }

    const { error } = await supabase
        .from('main_crm')
        .update(updateData)
        .eq('id', data.id);

    if (error) {
        console.error("Error updating opportunity:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');

    await logAction('OPPORTUNITY_UPDATED', {
        lead_id: data.id,
        name: data.name, // Use the new name, or we could fetch old one if needed, but new name identifies the lead
        updates: updateData
    });

    return { success: true };
}
