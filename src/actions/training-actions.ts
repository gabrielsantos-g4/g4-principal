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
