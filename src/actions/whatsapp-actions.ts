"use server";

import { createClient } from "@/lib/supabase";

export type WhatsAppInstance = {
    uid: string;
    status: string;
    empresa: string;
    qr_code: string | null;
    avatar: string | null;
};

export async function getWhatsAppInstance(companyId: string): Promise<WhatsAppInstance | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("instance_wa_chaterly")
        .select("*")
        .eq("empresa", companyId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Not found code usually
            return null;
        }
        console.error("Error fetching WhatsApp instance:", error);
        return null;
    }

    return data as WhatsAppInstance;
}
