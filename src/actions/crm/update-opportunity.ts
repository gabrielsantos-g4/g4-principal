'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
    return { success: true };
}
