'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

const WEBHOOK_URL = 'https://hook.startg4.com/webhook/3bf7fa03-e9e7-4fce-b676-00ae89b96fa9';

export async function sendMessage(conversationId: string, message: string, type: string = 'text', mediaUrl: string = '') {
    if (!message && type === 'text') return { success: false, message: "Empty message" };

    const empresaId = await getEmpresaId();
    if (!empresaId) return { success: false, message: "Unauthorized" };

    const supabase = await createAdminClient();

    // 1. Insert message directly into Supabase for instant UI update
    const { data: inserted, error: insertError } = await supabase
        .from('camp_mensagens_n')
        .insert({
            empresa_id: empresaId,
            conversa_id: conversationId,
            body: message,
            media_url: mediaUrl || null,
            media_type: type,
            direction: 'outbound',
            status: 'pending',
        })
        .select('id, body, created_at, direction, status, media_type, media_url')
        .single();

    if (insertError) {
        console.error('[sendMessage] Insert error:', insertError);
        return { success: false, message: insertError.message };
    }

    // 2. Fire webhook in background (n8n handles WhatsApp delivery — no longer inserts the message)
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
            conversa_id: conversationId,
            empresa_id: empresaId,
            mensage_body: message,
            message_type: type,
            message_midia_url: mediaUrl,
            mensagem_id: inserted.id, // pass the already-inserted ID so n8n can update status
        }]),
    }).catch(err => console.error('[sendMessage] Webhook error:', err));

    return {
        success: true,
        message: {
            id: inserted.id,
            content: inserted.body || '',
            senderId: 'me',
            timestamp: inserted.created_at || new Date().toISOString(),
            status: inserted.status || 'pending',
            type: inserted.media_type === 'image' || inserted.media_type === 'video' || inserted.media_type === 'audio'
                ? inserted.media_type : 'text',
            mediaUrl: inserted.media_url || undefined,
        }
    };
}
