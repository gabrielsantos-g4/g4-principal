'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export async function deleteMessageForEveryone(messageId: string) {
    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, error: 'Unauthorized' };

    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('camp_mensagens_n')
        .delete()
        .eq('id', messageId)
        .eq('empresa_id', empresaId);

    if (error) {
        console.error('[deleteMessage] Error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
