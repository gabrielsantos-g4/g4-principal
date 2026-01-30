"use server";

import { createClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { revalidatePath } from "next/cache";

export async function updateQualificationQuestions(questions: { field: string; criteria: string; format: string; }[]) {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) {
        return { success: false, error: "Company ID not found" };
    }

    const { error } = await supabase
        .from("main_crm_settings")
        .update({ qualification_questions: questions })
        .eq("empresa_id", empresaId);

    if (error) {
        console.error("Error updating qualification questions:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/customer-support");
    revalidatePath("/dashboard/crm");

    return { success: true };
}
