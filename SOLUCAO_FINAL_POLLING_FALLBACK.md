# Solução Final - Polling Fallback para Realtime

## Problema Identificado

O erro "mismatch between server and client bindings for postgres changes" é um **bug do servidor Realtime do Supabase**. O servidor está chamando a função `realtime.list_changes` com tipos de argumentos incorretos (`unknown` em vez de `name`, `integer`).

Este não é um problema que pode ser resolvido no código do cliente.

## Solução Implementada

Implementamos um **fallback automático para polling** que funciona de forma transparente:

### Como Funciona

1. **Tentativa de Conexão Realtime**: O sistema tenta conectar via Realtime primeiro
2. **Detecção de Falha**: Se o status for `CHANNEL_ERROR`, ativa automaticamente o polling
3. **Polling Automático**: Atualiza os dados a cada 5 segundos
4. **Interface Limpa**: Sem indicadores visuais para o usuário final

### Arquivos Modificados

- `src/components/support/omnichannel/omnichannel-inbox.tsx`
  - Adicionado estado `usePolling`
  - Implementado `useEffect` para polling com intervalo de 5 segundos
  - Removidos indicadores visuais (badges e botões de teste)
  - Adicionados tipos TypeScript explícitos nos callbacks

- `src/components/support/channels-config.tsx`
  - Corrigidos tipos TypeScript nos callbacks do Realtime

- `src/components/support/omnichannel/test-realtime-simple.tsx`
  - Corrigidos tipos TypeScript nos callbacks do Realtime

### Código Principal

```typescript
// Estado para controlar polling
const [usePolling, setUsePolling] = useState(false);
const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

// Tentativa de Realtime com fallback
channelsRef.current.leads = supabase
    .channel(channelLeadsId)
    .on('postgres_changes', {...}, (payload: any) => {...})
    .subscribe((status: string, err?: Error) => {
        if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connected successfully');
            setUsePolling(false);
        }
        if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Realtime failed, enabling polling fallback');
            setUsePolling(true);
        }
    });

// Polling fallback
useEffect(() => {
    if (!usePolling || !targetUserId) return;

    pollingIntervalRef.current = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
    }, 5000); // Poll every 5 seconds

    return () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };
}, [usePolling, targetUserId]);
```

## Build e Deploy

### Versão
- **Anterior**: 0.1.27
- **Nova**: 0.1.28

### Comando de Build
```bash
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.startg4.com \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://eookwjdxufyrokrajdfu.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=... \
  --build-arg SUPABASE_ANON_KEY=... \
  --build-arg R2_ACCOUNT_ID=... \
  --build-arg NEXT_PUBLIC_R2_PUBLIC_DOMAIN=s3.startg4.com \
  --build-arg R2_BUCKET_NAME=startg4 \
  --build-arg R2_ACCESS_KEY_ID=... \
  --build-arg R2_SECRET_ACCESS_KEY=... \
  -t gabrielsantosg4/g4-principal:0.1.28 \
  --load \
  .
```

### Push para Docker Hub
```bash
docker push gabrielsantosg4/g4-principal:0.1.28
```

### Arquivos Atualizados
- `package.json`: versão 0.1.28
- `docker-compose.yml`: imagem gabrielsantosg4/g4-principal:0.1.28

## Resultados

✅ Build concluído com sucesso (sem erros TypeScript)
✅ Imagem Docker criada para linux/amd64
✅ Push para Docker Hub realizado
✅ Fallback automático para polling funcionando
✅ Interface limpa sem indicadores visuais
✅ Dados atualizados automaticamente a cada 5 segundos

## Comportamento Esperado

### Em Produção
1. Sistema tenta conectar via Realtime
2. Se falhar (devido ao bug do Supabase), ativa polling automaticamente
3. Usuário não percebe diferença na interface
4. Dados são atualizados a cada 5 segundos
5. Sem erros no console do navegador

### Logs no Console (Desenvolvimento)
```
[OmnichannelInbox] 🔄 Attempting Realtime connection for empresa: ...
[OmnichannelInbox] ⚠️ Realtime failed, enabling polling fallback
[OmnichannelInbox] 🔄 Polling mode enabled (refreshing every 5 seconds)
[OmnichannelInbox] 📊 Polling: Refreshing data...
```

## Próximos Passos (Opcional)

Se o Supabase corrigir o bug do servidor Realtime no futuro:
1. O sistema automaticamente voltará a usar Realtime
2. O polling será desativado automaticamente
3. Nenhuma mudança de código será necessária

## Notas Importantes

- Este é um **workaround temporário** para um bug do servidor Supabase
- O polling consome mais recursos que Realtime, mas é aceitável para a escala atual
- A solução é **transparente** para o usuário final
- O código está preparado para voltar a usar Realtime quando o bug for corrigido

## Data da Implementação
22 de Fevereiro de 2026
