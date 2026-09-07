-- ============================================================================
-- Agência Hub — Financeiro: Recorrência (lançamentos que se repetem)
-- ============================================================================
-- Rode DEPOIS de `financeiro-parcelamento-moeda.sql`. Idempotente — seguro
-- rodar de novo.
--
-- `fin_transacoes.recorrente` / `recorrencia_intervalo` já existiam
-- (`financeiro.sql`), mas até aqui eram só um RÓTULO — marcar uma transação
-- como "mensal" não gerava nada além dela mesma. Esta migração acrescenta a
-- coluna que faltava pra isso funcionar de verdade:
--
-- `recorrencia_grupo_id` — mesmo padrão do `parcela_grupo_id` do
-- parcelamento: quando o admin marca "Transação recorrente" ao lançar uma
-- transação nova, o sistema já insere de uma vez ESTA + as ocorrências
-- futuras (ver `criarTransacao` em `src/app/admin/financeiro/actions.ts`),
-- todas com o MESMO `recorrencia_grupo_id`. Isso é o que permite, na hora de
-- excluir, oferecer "só esta / esta e as futuras / esta, as futuras e as
-- anteriores" (`removerTransacaoComEscopo`) — sem essa coluna não dá pra
-- saber quais linhas pertencem à mesma série.
--
-- Uma transação avulsa (não recorrente) tem `recorrencia_grupo_id = null`,
-- igual ao parcelamento.
-- ============================================================================

alter table public.fin_transacoes
  add column if not exists recorrencia_grupo_id uuid;

create index if not exists fin_transacoes_recorrencia_grupo_idx
  on public.fin_transacoes (recorrencia_grupo_id) where recorrencia_grupo_id is not null;
