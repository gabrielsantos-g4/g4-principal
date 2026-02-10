'use server';

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export interface MessagingUser {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
}

export async function getMessagingUsers(): Promise<MessagingUser[]> {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) return [];

    const { data, error } = await supabase
        .from('main_profiles')
        .select('id, name, avatar_url, email')
        .eq('empresa_id', empresaId)
        .eq('has_messaging_access', true)
        .order('name');

    if (error) {
        console.error("Error fetching messaging users:", error);
        return [];
    }

    return data || [];
}
