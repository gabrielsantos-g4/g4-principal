# Solução Final para Erro de Realtime WebSocket

## Status Atual
O projeto Supabase está sendo pausado e restaurado para reiniciar o servidor Realtime. Isso pode levar alguns minutos.

## O Que Foi Feito

### 1. Correção de Replica Identity ✅
Todas as tabelas agora têm `REPLICA IDENTITY FULL`:
- `main_crm`
- `camp_mensagens`
- `camp_conversas`

### 2. Recriação da Publicação Realtime ✅
As tabelas foram removidas e re-adicionadas à publicação `supabase_realtime` para forçar o refresh dos bindings.

### 3. Pausa e Restauração do Projeto ⏳
O projeto Supabase está sendo reiniciado para limpar qualquer estado inconsistente no servidor Realtime.

## Próximos Passos

### Passo 1: Aguardar Restauração do Projeto
O projeto Supabase está pausando. Aguarde 2-3 minutos e então:

1. Acesse: https://app.supabase.com/project/eookwjdxufyrokrajdfu
2. Verifique se o status mudou para "PAUSED"
3. Clique em "Restore" para restaurar o projeto
4. Aguarde até o status ficar "ACTIVE" (pode levar 1-2 minutos)

### Passo 2: Limpar Cache do Browser
Após o projeto estar ativo:

1. Feche TODAS as abas do navegador com `localhost:3000`
2. Abra o DevTools (F12)
3. Clique com botão direito no botão de refresh
4. Selecione "Empty Cache and Hard Reload"
5. OU use: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows/Linux)

### Passo 3: Testar a Conexão
1. Acesse: http://localhost:3000/dashboard/customer-support?tab=omnichannel
2. Abra o Console do navegador (F12 → Console)
3. Procure por mensagens:
   - ✅ `[OmnichannelInbox] ✅ Leads channel subscribed successfully`
   - ✅ `[OmnichannelInbox] ✅ Messages channel subscribed successfully`

### Passo 4: Usar Diagnóstico (Se Necessário)
Se ainda houver erros:
1. Clique no botão "🔧 Test Connection" no canto superior direito
2. Veja qual etapa está falhando
3. Compartilhe os resultados

## Solução Alternativa Temporária

Se o problema persistir após todos os passos acima, podemos:

### Opção A: Desabilitar React Strict Mode
Adicionar ao `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: false, // Adicionar esta linha
  output: 'standalone',
  // ... resto da config
};
```

### Opção B: Usar Polling Temporariamente
Enquanto investigamos, podemos usar polling como fallback:
- Atualiza a cada 5 segundos
- Menos eficiente, mas funcional
- Pode ser ativado se necessário

## Informações Técnicas

### Por Que o Erro Ocorria?
O erro "mismatch between server and client bindings for postgres changes" ocorre quando:
1. O servidor Realtime espera certos bindings (colunas/tipos)
2. O cliente envia bindings diferentes
3. Isso pode acontecer quando:
   - Replica identity está incorreta (DEFAULT vs FULL)
   - Há cache no servidor Realtime
   - Múltiplas instâncias do cliente Supabase
   - Publicação não foi atualizada corretamente

### O Que Foi Corrigido?
1. ✅ Replica Identity: DEFAULT → FULL
2. ✅ Publicação: Removida e recriada
3. ✅ Servidor: Pausado e restaurado (em progresso)
4. ✅ Cliente: Singleton pattern já implementado
5. ✅ Canais: Nomes estáveis sem timestamps

## Comandos Úteis para Debug

### Verificar Status do Projeto
```bash
# Via MCP (se disponível)
mcp_supabase_get_project --project_id eookwjdxufyrokrajdfu
```

### Verificar Replica Identity
```sql
SELECT 
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'DEFAULT'
        WHEN 'f' THEN 'FULL'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('main_crm', 'camp_mensagens', 'camp_conversas');
```

### Verificar Publicação
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('main_crm', 'camp_mensagens', 'camp_conversas');
```

## Contato de Suporte
Se após 30 minutos o projeto ainda estiver pausando:
- Abra um ticket: https://app.supabase.com/support/new
- Mencione: "Project stuck in PAUSING state"
- Project ID: eookwjdxufyrokrajdfu
