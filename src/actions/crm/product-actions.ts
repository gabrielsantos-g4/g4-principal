'use server';

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { logAction } from "@/actions/audit";

export async function checkProductUsage(productName: string) {
    const supabase = await createClient();
    console.log(`[Server] checkProductUsage called for: ${productName}`);

    try {
        // Since product is stored as a JSON string or simple string in 'product' column
        // We need to check if the column contains the productName
        // We'll use ilike for a broad match, then filter strictly in JS if needed,
        // or rely on the fact that product names are likely distinct enough.
        // Given it's a JSON array string like '["Product A"]', we can search for the name.

        // However, simple ilike '%name%' might match substrings. 
        // Better to fetch and filter if dataset isn't huge, or use postgres jsonb operators if it was jsonb.
        // It seems 'product' is text/varchar in the schema based on previous files.

        const { data, error } = await supabase
            .from('main_crm')
            .select('id, product')
            .ilike('product', `%${productName}%`);

        if (error) {
            console.error("Error checking product usage:", error);
            return { success: false, count: 0 };
        }

        // Strict filtering to avoid substring matches (e.g. "Pro" matching "Product")
        // Checks if productName exists in the parsed JSON array or equals the string
        const count = data?.filter(lead => {
            try {
                const parsed = JSON.parse(lead.product);
                if (Array.isArray(parsed)) {
                    return parsed.includes(productName);
                }
                return parsed === productName;
            } catch {
                return lead.product === productName || lead.product?.includes(productName);
            }
        }).length || 0;

        return { success: true, count };
    } catch (e) {
        console.error("Exception checking usage:", e);
        return { success: false, count: 0 };
    }
}

export async function transferProduct(oldName: string, newName?: string) {
    const supabase = await createClient();

    try {
        // 1. Fetch all leads potentially containing the old product
        const { data: leads, error } = await supabase
            .from('main_crm')
            .select('id, product')
            .ilike('product', `%${oldName}%`);

        if (error) {
            return { success: false, error: error.message };
        }

        if (!leads || leads.length === 0) {
            return { success: true, count: 0 };
        }

        let updateCount = 0;
        const updates = leads.map(async (lead) => {
            let currentProducts: string[] = [];
            let needsUpdate = false;

            try {
                const parsed = JSON.parse(lead.product || "[]");
                if (Array.isArray(parsed)) {
                    currentProducts = parsed;
                } else if (parsed) {
                    currentProducts = [parsed];
                }
            } catch {
                if (lead.product) currentProducts = [lead.product];
            }

            if (currentProducts.includes(oldName)) {
                // Remove old property
                const filtered = currentProducts.filter(p => p !== oldName);

                // Add new if provided and not already present
                if (newName && !filtered.includes(newName)) {
                    filtered.push(newName);
                }

                const newProductString = JSON.stringify(filtered);

                const { error: updateError } = await supabase
                    .from('main_crm')
                    .update({ product: newProductString })
                    .eq('id', lead.id);

                if (!updateError) {
                    updateCount++;
                    needsUpdate = true;
                }
            }
            return needsUpdate;
        });

        await Promise.all(updates);

        revalidatePath('/dashboard/crm');

        await logAction('PRODUCT_TRANSFER', {
            from: oldName,
            to: newName || 'Deleted',
            count: updateCount
        });

        return { success: true, count: updateCount };

    } catch (e) {
        console.error("Exception transferring product:", e);
        return { success: false, error: "Failed to transfer product" };
    }
}
