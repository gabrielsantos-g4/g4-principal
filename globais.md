# 📋 INFORMAÇÕES DO PROJETO SUPABASE

## 🎯 **Projeto Principal: maketome-law**

- **ID do Projeto:** `eoezrsmgeawysctrzmeo`
- **Nome:** maketome-law
- **Região:** us-east-1
- **Status:** ACTIVE_HEALTHY
- **Organização:** vercel_icfg_q3QLTt6IXItOUFjz6DBfvlMx
- **Host do Banco:** db.eoezrsmgeawysctrzmeo.supabase.co
- **Versão PostgreSQL:** 17.4.1.049
- **Engine:** 17
- **Canal:** ga (General Availability)
- **Criado em:** 2025-07-07T22:43:27.914305Z

# 📋 INFORMAÇÕES DE DESENVOLVIMENTO
- **TIPO DE COMPILAÇÃO** pnpm
- **OBSERVAÇÃO** usando turbopack não precisa ficar subindo o servidor o tempo todo, a não ser que pare por algum motivo, por erro ou para fazer build de teste
- **REPOSITÓRIO GITHUB** mtmjur

# 🔧 MCPs CONFIGURADOS E DISPONÍVEIS

## 🗄️ **Supabase MCP**
**Servidor Principal:** `supabase-mcp-server`
- **Comando:** `uvx @supabase/mcp-server-supabase@latest`
- **Projeto ID:** `eoezrsmgeawysctrzmeo`
- **URL:** `https://eoezrsmgeawysctrzmeo.supabase.co`
- **Access Token:** `sbp_v0_936a45daca350a311b46b4f861a901416a93bbd6`

### Funcionalidades Auto-Aprovadas:
- `list_projects` - Listar projetos Supabase
- `list_tables` - Listar tabelas do banco
- `execute_sql` - Executar queries SQL
- `get_project` - Obter detalhes do projeto
- `search_docs` - Buscar na documentação Supabase
- `list_migrations` - Listar migrações
- `get_advisors` - Obter recomendações de segurança/performance
- `generate_typescript_types` - Gerar tipos TypeScript
- `get_project_url` - Obter URL da API
- `get_anon_key` - Obter chave anônima

### Capacidades:
- ✅ Gerenciamento completo do banco de dados
- ✅ Execução de queries e migrações
- ✅ Análise de segurança e performance
- ✅ Geração automática de tipos TypeScript
- ✅ Acesso à documentação oficial

## 🌐 **Chrome DevTools MCP**
**Servidor:** `chrome-devtools`
- **Comando:** `npx chrome-devtools-mcp@latest`
- **Porta Debug:** `9222`

### Funcionalidades Auto-Aprovadas:
- `list_tabs` - Listar abas abertas
- `get_page_content` - Obter conteúdo da página
- `screenshot` - Capturar screenshots
- `evaluate_javascript` - Executar JavaScript

### Capacidades Completas:
#### 📋 Navegação e Gerenciamento
- `list_pages` - Listar páginas abertas
- `select_page` - Selecionar página específica
- `new_page` - Criar nova aba
- `close_page` - Fechar página
- `navigate_page` - Navegar para URL
- `navigate_page_history` - Voltar/avançar no histórico

#### 📸 Captura e Visualização
- `take_screenshot` - Screenshots da viewport ou página completa
- `take_snapshot` - Snapshot textual com elementos identificados

#### 🖱️ Interação com Interface
- `click` - Clicar em elementos
- `hover` - Passar mouse sobre elementos
- `fill` - Preencher campos
- `fill_form` - Preencher múltiplos campos
- `drag` - Arrastar elementos
- `upload_file` - Upload de arquivos

#### 🔍 Análise e Debug
- `evaluate_script` - Executar JavaScript
- `wait_for` - Aguardar texto aparecer
- `list_console_messages` - Listar logs do console
- `handle_dialog` - Lidar com alerts/confirms

#### 📱 Emulação e Testes
- `resize_page` - Redimensionar viewport
- `emulate_network` - Simular condições de rede
- `emulate_cpu` - Simular throttling de CPU

#### 🌐 Monitoramento de Rede
- `list_network_requests` - Listar requisições HTTP
- `get_network_request` - Detalhes de requisição específica

#### 📊 Performance
- `performance_start_trace` - Iniciar gravação de performance
- `performance_stop_trace` - Parar e obter métricas
- `performance_analyze_insight` - Analisar insights específicos

### Vantagens para Desenvolvimento:
- ✅ **Debug Visual**: Ver exatamente como a interface se comporta
- ✅ **Testes Automatizados**: Simular interações de usuário
- ✅ **Análise de Performance**: Métricas reais de Core Web Vitals
- ✅ **Responsividade**: Testar em múltiplas resoluções
- ✅ **Network Analysis**: Identificar requests lentos
- ✅ **Validação em Tempo Real**: Verificar se correções funcionam

## 🚀 **Fluxo de Trabalho Integrado**

### Para Desenvolvimento:
1. **Supabase MCP** → Gerenciar banco, executar queries, aplicar migrações
2. **Chrome DevTools MCP** → Testar interface, debug visual, análise de performance
3. **Combinação** → Desenvolvimento full-stack com feedback em tempo real

### Para Debug:
1. **Identificar problema** → Screenshot + análise visual
2. **Investigar causa** → Console logs + network requests
3. **Aplicar correção** → Modificar código
4. **Validar solução** → Testar automaticamente na interface

### Para Testes:
1. **Cenários de uso** → Automação completa de fluxos
2. **Performance** → Métricas reais de carregamento
3. **Responsividade** → Testes em múltiplos dispositivos
4. **Integração** → Validar comunicação frontend-backend

## 💡 **Dicas de Uso**

### Supabase MCP:
- Use `list_tables` para explorar estrutura do banco
- `execute_sql` para queries rápidas e análises
- `get_advisors` para otimizações de segurança/performance
- `generate_typescript_types` após mudanças no schema

### Chrome DevTools MCP:
- `take_screenshot` para documentar bugs/soluções
- `performance_start_trace` para análise de carregamento
- `list_network_requests` para debug de APIs
- `resize_page` para testes de responsividade

### Integração:
- Modificar banco via Supabase MCP → Testar interface via Chrome DevTools
- Debug de performance → Supabase (queries) + Chrome (frontend)
- Validação completa → Dados (Supabase) + Interface (Chrome)
