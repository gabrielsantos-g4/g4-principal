'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";

import { getCrmSettings } from "./get-crm-settings";

import { logAction } from "@/actions/audit";

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
    qualification_status?: string;
    nextDate?: string;
}

export async function createOpportunity(params: CreateOpportunityParams) {
    const {
        name, company, phone, email, linkedin, website, role, product, customField,
        status, source, responsible, touchpoint, engaged, firstMessage, amount: providedAmount,
        qualification_status, nextDate
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

        let finalSource = source;
        if (!finalSource && settings?.sources?.length > 0) {
            finalSource = typeof settings.sources[0] === 'string'
                ? settings.sources[0]
                : settings.sources[0].label;
        } else if (!finalSource) {
            finalSource = '';
        }

        let finalCustomField = customField;
        if (!finalCustomField && settings?.custom_fields?.options?.length > 0) {
            finalCustomField = typeof settings.custom_fields.options[0] === 'string'
                ? settings.custom_fields.options[0]
                : settings.custom_fields.options[0].label;
        } else if (!finalCustomField) {
            finalCustomField = '';
        }

        let finalStatus = status;
        if (!finalStatus && settings?.statuses?.length > 0) {
            finalStatus = typeof settings.statuses[0] === 'string'
                ? settings.statuses[0]
                : settings.statuses[0].label;
        } else if (!finalStatus) {
            finalStatus = 'New';
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
                custom_field: finalCustomField,
                amount: amount,
                empresa_id: empresaId,
                status: finalStatus,
                source: finalSource,
                responsible: responsible || '',
                next_step: { progress: progress, total: 5, date: nextDate || 'Pending' },
                history_log: history_log,
                qualification_status: qualification_status || 'LEAD'
            });

        if (error) {
            console.error("Error creating opportunity:", error);
            return { success: false, error: "Failed to create opportunity. Please try again." };
        }

        revalidatePath('/dashboard/crm'); // Ajustar caminho conforme necessário

        // We can't easily get the ID since insert doesn't return it by default unless select() is called.
        // But let's check if insert returned data.
        // The current code is: .insert({...}) which returns status 201 but no data unless .select() is appended.
        // I should modify the insert to select() to get the ID.
        // BUT changing the insert logic might be risky.
        // For now, I will just log the name.
        await logAction('LEAD_CREATED', { name: name, company: company });

        return { success: true };

    } catch (error) {
        console.error("Unexpected error:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
