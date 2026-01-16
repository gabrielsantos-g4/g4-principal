"use server";

import { createClient } from "@/lib/supabase";

export type WhatsAppInstance = {
    uid: string;
    status: string;
    empresa: string;
    qr_code: string | null;
    avatar: string | null;
    nome: string;
};

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function getWhatsAppInstances(companyId: string): Promise<WhatsAppInstance[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("instance_wa_chaterly")
        .select("*")
        .eq("empresa", companyId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching WhatsApp instances:", error);
        return [];
    }

    return data as WhatsAppInstance[];
}

export async function createWhatsAppInstance(name: string, companyId: string) {
    const supabase = await createClient();

    // Validate name format
    const nameRegex = /^[a-zA-Z0-9_-]+$/
    if (!nameRegex.test(name)) {
        return { error: 'O nome deve conter apenas letras, números, hífens e underlines.' }
    }

    // Construct the unique name matching existing logic: name_companyId
    const instanceName = `${name}_${companyId}`

    // Check uniqueness (checking 'nome' now)
    const { data: existing } = await supabase
        .from('instance_wa_chaterly')
        .select('uid')
        .eq('nome', instanceName)
        .single()

    if (existing) {
        return { error: 'Já existe uma instância com este nome.' }
    }

    // Create instance in DB
    const { data, error } = await supabase
        .from('instance_wa_chaterly')
        .insert({
            uid: randomUUID(), // Generate valid UUID
            empresa: companyId,
            nome: instanceName, // Store string ID here
            status: 'STOPPED',
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating instance:', error)
        return { error: 'Erro ao criar instância. Tente novamente.' }
    }

    revalidatePath('/dashboard/messenger/instances')
    revalidatePath('/dashboard/customer-support')
    return { success: true, data }
}

export async function deleteWhatsAppInstance(uid: string, companyId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('instance_wa_chaterly')
        .delete()
        .match({ uid, empresa: companyId });

    if (error) {
        console.error('Error deleting instance:', error);
        return { error: 'Erro ao excluir instância.' };
    }

    revalidatePath('/dashboard/messenger/instances');
    revalidatePath('/dashboard/customer-support');
    return { success: true };
}
