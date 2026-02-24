# Realtime Debug - Próximos Passos

## Problema Atual
Mesmo após corrigir:
- ✅ Replica Identity (FULL em todas as tabelas)
- ✅ Singleton Supabase client
- ✅ Canais com nomes estáveis
- ✅ RLS policies corretas
- ✅ Tabelas publicadas no supabase_realtime

O erro "mismatch between server and client bindings" ainda persiste.

## Possíveis Causas Restantes

### 1. React Strict Mode (Mais Provável)
Em desenvolvimento, React Strict Mode monta componentes duas vezes, o que pode causar:
- Duas subscrições simultâneas ao mesmo canal
- Conflito de bindings entre as duas instâncias

**Teste**: Desabilitar Strict Mode temporariamente

### 2. Problema com Supabase Realtime Server
O servidor Realtime pode estar em um estado inconsistente após as mudanças de replica identity.

**Solução**: Reiniciar o projeto Supabase (pause + restore)

### 3. Cache do Browser
O browser pode estar usando uma conexão WebSocket antiga em cache.

**Solução**: Hard refresh (Cmd+Shift+R) ou limpar cache

### 4. Múltiplos Tabs/Windows
Se houver múltiplas abas abertas com a mesma página, podem estar competindo pelos mesmos canais.

**Solução**: Fechar todas as abas e abrir apenas uma

## Ações Recomendadas (em ordem)

### Ação 1: Hard Refresh do Browser
```bash
# No browser:
# 1. Abrir DevTools (F12)
# 2. Clicar com botão direito no botão de refresh
# 3. Selecionar "Empty Cache and Hard Reload"
# OU
# Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows/Linux)
```

### Ação 2: Verificar React Strict Mode
Verificar se `next.config.js` tem `reactStrictMode: true` e desabilitar temporariamente para teste.

### Ação 3: Testar com Diagnostics
Usar o botão "🔧 Test Connection" na interface para ver exatamente onde a conexão falha.

### Ação 4: Reiniciar Projeto Supabase
Se nada funcionar, pode ser necessário pausar e restaurar o projeto Supabase para reiniciar o servidor Realtime.

## Informações de Debug

### Verificar no Console do Browser
```javascript
// Abrir console e executar:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Verificar quantos canais estão ativos:
// (Isso só funciona se você tiver acesso ao objeto supabase)
```

### Logs Esperados (Sucesso)
```
[OmnichannelInbox] Setting up Realtime subscriptions for empresa: xxx
[OmnichannelInbox] Channel IDs: { channelLeadsId: 'omnichannel-leads-xxx', channelMsgsId: 'omnichannel-messages-xxx' }
[OmnichannelInbox] Leads channel status: SUBSCRIBED
[OmnichannelInbox] ✅ Leads channel subscribed successfully
[OmnichannelInbox] Messages channel status: SUBSCRIBED
[OmnichannelInbox] ✅ Messages channel subscribed successfully
```

### Logs Atuais (Erro)
```
mismatch between server and client bindings for postgres changes
[OmnichannelInbox] ❌ Failed to subscribe to leads channel
[OmnichannelInbox] ❌ Failed to subscribe to messages channel
```

## Próximo Teste Sugerido

Vou criar uma versão simplificada do componente que testa apenas a conexão básica, sem filtros complexos, para isolar o problema.
