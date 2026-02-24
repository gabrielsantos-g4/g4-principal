# 🔍 Causa Raiz Encontrada - Realtime WebSocket

## Problema Identificado

O erro "mismatch between server and client bindings for postgres changes" é causado por um problema de **incompatibilidade de tipos** na função `realtime.list_changes`.

### Evidência nos Logs do Supabase

```
PoolingReplicationError: %Postgrex.Error{
  postgres: %{
    code: :undefined_function,
    message: "function realtime.list_changes(unknown, unknown, unknown, unknown) does not exist",
    hint: "No function matches the given name and argument types. You might need to add explicit type casts."
  }
}
```

### Função Real no Banco

```sql
realtime.list_changes(
  publication name,
  slot_name name,
  max_changes integer,
  max_record_bytes integer
)
```

## O Que Está Acontecendo

1. O servidor Realtime está tentando chamar `realtime.list_changes`
2. Mas está passando argumentos do tipo `unknown` em vez de `name`, `name`, `integer`, `integer`
3. PostgreSQL não consegue fazer o match da função porque os tipos não correspondem
4. Isso causa o erro de "undefined_function"

## Por Que Isso Acontece

Este é um problema conhecido que ocorre quando:
- Há incompatibilidade entre a versão do servidor Realtime e a extensão do banco
- O servidor Realtime não está fazendo type casting correto dos argumentos
- Pode ser causado por uma atualização incompleta ou corrupção do estado do Realtime

## Soluções Possíveis

### Solução 1: Usar Broadcast em Vez de Postgres Changes (RECOMENDADO)

Em vez de usar `postgres_changes`, podemos usar `broadcast` que não depende dessa função problemática:

```typescript
// Em vez de:
.on('postgres_changes', { ... }, callback)

// Usar:
.on('broadcast', { event: 'db-change' }, callback)
```

Mas isso requer mudanças no backend para enviar broadcasts.

### Solução 2: Criar Wrapper Function com Type Casting

Podemos criar uma função wrapper que faz o type casting correto:

```sql
CREATE OR REPLACE FUNCTION realtime.list_changes_wrapper(
  p_publication text,
  p_slot_name text,
  p_max_changes text,
  p_max_record_bytes text
)
RETURNS SETOF record
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM realtime.list_changes(
    p_publication::name,
    p_slot_name::name,
    p_max_changes::integer,
    p_max_record_bytes::integer
  );
END;
$$;
```

**PROBLEMA**: Isso não resolve porque o servidor Realtime chama a função diretamente, não podemos interceptar.

### Solução 3: Abrir Ticket no Supabase (NECESSÁRIO)

Este é um bug do servidor Realtime do Supabase. Precisamos:
1. Abrir um ticket de suporte: https://app.supabase.com/support/new
2. Mencionar o erro específico: `function realtime.list_changes(unknown, unknown, unknown, unknown) does not exist`
3. Incluir o Project ID: `eookwjdxufyrokrajdfu`
4. Pedir para verificar a versão do servidor Realtime

### Solução 4: Usar Polling Temporariamente (WORKAROUND)

Enquanto o Supabase não corrige, podemos usar polling:

```typescript
// Polling a cada 5 segundos
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchConversations();
    setConversations(data);
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

## Solução Imediata Recomendada

Vou implementar um **fallback automático**: tentar Realtime primeiro, e se falhar, usar polling como backup.

```typescript
const [usePolling, setUsePolling] = useState(false);

useEffect(() => {
  // Tentar Realtime
  const channel = supabase.channel(...)
    .on('postgres_changes', ...)
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime failed, falling back to polling');
        setUsePolling(true);
      }
    });
    
  return () => supabase.removeChannel(channel);
}, []);

// Polling como fallback
useEffect(() => {
  if (!usePolling) return;
  
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, [usePolling]);
```

## Informações para o Suporte Supabase

**Project ID**: eookwjdxufyrokrajdfu  
**Region**: us-east-1  
**Database Version**: PostgreSQL 17.4.1  
**Error**: `function realtime.list_changes(unknown, unknown, unknown, unknown) does not exist`  
**Hint**: No function matches the given name and argument types. You might need to add explicit type casts.

**Logs Relevantes**:
- Erro ocorre repetidamente nos logs do Realtime
- Função `realtime.list_changes` existe no banco com assinatura correta
- Servidor Realtime não está fazendo type casting dos argumentos

**Impacto**:
- Impossível usar `postgres_changes` subscriptions
- Aplicação não recebe atualizações em tempo real
- Usuários precisam recarregar a página manualmente

## Próximos Passos

1. ✅ Implementar fallback automático para polling
2. ⏳ Abrir ticket no Supabase Support
3. ⏳ Aguardar correção do servidor Realtime
4. ⏳ Testar novamente após correção

## Conclusão

O problema NÃO é com:
- ❌ Replica Identity (já corrigido)
- ❌ RLS Policies (já corretas)
- ❌ Publicação Realtime (já configurada)
- ❌ Cliente Supabase (singleton implementado)
- ❌ Cache do Next.js (já limpo)

O problema É com:
- ✅ Servidor Realtime do Supabase fazendo chamadas incorretas à função `realtime.list_changes`
- ✅ Type casting incorreto dos argumentos
- ✅ Bug no servidor Realtime que precisa ser corrigido pelo Supabase

**Solução temporária**: Implementar polling como fallback até o Supabase corrigir o bug.
