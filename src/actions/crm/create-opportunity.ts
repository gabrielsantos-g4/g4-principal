'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";

import { getCrmSettings } from "./get-crm-settings";

interface CreateOpportunityParams {
    name: string;
    company: string;
    phone?: string;
    email?: string;
    linkedin?: string;
    product?: string;
    customField?: string;
}

export async function createOpportunity(params: CreateOpportunityParams) {
    const { name, company, phone, email, linkedin, product, customField } = params;

    // Validação básica
    if (!name || !company) {
        return { success: false, error: "Name and Company are required." };
    }

    try {
        const empresaId = await getEmpresaId();

        if (!empresaId) {
            return { success: false, error: "Organization not found. Please login again." };
        }

        const supabase = await createClient();

        // Fetch settings to get product price
        const settings = await getCrmSettings();
        const selectedProduct = settings.products.find(p => p.name === product);
        const amount = selectedProduct ? parseFloat(selectedProduct.price) : 0;

        const { error } = await supabase
            .from('main_crm')
            .insert({
                name,
                company,
                phone,
                email,
                linkedin,
                product: product,
                custom_field: customField,
                amount: amount,
                empresa_id: empresaId,
                status: 'New', // Status inicial padrão
                next_step: { progress: 0, total: 5, date: 'Pending' }, // Valor inicial padrão
                history_log: []
            });

        if (error) {
            console.error("Error creating opportunity:", error);
            return { success: false, error: "Failed to create opportunity. Please try again." };
        }

        revalidatePath('/dashboard/crm'); // Ajustar caminho conforme necessário
        return { success: true };

    } catch (error) {
        console.error("Unexpected error:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
