'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export interface TagItem {
    id?: string | number;
    label: string;
    bg: string;
    text: string;
    email?: string;
    temperature?: 'Cold' | 'Warm' | 'Hot';
}

export interface CrmSettings {
    id?: number;
    empresa_id?: string;
    products: { id?: string | number; name: string; price: string }[];
    statuses: { id?: string | number; label: string; bg: string; text: string; phase?: 'not_started' | 'in_progress' | 'closing'; temperature?: 'Cold' | 'Warm' | 'Hot' }[];
    responsibles: (string | TagItem)[];
    sources: (string | TagItem)[];
    custom_fields: { name: string; options: (string | TagItem)[] };
    qualification_questions?: { field: string; criteria: string; }[];
    qualification_actions?: {
        nq: { type: string; value: string };
        mql: { type: string; value: string };
        sql: { type: string; value: string };
    };
    lost_reasons?: (string | TagItem)[];
    temperatures?: (string | TagItem)[];
    revenue_goal?: number;
    avg_ticket?: number;
    close_rate?: number;
}

const DEFAULT_SETTINGS: CrmSettings = {
    products: [
        { id: 1, name: "Product A", price: "100.00" },
        { id: 2, name: "Product B", price: "250.00" },
        { id: 3, name: "Product C", price: "500.00" },
        { id: 4, name: "Product D", price: "1000.00" }
    ],
    statuses: [
        { label: "Not a good fit", bg: "bg-red-900", text: "text-red-100", phase: 'not_started' },
        { label: "Talk to", bg: "bg-blue-900", text: "text-blue-100", phase: 'not_started' },
        { label: "Talking", bg: "bg-green-900", text: "text-green-100", phase: 'in_progress' },
        { label: "Talk Later", bg: "bg-yellow-900", text: "text-yellow-100", phase: 'not_started' },
        { label: "Not interested", bg: "bg-red-200", text: "text-red-900", phase: 'not_started' },
        { label: "Client", bg: "bg-emerald-900", text: "text-emerald-100", phase: 'closing' }
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
    },
    qualification_questions: [],
    lost_reasons: [
        { label: "Price too high", bg: "bg-red-900", text: "text-red-100" },
        { label: "Competitor", bg: "bg-slate-800", text: "text-slate-100" },
        { label: "Features missing", bg: "bg-slate-800", text: "text-slate-100" },
        { label: "Bad timing", bg: "bg-slate-800", text: "text-slate-100" }
    ],
    temperatures: [
        { label: "Cold", bg: "bg-blue-900", text: "text-blue-100" },
        { label: "Warm", bg: "bg-orange-900", text: "text-orange-100" },
        { label: "Hot", bg: "bg-red-900", text: "text-red-100" }
    ],
    revenue_goal: 0,
    avg_ticket: 0,
    close_rate: 0
};

export async function getCrmSettings(companyId?: string): Promise<CrmSettings> {
    const supabase = await createClient();
    const empresaId = companyId || await getEmpresaId();

    if (!empresaId) return DEFAULT_SETTINGS;

    // Fetch current user to check for active agents (Jess)
    const { data: { user } } = await supabase.auth.getUser();
    let jessActive = false;

    if (user) {
        const { data: profile } = await supabase
            .from('main_profiles')
            .select('active_agents')
            .eq('id', user.id)
            .single();

        // Check if Jess is active
        if (profile?.active_agents?.includes('customer-jess')) {
            jessActive = true;
        }
    }

    console.log("[getCrmSettings] Fetching settings for companyId:", empresaId);

    // Fetch existing settings
    const { data, error } = await supabase
        .from('main_crm_settings')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();

    if (error) {
        console.error("[getCrmSettings] Error fetching settings:", error);
    }

    console.log("[getCrmSettings] Fetched data:", data ? "Found" : "Not Found");
    if (data) console.log("[getCrmSettings] Statuses count:", data.statuses?.length);

    if (data) {
        // Ensure responsibles, sources, and options are objects (migration)
        const migrateTags = (items: any[]) => items?.map(item =>
            typeof item === 'string' ? { label: item, bg: 'bg-slate-800', text: 'text-slate-100' } : item
        ) || [];

        return {
            ...DEFAULT_SETTINGS,
            ...data,
            revenue_goal: data.revenue_goal || 0,
            avg_ticket: data.avg_ticket || 0,
            close_rate: data.close_rate || 0,
            statuses: migrateTags((data.statuses && data.statuses.length > 0) ? data.statuses : DEFAULT_SETTINGS.statuses),
            responsibles: (() => {
                const baseResponsibles = migrateTags(data.responsibles);
                // Check if Jess is already in the list to avoid duplicates
                const jessExists = baseResponsibles.some(r => r.label === 'Jess');

                if (jessActive && !jessExists) {
                    return [
                        ...baseResponsibles,
                        { label: "Jess", bg: "bg-purple-900", text: "text-purple-100", email: "ai@startg4.com" }
                    ];
                }
                return baseResponsibles;
            })(),
            sources: migrateTags(data.sources),
            custom_fields: {
                ...data.custom_fields,
                options: migrateTags(data.custom_fields?.options)
            },
            qualification_questions: data.qualification_questions || [],
            qualification_actions: data.qualification_actions || {
                nq: { type: "text", value: "" },
                mql: { type: "text", value: "" },
                sql: { type: "text", value: "" }
            },
            lost_reasons: migrateTags(data.lost_reasons || []),
            temperatures: migrateTags(data.temperatures || DEFAULT_SETTINGS.temperatures)
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
