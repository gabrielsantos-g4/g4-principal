# Decisão: Desabilitar Realtime no Omnichannel

## Problema
O erro "mismatch between server and client bindings" continua aparecendo de forma intermitente no omnichannel, mesmo após:
- Adicionar timestamps únicos aos canais
- Remover configurações extras
- Pausar e restaurar o projeto Supabase
- Configurar REPLICA IDENTITY FULL

## Causa Raiz
React Strict Mode + múltiplas montagens do componente + Realtime = conflitos intermitentes

## Solução Proposta
Desabilitar temporariamente o Realtime no omnichannel e usar apenas refresh manual até que o Supabase resolva o bug do lado do servidor.

## Alternativa
Manter o código do Realtime mas adicionar um flag para desabilitar em produção se necessário.
