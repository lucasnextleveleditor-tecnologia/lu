-- Módulo "Objetivos" — meta de faturamento mensal e anual da empresa,
-- comparada ao que já está lançado em `fin_transacoes` (mesma fonte de
-- verdade usada em Financeiro/Relatórios/Dashboard, ver comentário em
-- `src/app/admin/objetivos/data.ts`). Duas colunas simples na própria
-- `companies` — mesmo padrão já usado pelas colunas `orc_*` de Orçamentos
-- (um valor por empresa, sem histórico por mês/ano necessário aqui; se um
-- dia for preciso guardar a meta de CADA mês separadamente, aí sim vira uma
-- tabela própria — por enquanto a empresa só tem UMA meta mensal vigente e
-- UMA meta anual vigente, editáveis a qualquer momento).
alter table public.companies
  add column if not exists obj_meta_faturamento_mensal numeric,
  add column if not exists obj_meta_faturamento_anual numeric;

comment on column public.companies.obj_meta_faturamento_mensal is 'Meta de faturamento do mês corrente (R$) — módulo Objetivos. Null = meta ainda não configurada.';
comment on column public.companies.obj_meta_faturamento_anual is 'Meta de faturamento do ano corrente (R$) — módulo Objetivos. Null = meta ainda não configurada.';
