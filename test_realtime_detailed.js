const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
        envVars[key.trim()] = vals.join('=').trim().replace(/['"]/g, '');
    }
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);
const empresaId = '658d0a8c-09a4-4375-b1ac-98f28e0afbc3';

console.log('Listening to Realtime changes for empresa:', empresaId);

const channelMsgsId = `test-omnichannel-messages-${empresaId}`;
const channelLeadsId = `test-omnichannel-leads-${empresaId}`;
const channelConversasId = `test-omnichannel-conversas-${empresaId}`;

supabase.channel(channelMsgsId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'camp_mensagens_n', filter: `empresa_id=eq.${empresaId}` }, payload => {
        console.log('📬 MENSAGEM:', payload);
    })
    .subscribe(status => console.log('Msg Status:', status));

supabase.channel(channelConversasId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'camp_conversas', filter: `empresa_id=eq.${empresaId}` }, payload => {
        console.log('📞 CONVERSA:', payload);
    })
    .subscribe(status => console.log('Conv Status:', status));

supabase.channel(channelLeadsId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'main_crm', filter: `empresa_id=eq.${empresaId}` }, payload => {
        console.log('👤 CRM:', payload);
    })
    .subscribe(status => console.log('CRM Status:', status));
