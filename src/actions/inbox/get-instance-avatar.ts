'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

/**
 * Fetches the avatar URL for a specific WhatsApp instance.
 */
export async function getInstanceAvatar(instanceId: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('instance_wa_chaterly')
        .select('avatar')
        .eq('uid', instanceId)
        .single();

    if (error) {
        console.error("[getInstanceAvatar] Error:", error);
        return null;
    }

    return data?.avatar;
}

/**
 * Finds an instance avatar by the agent's name (e.g., 'Jess').
 * Useful when we have an agent context but not yet a specific instance ID.
 */
export async function getInstanceAvatarByAgent(agentName: string) {
    const supabase = await createAdminClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) return null;

    // First try exact match on agent_name
    let { data, error } = await supabase
        .from('instance_wa_chaterly')
        .select('avatar')
        .eq('empresa', empresaId)
        .eq('agent_name', agentName)
        .eq('ativo', true)
        .limit(1)
        .single();

    if (!data || error) {
        // Fallback: try case-insensitive or partial match on 'nome' if agent_name is null
        const { data: fallbackData } = await supabase
            .from('instance_wa_chaterly')
            .select('avatar')
            .eq('empresa', empresaId)
            .ilike('nome', `%${agentName.toLowerCase()}%`)
            .eq('ativo', true)
            .limit(1)
            .single();

        return fallbackData?.avatar || null;
    }

    return data?.avatar || null;
}
