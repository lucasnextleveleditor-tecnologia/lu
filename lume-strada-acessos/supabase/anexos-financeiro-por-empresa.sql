-- ============================================================================
-- Anexos do financeiro isolados por empresa + índices de company_id
-- ============================================================================
--
-- APLICADO EM PRODUÇÃO em 09/09/2026, num checkup geral de isolamento.
--
-- O QUE ESTAVA ERRADO
-- `fin_transacao_anexos` (comprovantes e notas anexados a lançamentos) era a
-- ÚNICA tabela do sistema cuja política não checava a empresa:
--
--   fin_transacao_anexos_admin  ALL  {public}  USING (is_staff())
--
-- `is_staff()` só responde "é admin ou funcionário?" — não sabe de QUAL
-- empresa. Na prática, um funcionário de qualquer agência conseguia listar,
-- abrir, alterar e apagar os anexos financeiros de TODAS as outras. A tabela
-- não tem `company_id` próprio (é filha de `fin_transacoes`), e passou batido
-- quando a `multitenant-migration.sql` reescreveu as políticas.
--
-- Todas as outras filhas sem `company_id` próprio — `orc_itens`,
-- `contratos_itens`, `orc_itens_entrega`, `orc_colunas_investimento`,
-- `orc_orcamento_portfolio`, `orc_tipos_orcamento_itens` — já usavam o padrão
-- de resolver a empresa pela tabela-mãe. Esta passa a usar o mesmo.
--
-- ATENÇÃO, o que isto NÃO resolve: os BUCKETS do Storage (`financeiro`,
-- `producao`) continuam protegidos só por `is_staff()`, sem `company_id` no
-- caminho do arquivo. Ou seja: a LINHA do anexo agora está isolada, mas o
-- ARQUIVO em si ainda é alcançável por quem souber o caminho. Fechar isso
-- exige mudar como os caminhos de upload são gerados no código — mesma
-- pendência anotada na Seção 10 da migração multi-tenant.
-- ============================================================================

begin;

drop policy if exists fin_transacao_anexos_admin on public.fin_transacao_anexos;

create policy fin_transacao_anexos_staff_all
  on public.fin_transacao_anexos
  for all
  to authenticated
  using (
    public.is_staff() and exists (
      select 1 from public.fin_transacoes t
       where t.id = fin_transacao_anexos.transacao_id
         and t.company_id = public.current_company_id()))
  with check (
    public.is_staff() and exists (
      select 1 from public.fin_transacoes t
       where t.id = fin_transacao_anexos.transacao_id
         and t.company_id = public.current_company_id()));

-- ----------------------------------------------------------------------------
-- Índices de company_id que faltavam
-- ----------------------------------------------------------------------------
-- O RLS filtra por `company_id` em TODA consulta a estas tabelas, então sem
-- índice o Postgres varre a tabela inteira a cada leitura. Hoje elas estão
-- vazias ou quase — o custo aparece quando crescerem, e aí já é tarde.
create index if not exists departamentos_company_idx on public.departamentos (company_id);
create index if not exists cargos_company_idx on public.cargos (company_id);
create index if not exists criativos_company_idx on public.criativos (company_id);
create index if not exists anuncio_order_bump_vendas_company_idx on public.anuncio_order_bump_vendas (company_id);

commit;
