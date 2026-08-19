-- ============================================================================
-- Lume Strada Filmes — Dashboard Geral & Calendário (Captações/Entregas)
-- ============================================================================
-- Rode DEPOIS de `producao.sql` (precisa da tabela `prod_tarefas` já
-- existir). Idempotente — seguro rodar de novo.
--
-- Este módulo NÃO cria tabela nova: o Dashboard Geral e o Calendário são só
-- CONSULTAS DE LEITURA sobre o que já existe em Produção (`prod_tarefas`) e
-- Comercial (`crm_leads`) — mesmo padrão de "view calculada em memória" já
-- usado no resto do app, agora atravessando dois módulos de propósito (é o
-- próprio objetivo do Dashboard: juntar visão de tudo num lugar só).
--
-- A única mudança de schema é uma coluna nova em `prod_tarefas`:
-- `data_captacao` — o dia da gravação/filmagem, separado da `data_entrega`
-- que já existia (dia de entrega pro cliente). Uma tarefa pode ter as duas
-- datas, só uma, ou nenhuma.
-- ============================================================================

alter table public.prod_tarefas add column if not exists data_captacao date;

create index if not exists prod_tarefas_data_captacao_idx on public.prod_tarefas (data_captacao);
