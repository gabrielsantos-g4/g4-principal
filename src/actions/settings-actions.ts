"use server";

import { createClient } from "@/lib/supabase";

export async function getCompanySettings(companyId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("main_empresas")
        .select("wpp_name, name")
        .eq("id", companyId)
        .single();

    if (error) {
        console.error("Error fetching company settings:", error);
        return null;
    }

    return {
        wpp_name: data?.wpp_name || "",
        name: data?.name || ""
    };
}

export async function updateAgentName(companyId: string, name: string) {
    const supabase = await createClient();

    // Update main company settings
    const { error: error1 } = await supabase
        .from("main_empresas")
        .update({ wpp_name: name })
        .eq("id", companyId);

    if (error1) {
        console.error("Error updating agent name in main_empresas:", error1);
        throw new Error("Failed to update agent name in main_empresas");
    }

    // Update agent name for all WhatsApp instances of the company
    const { error: error2 } = await supabase
        .from("instance_wa_chaterly")
        .update({ agent_name: name })
        .eq("empresa", companyId);

    if (error2) {
        console.error("Error updating agent name in instance_wa_chaterly:", error2);
        throw new Error("Failed to update agent name in WhatsApp instances");
    }

    return true;
}
