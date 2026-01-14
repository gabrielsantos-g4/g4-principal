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
    const { error } = await supabase
        .from("main_empresas")
        .update({ wpp_name: name })
        .eq("id", companyId);

    if (error) {
        console.error("Error updating agent name:", error);
        throw new Error("Failed to update agent name");
    }

    return true;
}
