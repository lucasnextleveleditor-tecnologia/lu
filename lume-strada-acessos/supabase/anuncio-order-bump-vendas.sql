-- Vendas de order bump por anúncio, agora em linhas separadas (produto + quantidade),
-- pra suportar vender MAIS DE UM order bump diferente no mesmo lançamento
-- (ex.: 1 unidade do produto X + 2 unidades do produto Y no mesmo dia/anúncio).
-- Substitui o par (order_bump_id, vendas_order_bump) de `anuncios_tracking` como
-- fonte de detalhe — esses dois campos continuam existindo na tabela só como
-- AGREGADO (order_bump_id fica null pros lançamentos novos; vendas_order_bump
-- passa a ser mantido automaticamente pela Server Action = soma das linhas
-- daqui), pra não quebrar nada que já lê o agregado (fecharSemana, Relatórios,
-- Dashboard 7 Dias).
create table if not exists public.anuncio_order_bump_vendas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  anuncio_id uuid not null references public.anuncios_tracking(id) on delete cascade,
  produto_id uuid not null references public.produtos(id),
  quantidade integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists anuncio_order_bump_vendas_anuncio_id_idx
  on public.anuncio_order_bump_vendas(anuncio_id);

alter table public.anuncio_order_bump_vendas enable row level security;

create policy anuncio_order_bump_vendas_staff_all on public.anuncio_order_bump_vendas
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());
