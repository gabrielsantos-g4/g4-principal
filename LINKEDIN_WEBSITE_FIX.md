# ✅ Correção dos Campos LinkedIn e Website

## Problema Identificado

Os campos LinkedIn e Website não estavam sendo carregados do banco de dados, sempre mostrando "-" na interface.

## Causa Raiz

A query em `get-conversations.ts` não estava buscando os campos `linkedin` e `website` da tabela `main_crm`.

## Solução Aplicada

### 1. Adicionado campos à query SQL

**Arquivo**: `src/actions/inbox/get-conversations.ts`

Adicionado à query:
```typescript
main_crm!camp_conversas_contact_id_fkey (
    id,
    name,
    phone,
    email,
    company,
    role,
    linkedin,    // ✅ ADICIONADO
    website,     // ✅ ADICIONADO
    status,
    // ... outros campos
)
```

### 2. Adicionado campos ao objeto retornado

```typescript
return {
    id: conv.id,
    leadId: lead.id,
    // ... outros campos
    linkedin: lead.linkedin || "",  // ✅ ADICIONADO
    website: lead.website || "",    // ✅ ADICIONADO
    // ... outros campos
}
```

## Teste

1. Recarregue a página
2. Selecione um lead que tenha LinkedIn ou Website no banco
3. Os valores devem aparecer nos campos correspondentes
4. Você pode editar e salvar normalmente

## Leads com LinkedIn no Banco

Para teste, estes leads já têm LinkedIn cadastrado:
- **Mauro Papareli**: https://www.linkedin.com/in/mauro-paparelli-7b553655/
- **Joe Griffin**: https://www.linkedin.com/in/joe-griffin-0778292/

## Status

✅ **CORRIGIDO** - Os campos LinkedIn e Website agora são carregados do banco de dados e podem ser editados e salvos corretamente.

## Arquivos Modificados

1. `src/actions/inbox/get-conversations.ts`
   - Adicionado `linkedin` e `website` à query SQL
   - Adicionado `linkedin` e `website` ao objeto retornado
