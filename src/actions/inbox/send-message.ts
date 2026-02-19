'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

// Webhook URL provided by user
const WEBHOOK_URL = 'https://hook.startg4.com/webhook/3bf7fa03-e9e7-4fce-b676-00ae89b96fa9';

export async function sendMessage(conversationId: string, message: string, type: string = 'text', mediaUrl: string = '') {
    if (!message && type === 'text') return { success: false, message: "Empty message" };

    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, message: "Unauthorized" };

    // 3. Construct Payload
    // We already have conversationId, so we can send it directly.
    const payload = [{
        "conversa_id": conversationId,
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
