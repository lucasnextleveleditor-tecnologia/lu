-- ============================================================================
-- Agência Hub — Financeiro: Fornecedores (cadastro reaproveitável)
-- ============================================================================
-- Rode DEPOIS de `multitenant-migration.sql` (precisa de `public.companies`,
-- `public.current_company_id()` e `public.is_staff()` já existindo — mesmo
-- pré-requisito de `financeiro-categorias-por-empresa.sql`). Idempotente:
-- seguro rodar de novo.
--
-- Pedido do dono da conta: no formulário de "Nova Transação", o campo
-- "Descrição" fazia dois papéis ao mesmo tempo — "onde eu comprei" (Netflix,
-- Adobe, o advogado, o fornecedor de equipamento...) e "o que eu comprei"
-- (detalhe do item). Isso obrigava digitar o mesmo nome de fornecedor toda
-- vez que uma compra recorrente se repetia. Este arquivo separa os dois:
--   - `fin_fornecedores`: cadastro simples (só nome), reaproveitável — o
--     mesmo espírito de `fin_categorias`, sem tipo/cor/emoji porque
--     fornecedor não precisa de nenhum dos três.
--   - `fin_transacoes.fornecedor_id`: nova coluna, OPCIONAL (`on delete set
--     null` — apagar um fornecedor nunca apaga o histórico de transações
--     ligado a ele, só desvincula, mesmo comportamento de `categoria_id`).
--   - `descricao` continua existindo e continua `not null` (nenhuma
--     transação already lançada precisa de migração de dado) — vira o campo
--     de detalhe opcional do produto/serviço; quando o usuário deixa em
--     branco, a aplicação (`TransacaoModal`) preenche com o nome do
--     fornecedor escolhido antes de salvar, então nada no resto do app que
--     já lê `descricao` (busca, CSV, listagem) precisa mudar.
-- ============================================================================

create table if not exists public.fin_fornecedores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  nome text not null,
  created_at timestamptz not null default now(),
  constraint fin_fornecedores_company_nome_key unique (company_id, nome)
);

create index if not exists fin_fornecedores_company_idx on public.fin_fornecedores (company_id);

alter table public.fin_transacoes add column if not exists fornecedor_id uuid references public.fin_fornecedores(id) on delete set null;
create index if not exists fin_transacoes_fornecedor_idx on public.fin_transacoes (fornecedor_id);

alter table public.fin_fornecedores enable row level security;

drop policy if exists fin_fornecedores_admin on public.fin_fornecedores;
create policy fin_fornecedores_admin on public.fin_fornecedores for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());
