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
    website?: string;
    role?: string;
    product?: string;
    customField?: string;
    // New fields
    status?: string;
    source?: string;
    responsible?: string;
    touchpoint?: number; // 1-5
    engaged?: boolean; // if true, progress = 6
    firstMessage?: string;
    amount?: number;
}

export async function createOpportunity(params: CreateOpportunityParams) {
    const {
        name, company, phone, email, linkedin, website, role, product, customField,
        status, source, responsible, touchpoint, engaged, firstMessage, amount: providedAmount
    } = params;

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

        let amount = 0;

        if (providedAmount !== undefined) {
            amount = providedAmount;
        } else {
            try {
                // Try to parse as JSON array first
                const products = JSON.parse(product || "[]");
                if (Array.isArray(products)) {
                    amount = products.reduce((acc: number, pName: string) => {
                        const found = settings.products.find(p => p.name === pName);
                        return acc + (found ? parseFloat(found.price) : 0);
                    }, 0);
                } else {
                    // Fallback for single string if not JSON
                    const selectedProduct = settings.products.find(p => p.name === product);
                    amount = selectedProduct ? parseFloat(selectedProduct.price) : 0;
                }
            } catch (e) {
                // Fallback for simple string
                const selectedProduct = settings.products.find(p => p.name === product);
                amount = selectedProduct ? parseFloat(selectedProduct.price) : 0;
            }
        }

        // Determine next step progress
        // If engaged is true, progress is 6
        // Else use touchpoint (1-5), default to 0 if neither
        let progress = 0;
        if (engaged) {
            progress = 6;
        } else if (touchpoint) {
            progress = Math.min(Math.max(touchpoint, 0), 5);
        }

        // Create history log
        const history_log = [];
        if (firstMessage && firstMessage.trim()) {
            history_log.push({
                id: Date.now().toString(),
                message: firstMessage,
                date: new Date().toISOString()
            });
        }

        const { error } = await supabase
            .from('main_crm')
            .insert({
                name,
                company,
                phone,
                email,
                linkedin,
                website,
                role,
                product: product,
                custom_field: customField,
                amount: amount,
                empresa_id: empresaId,
                status: status || 'New',
                source: source || '',
                responsible: responsible || '',
                next_step: { progress: progress, total: 5, date: 'Pending' },
                history_log: history_log
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
