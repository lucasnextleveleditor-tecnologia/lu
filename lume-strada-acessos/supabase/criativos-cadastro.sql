-- Cadastro de Criativos — separado do lançamento diário de performance
-- (`anuncios_tracking`). Cadastra uma vez (nome + orçamento diário
-- planejado), reaproveita em vários lançamentos via `anuncios_tracking.criativo_id`.
-- `orcamento_diario` é só o valor PADRÃO que pré-preenche "Investimento do
-- Dia" num anúncio NOVO — nunca entra em cálculo de lucro/receita, só o
-- `investimento` gravado no lançamento em si (ver `CriativoRow` em
-- `src/lib/types/infoprodutos.ts`).
create table if not exists public.criativos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  cliente_cadastro_id uuid not null references public.clientes(id) on delete cascade,
  nome text not null,
  orcamento_diario numeric not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists criativos_cliente_cadastro_id_idx
  on public.criativos(cliente_cadastro_id);

alter table public.criativos enable row level security;

create policy criativos_staff_all on public.criativos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

-- Vínculo do lançamento diário (`anuncios_tracking`) com o Criativo
-- cadastrado aqui. `nome_anuncio` (texto livre antigo) vira @deprecated —
-- mantido só pra exibir lançamentos feitos antes dessa migração.
alter table public.anuncios_tracking
  add column if not exists criativo_id uuid references public.criativos(id);

create index if not exists anuncios_tracking_criativo_id_idx
  on public.anuncios_tracking(criativo_id);
