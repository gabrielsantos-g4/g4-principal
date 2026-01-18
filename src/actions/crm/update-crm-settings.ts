'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";
import { CrmSettings } from "./get-crm-settings";

export async function updateCrmSettings(settings: Partial<CrmSettings>) {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) {
        return { success: false, error: "Empresa not found" };
    }

    const { error } = await supabase
        .from('main_crm_settings')
        .upsert({
            empresa_id: empresaId,
            ...settings,
            updated_at: new Date().toISOString()
        }, { onConflict: 'empresa_id' });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/crm');
    return { success: true };
}
