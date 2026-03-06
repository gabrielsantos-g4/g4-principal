'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

/**
 * Fetches the details (avatar and extracted phone number) for a specific WhatsApp instance by agent name.
 */
export async function getWhatsAppInstanceDetailsByAgent(agentName: string) {
    const supabase = await createAdminClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) return { avatar: null, phoneNumber: null };

    // Try exact match on agent_name
    let { data, error } = await supabase
        .from('instance_wa_chaterly')
        .select('avatar, nome')
        .eq('empresa', empresaId)
        .eq('agent_name', agentName)
        .eq('ativo', true)
        .limit(1)
        .single();

    if (!data || error) {
        // Fallback: try case-insensitive or partial match on 'nome' if agent_name is null
        const { data: fallbackData } = await supabase
            .from('instance_wa_chaterly')
            .select('avatar, nome')
            .eq('empresa', empresaId)
            .ilike('nome', `%${agentName.toLowerCase()}%`)
            .eq('ativo', true)
            .limit(1)
            .single();

        if (fallbackData) {
            return {
                avatar: fallbackData.avatar,
                phoneNumber: extractPhone(fallbackData.nome)
            };
        }
        return { avatar: null, phoneNumber: null };
    }

    return {
        avatar: data.avatar,
        phoneNumber: extractPhone(data.nome)
    };
}

/**
 * Extracts the phone number from the instance name (format: number_companyId)
 */
function extractPhone(nome: string): string | null {
    if (!nome) return null;
    // Format is usually "5511999999999_uuid-company-id"
    const parts = nome.split('_');
    if (parts.length > 0) {
        const phone = parts[0];
        // Basic check if it looks like a phone number (mostly digits)
        if (/^\d+$/.test(phone)) {
            return phone;
        }
    }
    return null;
}
