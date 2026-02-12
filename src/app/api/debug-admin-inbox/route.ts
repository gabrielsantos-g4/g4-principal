
import { NextResponse } from 'next/server';
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
    try {
        const userId = '18103d4c-8ed4-4713-9452-7e57e522ea12'; // Gabriel Santos
        const empresaId = 'b26a3844-1eff-42de-9e50-4db7e8c1c976'; // G4
        const responsibleName = 'Gabriel Santos';

        const supabaseAdmin = await createAdminClient();

        const { data: leads, error } = await supabaseAdmin
            .from('main_crm')
            .select('*')
            .eq('empresa_id', empresaId)
            .eq('responsible', responsibleName)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
        }

        const debugData = leads?.map(l => ({
            id: l.id,
            name: l.name,
            is_read_by_responsible: l.is_read_by_responsible,
            calculated_unreadCount: l.is_read_by_responsible ? 0 : 1
        }));

        return NextResponse.json({
            success: true,
            userId,
            empresaId,
            responsibleName,
            total: leads?.length,
            debug: debugData,
            raw: leads
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
