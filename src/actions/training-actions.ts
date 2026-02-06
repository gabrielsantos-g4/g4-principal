"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type Training = {
    uid: string;
    created_at: string;
    titulo: string;
    empresa_id: string;
    tipo: string | null;
    expiry: string | null;
};

export async function getTrainings(): Promise<Training[]> {
    const supabase = await createClient();

    // Get current user to filter by company (though RLS should handle it, explicit filter is good practice if possible)
    // For now, relying on RLS + auth context
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // Get company_id from main_profiles
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

    if (!profile?.empresa_id) {
        return [];
    }

    const { data, error } = await supabase
        .from("treinamentos")
        .select("*")
        .eq("empresa_id", profile.empresa_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching trainings:", error);
        return [];
    }

    return data as Training[];
}

export async function deleteTraining(uid: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("treinamentos")
        .delete()
        .eq("uid", uid);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/customer-support");
}

export async function uploadTrainingFile(formData: FormData) {
    const WEBHOOK_URL = "https://hook.startg4.com/webhook/6cfc997c-e210-43d4-86a7-f5ffc718a685";

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            body: formData,
            // fetch with FormData in Node.js sets headers automatically (multipart/form-data)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Webhook Error:", text);
            return { success: false, error: "Upload failed via webhook" };
        }

        let data: any = {};
        try {
            const text = await response.text();
            if (text) data = JSON.parse(text);
        } catch (e) {
            // Ignore parse error if sucess but empty body
        }

        // Wait 2 seconds to ensure Webhook/DB consistency before revalidating
        await new Promise(resolve => setTimeout(resolve, 2000));

        revalidatePath("/dashboard/customer-support");
        return { success: true, data };

    } catch (error: any) {
        console.error("Server Action Upload Error:", error);
        return { success: false, error: error.message };
    }
}
