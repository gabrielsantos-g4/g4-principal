
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Admin Client (Service Role)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            phone,
            email,
            company,
            role,
            message, // Initial message or history
            empresa_id,
            responsible = 'Jess', // Default to Jess
            source = 'Waha',      // Default source
            channel = 'whatsapp',
            custom_field = 'Lead' // Default category/tag
        } = body;

        // Map channel to Title Case for DB Constraint
        const channelMap: Record<string, string> = {
            'whatsapp': 'WhatsApp',
            'linkedin': 'LinkedIn',
            'webchat': 'WebChat',
            'instagram': 'Instagram',
            'facebook': 'Facebook',
            'email': 'Email',
            'sms': 'SMS',
            'phone': 'Phone'
        };
        const dbChannel = channelMap[channel.toLowerCase()] || 'WhatsApp';

        // Basic validation
        if (!name || !empresa_id) {
            return NextResponse.json({ error: 'Missing required fields: name, empresa_id' }, { status: 400 });
        }

        // 1. Check if lead already exists (deduplication by Phone or Email preferred, but Name is strict blocker in modal)
        // Let's use Phone as primary dedup for automation if available, falling back to name.
        let existingLead = null;

        if (phone) {
            const { data } = await supabase
                .from('main_crm')
                .select('id')
                .eq('empresa_id', empresa_id)
                .eq('phone', phone)
                .single();
            existingLead = data;
        }

        if (!existingLead && email) {
            const { data } = await supabase
                .from('main_crm')
                .select('id')
                .eq('empresa_id', empresa_id)
                .eq('email', email)
                .single();
            existingLead = data;
        }

        // If it exists, maybe update it? For now, let's just log and return it to avoid duplicate spam.
        // Or if it's a "New" interaction, maybe move it to "New" status?
        // Current requirement: "Create lead".
        if (existingLead) {
            return NextResponse.json({ success: true, id: existingLead.id, message: 'Lead already exists' });
        }

        // 2. Insert Lead
        const { data: lead, error } = await supabase
            .from('main_crm')
            .insert({
                empresa_id,
                name,
                phone,
                email,
                company,
                role,
                responsible,
                source,
                custom_field, // "Lead" tag
                status: 'New',
                conversation_channel: dbChannel,
                history_log: message ? [{
                    date: new Date().toISOString(),
                    message: message,
                    type: 'system' // or 'user'
                }] : []
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting lead:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, lead });

    } catch (err: any) {
        console.error('Ingest Lead Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
