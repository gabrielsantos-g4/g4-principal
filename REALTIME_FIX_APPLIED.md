# ✅ Correções Aplicadas - Realtime WebSocket

## Status das Correções

### ✅ Políticas RLS Atualizadas
Todas as políticas RLS foram recriadas com uma abordagem mais simples e compatível com Realtime:

**camp_mensagens:**
- ✅ Allow authenticated users to view messages
- ✅ Allow authenticated users to insert messages
- ✅ Allow authenticated users to update messages

**camp_conversas:**
- ✅ Allow authenticated users to view conversations
- ✅ Allow authenticated users to insert conversations
- ✅ Allow authenticated users to update conversations

**main_crm:**
- ✅ Allow authenticated users to view crm
- ✅ Allow authenticated users to insert crm
- ✅ Allow authenticated users to update crm
- ✅ Allow authenticated users to delete crm

### ✅ Tabelas Habilitadas para Realtime
Todas as 3 tabelas estão na publicação `supabase_realtime`:
- ✅ camp_mensagens
- ✅ camp_conversas
- ✅ main_crm

### ✅ Código Atualizado
- ✅ Melhor tratamento de erros nos callbacks de subscrição
- ✅ Logging detalhado para debug
- ✅ Componente de diagnóstico adicionado

## Possíveis Causas do Erro CHANNEL_ERROR

### 1. Cache do Supabase Realtime
O Supabase pode estar usando cache das políticas antigas. Soluções:

**a) Aguardar 1-2 minutos** para o cache expirar

**b) Forçar reconexão:**
- Faça logout e login novamente na aplicação
- Ou limpe os cookies do navegador

**c) Reiniciar o servidor de desenvolvimento:**
```bash
# Pare o servidor (Ctrl+C)
# Limpe o cache do Next.js
rm -rf .next

# Inicie novamente
npm run dev
```

### 2. Token JWT Expirado
O token de autenticação pode estar expirado.

**Solução:**
- Faça logout e login novamente
- Verifique no console se `auth.uid()` retorna um valor válido

### 3. Problema com o Filtro
O filtro `empresa_id=eq.${empresaId}` pode estar causando problemas.

**Teste sem filtro (temporário):**
Remova temporariamente o filtro para testar:

```typescript
// Teste SEM filtro
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'main_crm'
    // Sem filter
}, ...)
```

Se funcionar sem filtro, o problema é com o valor de `empresaId`.

### 4. Limite de Conexões Realtime
O Supabase tem limites de conexões simultâneas.

**Verificar:**
- Acesse o Dashboard do Supabase
- Settings > Database > Connection pooling
- Verifique se não está no limite

## Próximos Passos para Testar

### 1. Limpar Cache e Reiniciar
```bash
# Pare o servidor
# Limpe o cache
rm -rf .next node_modules/.cache

# Reinicie
npm run dev
```

### 2. Teste com o Diagnóstico
1. Acesse: `http://localhost:3000/dashboard/customer-support?tab=omnichannel`
2. Clique em "🔧 Test Connection"
3. Verifique os resultados

### 3. Verifique os Logs Detalhados
Abra o console (F12) e procure por:

```
[OmnichannelInbox] Leads channel status: SUBSCRIBED ✅
[OmnichannelInbox] Messages channel status: SUBSCRIBED ✅
```

Se aparecer erro, procure por:
```
[OmnichannelInbox] Leads channel error: [detalhes do erro]
[OmnichannelInbox] Error details: [mais detalhes]
```

### 4. Teste Manual no Console
Execute no console do navegador:

```javascript
// Criar cliente Supabase
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'https://eookwjdxufyrokrajdfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTY4MzIsImV4cCI6MjA3MDc3MjgzMn0.AZ6LxbERq7UsV7-DMyPxewEn6UBs3fkv6bGY7iM87qA'
);

// Testar autenticação
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Testar conexão Realtime
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'main_crm'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe((status, err) => {
    console.log('Status:', status);
    if (err) console.error('Error:', err);
  });
```

## Se o Problema Persistir

### Opção 1: Desabilitar RLS Temporariamente (NÃO RECOMENDADO EM PRODUÇÃO)
```sql
-- APENAS PARA TESTE LOCAL
ALTER TABLE public.camp_mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_conversas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_crm DISABLE ROW LEVEL SECURITY;
```

Se funcionar sem RLS, o problema está nas políticas.

### Opção 2: Verificar Logs do Supabase
1. Acesse o Dashboard do Supabase
2. Vá em "Logs" > "Realtime"
3. Procure por erros relacionados às suas tabelas

### Opção 3: Contatar Suporte do Supabase
Se nada funcionar, pode ser um problema no servidor do Supabase:
- https://supabase.com/support
- Discord: https://discord.supabase.com

## Informações para Debug

**Project ID:** eookwjdxufyrokrajdfu
**Tabelas:** camp_mensagens, camp_conversas, main_crm
**RLS:** Habilitado em todas as tabelas
**Realtime:** Habilitado em todas as tabelas
**Políticas:** 3-4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)

## Checklist Final

- [ ] Políticas RLS criadas ✅
- [ ] Tabelas habilitadas para Realtime ✅
- [ ] Código atualizado com melhor logging ✅
- [ ] Cache limpo e servidor reiniciado
- [ ] Logout/Login realizado
- [ ] Teste de diagnóstico executado
- [ ] Logs do console verificados
- [ ] Teste manual no console executado

## Resultado Esperado

Após aplicar todas as correções e aguardar 1-2 minutos:

```
[OmnichannelInbox] Leads channel status: SUBSCRIBED ✅
[OmnichannelInbox] Messages channel status: SUBSCRIBED ✅
```

E as mensagens devem aparecer em tempo real quando novos dados forem inseridos.
