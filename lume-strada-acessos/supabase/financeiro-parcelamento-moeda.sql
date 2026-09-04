-- ============================================================================
-- Agência Hub — Financeiro: Parcelamento & Multi-moeda
-- ============================================================================
-- Rode DEPOIS de `financeiro.sql` (e de preferência depois de
-- `correcoes-auditoria.sql` / `financeiro-categorias.sql`, só pra manter a
-- ordem de sempre — não há dependência real entre eles). Idempotente —
-- seguro rodar de novo.
--
-- O QUE MUDA em `fin_transacoes`:
--
-- 1. PARCELAMENTO — `parcela_grupo_id` / `parcela_numero` / `parcela_total`:
--    quando uma compra é lançada parcelada (ver `criarTransacaoParcelada` em
--    `src/app/admin/financeiro/actions.ts`), N linhas são inseridas de uma
--    vez — todas com o MESMO `parcela_grupo_id`, cada uma com seu
--    `parcela_numero` (1..N) e o mesmo `parcela_total`. Cada parcela nasce
--    PENDENTE (não paga), com vencimento mensal a partir da data escolhida —
--    o admin dá baixa em cada uma conforme vence, exatamente como qualquer
--    outra transação avulsa. Uma transação normal (não parcelada) tem os
--    três campos `null`.
--
-- 2. MULTI-MOEDA — `moeda_original` / `valor_original` / `taxa_cambio`: a
--    coluna `valor` CONTINUA sempre em BRL — é o que entra em todas as
--    somas/saldos/relatórios do sistema, sem precisar mudar mais nada além
--    deste arquivo. Esses três campos novos são só o REGISTRO de "em que
--    moeda foi lançado originalmente e com que cotação foi convertido pra
--    real", pra exibir "US$ 1.000,00 (cotação: R$ 5,20)" na tela — nunca
--    participam de cálculo nenhum. `moeda_original = null` significa que a
--    transação já nasceu em BRL (a grande maioria).
-- ============================================================================

alter table public.fin_transacoes
  add column if not exists parcela_grupo_id uuid,
  add column if not exists parcela_numero smallint,
  add column if not exists parcela_total smallint,
  add column if not exists moeda_original text,
  add column if not exists valor_original numeric(12, 2),
  add column if not exists taxa_cambio numeric(12, 6);

alter table public.fin_transacoes drop constraint if exists fin_transacoes_moeda_original_check;
alter table public.fin_transacoes add constraint fin_transacoes_moeda_original_check
  check (moeda_original is null or moeda_original in ('USD', 'EUR'));

create index if not exists fin_transacoes_parcela_grupo_idx
  on public.fin_transacoes (parcela_grupo_id) where parcela_grupo_id is not null;
