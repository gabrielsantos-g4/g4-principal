# Explicação dos Filtros do CRM

## Status Atual

Os filtros do CRM **JÁ FUNCIONAM DE FORMA CUMULATIVA (AND)**.

### Como Funciona

Quando você aplica múltiplos filtros, o sistema:

1. Começa com todos os leads
2. Aplica CADA filtro sequencialmente
3. Se um lead não passar em QUALQUER filtro, ele é removido da lista
4. Apenas leads que passam em TODOS os filtros são mostrados

### Exemplo Prático

Se você selecionar:
- **Produto**: "Campanha X"
- **Status**: "Pending"
- **Responsible**: "João"

O sistema mostrará APENAS leads que:
- ✅ Têm o produto "Campanha X" AND
- ✅ Têm status "Pending" AND  
- ✅ Têm responsável "João"

### Filtros Disponíveis

1. **Tab** (Active/Won/Lost) - Filtro base
2. **Search** (Name, Company, Phone) - Busca textual
3. **Products** - Múltipla seleção (OR entre produtos, AND com outros filtros)
4. **Status** - Seleção única
5. **Source** - Seleção única
6. **Responsible** - Seleção única
7. **Custom Field** - Seleção única
8. **Date Range** (Contact Date) - Intervalo de datas
9. **Created At Range** - Intervalo de datas de criação
10. **Contact Filter** (Overdue/Today/Tomorrow) - Filtro rápido de datas
11. **Qualification** (MQL/SQL/NQ) - Filtro de qualificação

### Lógica de Produtos

O filtro de **Products** funciona assim:
- Se você selecionar MÚLTIPLOS produtos (ex: "Produto A" e "Produto B")
- O sistema mostra leads que têm "Produto A" OR "Produto B"
- Isso porque um lead pode ter múltiplos produtos associados
- Mas esse filtro ainda é AND com os outros filtros

### Código Relevante

```typescript
// Cada filtro é aplicado sequencialmente
if (filters.searchName && !lead.name.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
if (filters.status && lead.status !== filters.status) return false;
if (filters.source && lead.source !== filters.source) return false;
if (filters.responsible && lead.responsible !== filters.responsible) return false;
// ... etc
```

## Verificação Necessária

Se os filtros não estão funcionando como esperado, pode ser:

1. **Dados inconsistentes** - Verificar se os valores no banco correspondem aos valores nos filtros
2. **Case sensitivity** - Alguns filtros são case-sensitive
3. **Valores vazios** - Leads com campos vazios podem não aparecer em certos filtros

## Próximos Passos

Para diagnosticar o problema específico, precisamos:
1. Identificar qual combinação de filtros não está funcionando
2. Verificar os dados dos leads que deveriam aparecer
3. Comparar com os valores dos filtros aplicados
