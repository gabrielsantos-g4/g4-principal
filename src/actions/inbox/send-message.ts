'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

// Webhook URL provided by user
const WEBHOOK_URL = 'https://hook.startg4.com/webhook/3bf7fa03-e9e7-4fce-b676-00ae89b96fa9';

export async function sendMessage(leadId: string, message: string, type: string = 'text', mediaUrl: string = '') {
    if (!message && type === 'text') return { success: false, message: "Empty message" };

    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, message: "Unauthorized" };

    const supabaseAdmin = await createAdminClient();

    // 1. Resolve Lead to find JID / Phone
    const { data: lead, error: leadError } = await supabaseAdmin
        .from('main_crm')
        .select('ctt_jid, phone')
        .eq('id', leadId)
        .eq('empresa_id', empresaId)
        .single();

    if (leadError || !lead) {
        console.error("Error fetching lead:", leadError);
        return { success: false, message: "Lead not found" };
    }

    const jid = lead.ctt_jid || lead.phone;
    if (!jid) return { success: false, message: "No contact info for lead" };

    // 2. Find Conversation ID from camp_conversas
    const { data: conversa, error: conversaError } = await supabaseAdmin
        .from('camp_conversas')
        .select('id')
        .eq('remote_jid', jid)
        .eq('empresa_id', empresaId)
        .single();

    if (conversaError || !conversa) {
        console.error("Error fetching conversation:", conversaError);
        return { success: false, message: "Conversation not found" };
    }

    // 3. Construct Payload
    const payload = [{
        "conversa_id": conversa.id,
        "empresa_id": empresaId,
        "mensage_body": message,
        "message_type": type,
        "message_midia_url": mediaUrl
    }];

    // 4. Send to Webhook
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Webhook error:", response.status, errorText);
            return { success: false, message: `Webhook failed: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: "Network error" };
    }
}
