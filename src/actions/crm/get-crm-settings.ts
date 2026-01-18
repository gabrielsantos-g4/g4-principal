'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export interface TagItem {
    label: string;
    bg: string;
    text: string;
}

export interface CrmSettings {
    id?: number;
    empresa_id?: string;
    products: { id?: number; name: string; price: string }[];
    statuses: { id?: number; label: string; bg: string; text: string }[];
    responsibles: (string | TagItem)[];
    sources: (string | TagItem)[];
    custom_fields: { name: string; options: (string | TagItem)[] };
}

const DEFAULT_SETTINGS: CrmSettings = {
    products: [
        { id: 1, name: "Product A", price: "100.00" },
        { id: 2, name: "Product B", price: "250.00" },
        { id: 3, name: "Product C", price: "500.00" },
        { id: 4, name: "Product D", price: "1000.00" }
    ],
    statuses: [
        { label: "Not a good fit", bg: "bg-red-900", text: "text-red-100" },
        { label: "Talk to", bg: "bg-blue-900", text: "text-blue-100" },
        { label: "Talking", bg: "bg-green-900", text: "text-green-100" },
        { label: "Talk Later", bg: "bg-yellow-900", text: "text-yellow-100" },
        { label: "Not interested", bg: "bg-red-200", text: "text-red-900" },
        { label: "Client", bg: "bg-emerald-900", text: "text-emerald-100" }
    ],
    responsibles: [
        { label: "Gabriel", bg: "bg-blue-900", text: "text-blue-100" },
        { label: "Vini", bg: "bg-purple-900", text: "text-purple-100" },
        { label: "Nanda", bg: "bg-pink-900", text: "text-pink-100" },
        { label: "Leticia", bg: "bg-orange-900", text: "text-orange-100" }
    ],
    sources: [
        { label: "Instagram", bg: "bg-pink-900", text: "text-pink-100" },
        { label: "LinkedIn", bg: "bg-blue-900", text: "text-blue-100" },
        { label: "Google Ads", bg: "bg-yellow-900", text: "text-yellow-100" },
        { label: "Indication", bg: "bg-green-900", text: "text-green-100" }
    ],
    custom_fields: {
        name: "Category",
        options: [
            { label: "Project A", bg: "bg-slate-800", text: "text-slate-100" },
            { label: "Project B", bg: "bg-slate-800", text: "text-slate-100" },
            { label: "Internal", bg: "bg-slate-800", text: "text-slate-100" }
        ]
    }
};

export async function getCrmSettings(): Promise<CrmSettings> {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) return DEFAULT_SETTINGS;

    // Fetch existing settings
    const { data, error } = await supabase
        .from('main_crm_settings')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();

    if (data) {
        // Ensure responsibles, sources, and options are objects (migration)
        const migrateTags = (items: any[]) => items?.map(item =>
            typeof item === 'string' ? { label: item, bg: 'bg-slate-800', text: 'text-slate-100' } : item
        ) || [];

        return {
            ...DEFAULT_SETTINGS,
            ...data,
            responsibles: migrateTags(data.responsibles),
            sources: migrateTags(data.sources),
            custom_fields: {
                ...data.custom_fields,
                options: migrateTags(data.custom_fields?.options)
            }
        };
    }

    // If no settings exist, try to create default ones
    const { data: newSettings, error: insertError } = await supabase
        .from('main_crm_settings')
        .insert({
            empresa_id: empresaId,
            ...DEFAULT_SETTINGS
        })
        .select()
        .single();

    if (insertError) {
        console.error("Failed to create default settings:", insertError);
        return DEFAULT_SETTINGS;
    }

    return newSettings;
}
