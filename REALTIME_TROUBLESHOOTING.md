# Guia de Troubleshooting - WebSocket Realtime

## Problema Identificado
Erro de conexão WebSocket na rota `/dashboard/customer-support?tab=omnichannel`

## Possíveis Causas

### 1. Políticas RLS (Row Level Security) Bloqueando Realtime
O Supabase Realtime requer que as políticas RLS permitam acesso aos dados para o usuário autenticado.

**Solução:**
1. Acesse o Supabase SQL Editor
2. Execute o script `fix_realtime_rls.sql` que foi criado
3. Verifique se as tabelas estão habilitadas para Realtime:

```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

Se as tabelas `camp_mensagens`, `camp_conversas` e `main_crm` não aparecerem, execute:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_mensagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_conversas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.main_crm;
```

### 2. Problemas de Autenticação
O cliente Supabase precisa estar autenticado para estabelecer conexões Realtime.

**Verificação:**
1. Acesse `http://localhost:3000/dashboard/customer-support?tab=omnichannel`
2. Clique no botão "🔧 Test Connection" no canto superior direito
3. Verifique os resultados do diagnóstico

**Possíveis problemas:**
- Usuário não autenticado
- Token expirado
- Sessão inválida

**Solução:**
- Faça logout e login novamente
- Verifique se o cookie de sessão está sendo mantido

### 3. Configuração do Supabase Realtime
O Supabase pode ter o Realtime desabilitado ou com configurações incorretas.

**Verificação no Dashboard do Supabase:**
1. Acesse https://supabase.com/dashboard
2. Vá para seu projeto
3. Settings > API
4. Verifique se "Realtime" está habilitado
5. Verifique se as tabelas estão na lista de "Realtime enabled tables"

### 4. Problemas de Rede/CORS
WebSocket pode ser bloqueado por firewalls ou configurações de rede.

**Verificação:**
1. Abra o DevTools do navegador (F12)
2. Vá para a aba "Network"
3. Filtre por "WS" (WebSocket)
4. Procure por conexões com status de erro

**Possíveis erros:**
- `ERR_CONNECTION_REFUSED`: Servidor não está aceitando conexões
- `ERR_CONNECTION_TIMED_OUT`: Timeout na conexão
- `403 Forbidden`: Problema de autenticação/autorização
- `404 Not Found`: Endpoint incorreto

### 5. Múltiplas Instâncias do Cliente Supabase
O código pode estar criando múltiplas instâncias do cliente, causando conflitos.

**Solução já implementada:**
O código já usa `useRef` para manter uma única instância do cliente:

```typescript
const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
if (!supabaseRef.current) {
  supabaseRef.current = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Passos para Resolver

### Passo 1: Executar Diagnóstico
1. Acesse a página com problema
2. Clique em "🔧 Test Connection"
3. Anote os erros encontrados

### Passo 2: Corrigir RLS
1. Execute o script `fix_realtime_rls.sql` no Supabase SQL Editor
2. Verifique se as políticas foram criadas corretamente

### Passo 3: Habilitar Realtime nas Tabelas
Execute no Supabase SQL Editor:

```sql
-- Verificar tabelas habilitadas
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Habilitar se necessário
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_mensagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_conversas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.main_crm;
```

### Passo 4: Verificar Logs do Console
Abra o DevTools (F12) e verifique os logs:

```
[OmnichannelInbox] Leads channel status: SUBSCRIBED ✅
[OmnichannelInbox] Messages channel status: SUBSCRIBED ✅
```

Se aparecer `CHANNEL_ERROR`, há um problema de configuração.

### Passo 5: Testar Manualmente
Execute este código no console do navegador:

```javascript
const { createClient } = await import('@supabase/supabase-js');

const supabase = createClient(
  'https://eookwjdxufyrokrajdfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTY4MzIsImV4cCI6MjA3MDc3MjgzMn0.AZ6LxbERq7UsV7-DMyPxewEn6UBs3fkv6bGY7iM87qA'
);

const channel = supabase.channel('test-channel');

channel.subscribe((status) => {
  console.log('Status:', status);
});
```

Se o status for `SUBSCRIBED`, a conexão está funcionando.

## Logs Úteis

### Console do Navegador
```
[OmnichannelInbox] fetchData called. targetUserId: xxx empresaId: xxx
[OmnichannelInbox] Leads channel status: SUBSCRIBED
[OmnichannelInbox] Messages channel status: SUBSCRIBED
[OmnichannelInbox] Realtime: CRM update detected
[OmnichannelInbox] Realtime: New message detected
```

### Erros Comuns
```
[OmnichannelInbox] Failed to subscribe to leads channel
[OmnichannelInbox] Failed to subscribe to messages channel
Error: Connection timeout
Error: Channel error
```

## Verificação Final

Após aplicar as correções:

1. ✅ Políticas RLS criadas
2. ✅ Tabelas habilitadas para Realtime
3. ✅ Usuário autenticado
4. ✅ Console mostra "SUBSCRIBED"
5. ✅ Mensagens aparecem em tempo real

## Suporte Adicional

Se o problema persistir:

1. Verifique os logs do Supabase Dashboard (Logs > Realtime)
2. Teste com outro usuário/navegador
3. Verifique se há rate limiting ativo
4. Contate o suporte do Supabase se necessário

## Código de Teste Rápido

Adicione este código temporariamente no `useEffect` para debug:

```typescript
useEffect(() => {
  console.log('🔍 Debug Info:', {
    empresaId: crmSettings?.empresa_id,
    targetUserId,
    hasSupabaseClient: !!supabaseRef.current,
    conversationsCount: conversations.length
  });
}, [crmSettings?.empresa_id, targetUserId, conversations.length]);
```

## Remover Componente de Diagnóstico

Após resolver o problema, remova o botão de diagnóstico:

1. Remova a importação: `import { RealtimeDiagnostics } from "./realtime-diagnostics";`
2. Remova o estado: `const [showDiagnostics, setShowDiagnostics] = useState(false);`
3. Remova o botão e o componente do JSX
