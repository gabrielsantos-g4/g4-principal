"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function deleteConversation(conversationId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // First, verify the conversation exists and get contact_id
        const { data: conversation, error: convError } = await supabase
            .from("camp_conversas")
            .select("id, contact_id")
            .eq("id", conversationId)
            .single();

        if (convError || !conversation) {
            console.error("Conversation not found:", convError);
            return { success: false, message: "Conversation not found" };
        }

        // Delete all messages in the conversation
        const { error: msgErr } = await supabase
            .from("camp_mensagens_n")
            .delete()
            .eq("conversa_id", conversationId);

        if (msgErr) {
            console.error("Error deleting messages:", msgErr);
            // Non-fatal, proceed to delete conversation
        }

        // Generate admin client for bypassing RLS on main_crm
        const adminSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                },
            }
        );

        // Delete the conversation itself
        const { error: delErr } = await adminSupabase
            .from("camp_conversas")
            .delete()
            .eq("id", conversationId);

        if (delErr) {
            console.error("Error deleting conversation:", delErr);
            return { success: false, message: "Failed to delete conversation" };
        }

        // Delete the lead from main_crm if contact_id exists
        if (conversation.contact_id) {
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(conversation.contact_id);
            const isNumeric = /^\d+$/.test(conversation.contact_id);

            let crmQuery = adminSupabase.from("main_crm").delete();

            if (isUuid) {
                crmQuery = crmQuery.eq("id_uuid", conversation.contact_id);
            } else if (isNumeric) {
                crmQuery = crmQuery.eq("id", conversation.contact_id);
            } else {
                // Should theoretically not happen, but safe fallback
                crmQuery = crmQuery.eq("id_uuid", conversation.contact_id);
            }

            const { error: crmErr } = await crmQuery;

            if (crmErr) {
                console.error("Error deleting lead from main_crm:", crmErr);
                // Return success anyway since the conversation is gone, but log it
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete conversation:", error);
        return { success: false, message: "An unexpected error occurred" };
    }
}
