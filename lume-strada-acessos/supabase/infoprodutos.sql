-- ============================================================================
-- Lume Strada Filmes — Tráfego & Metas: aba Info-Produtos e Metas Líquidas
-- ============================================================================
-- Nova ABA dentro do módulo "Tráfego & Metas" já existente (mesmo item de
-- menu, mesma permissão `requireModulo("trafego")`) — NÃO mexe em nada do
-- fluxo por-cliente já em produção (`metas_diarias`/`trafego_registros`, ver
-- schema.sql). É um controle PARALELO: tracking de anúncios pagos pra
-- vender os PRÓPRIOS produtos digitais da agência (infoprodutos/packs),
-- com regra de garantia de 7 dias antes de "fechar" o lucro líquido.
--
-- Rode depois de `schema.sql` (precisa de `is_staff()`/`set_updated_at()`).
-- Idempotente — seguro rodar de novo. Escopo: sem multi-tenant
-- (`company_id`) — mesma decisão de sempre (ferramenta interna).
--
-- SIMPLIFICAÇÃO DELIBERADA #1: o requisito original pedia tabelas separadas
-- `produtos` e `order_bumps`, mas o cadastro descrito é UM formulário só,
-- com um campo "Tipo" (Produto Principal ou Order Bump) — duas tabelas com
-- as mesmas colunas seriam só redundância. Uma tabela `produtos` com
-- `tipo` faz o mesmo trabalho (filtra por tipo pra listar cada grupo
-- separado) sem duplicar schema.
--
-- SIMPLIFICAÇÃO DELIBERADA #2: cada card de anúncio referencia UM produto
-- principal + UM order bump (o funil típico — oferta principal e um bump
-- na mesma página de checkout). Se um dia você rodar vários order bumps
-- diferentes na mesma oferta, dá pra evoluir isso depois; por ora é o
-- suficiente pro fluxo descrito.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUTOS — cadastro de produto principal / order bump.
-- ----------------------------------------------------------------------------
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('principal', 'order_bump')),
  valor numeric(12, 2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists produtos_set_updated_at on public.produtos;
create trigger produtos_set_updated_at
  before update on public.produtos
  for each row execute function public.set_updated_at();

alter table public.produtos enable row level security;
drop policy if exists "produtos_staff_all" on public.produtos;
create policy "produtos_staff_all" on public.produtos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- 2. ANUNCIOS_TRACKING — um card por anúncio/criativo rodando em um dia. Um
-- dia pode ter vários (vários criativos testados em paralelo).
-- ----------------------------------------------------------------------------
create table if not exists public.anuncios_tracking (
  id uuid primary key default gen_random_uuid(),

  data date not null,
  semana_inicio date not null, -- segunda-feira da semana daquele `data` — denormalizado pra agrupar/fechar rápido sem calcular toda hora

  nome_anuncio text,
  criativo_path text, -- caminho no bucket "infoprodutos" — null se ainda não subiu nada
  criativo_tipo text check (criativo_tipo in ('imagem', 'video')),

  produto_principal_id uuid references public.produtos(id) on delete set null,
  order_bump_id uuid references public.produtos(id) on delete set null,

  investimento numeric(12, 2) not null default 0,
  visualizacoes integer not null default 0,
  cliques integer not null default 0,
  vendas_principal integer not null default 0,
  vendas_order_bump integer not null default 0,

  -- Receita Bruta: calculada no momento de salvar (vendas × valor do
  -- produto naquele instante) mas SEMPRE editável depois — a plataforma de
  -- vendas (Hotmart/Kiwify) pode mostrar um valor líquido de taxas
  -- diferente do cálculo simples, e o requisito pede override manual.
  receita_bruta numeric(12, 2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anuncios_tracking_data_idx on public.anuncios_tracking (data desc);
create index if not exists anuncios_tracking_semana_idx on public.anuncios_tracking (semana_inicio);

drop trigger if exists anuncios_tracking_set_updated_at on public.anuncios_tracking;
create trigger anuncios_tracking_set_updated_at
  before update on public.anuncios_tracking
  for each row execute function public.set_updated_at();

alter table public.anuncios_tracking enable row level security;
drop policy if exists "anuncios_tracking_staff_all" on public.anuncios_tracking;
create policy "anuncios_tracking_staff_all" on public.anuncios_tracking
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- 3. METAS_CALENDARIO — meta de LUCRO LÍQUIDO (não faturamento) por dia,
-- setada no calendário interativo.
-- ----------------------------------------------------------------------------
create table if not exists public.metas_calendario (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  meta_lucro numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists metas_calendario_set_updated_at on public.metas_calendario;
create trigger metas_calendario_set_updated_at
  before update on public.metas_calendario
  for each row execute function public.set_updated_at();

alter table public.metas_calendario enable row level security;
drop policy if exists "metas_calendario_staff_all" on public.metas_calendario;
create policy "metas_calendario_staff_all" on public.metas_calendario
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- 4. FECHAMENTOS_SEMANAIS — o "Fechamento da Semana": registra
-- reembolsos/chargebacks e trava o lucro líquido REAL daquele período.
-- Enquanto não existe uma linha aqui pra uma `semana_inicio`, o período
-- aparece "Em Período de Garantia" (ou "Pronta pra Fechar" depois de 7
-- dias) — o status nunca é uma coluna, é sempre CALCULADO na aplicação
-- (mesmo padrão de `calcularStatus`/StatusAcesso em lib/utils/status.ts).
-- Fechar de novo (upsert por `semana_inicio`) é permitido, pra corrigir um
-- valor de reembolso lançado errado sem precisar mexer direto no banco.
-- ----------------------------------------------------------------------------
create table if not exists public.fechamentos_semanais (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null unique,
  semana_fim date not null,

  receita_bruta_total numeric(12, 2) not null,
  investimento_total numeric(12, 2) not null,
  reembolsos numeric(12, 2) not null default 0,
  lucro_liquido_real numeric(12, 2) not null, -- (receita_bruta_total - investimento_total) - reembolsos, travado no momento do fechamento

  fechado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.fechamentos_semanais enable row level security;
drop policy if exists "fechamentos_semanais_staff_all" on public.fechamentos_semanais;
create policy "fechamentos_semanais_staff_all" on public.fechamentos_semanais
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- 5. Storage — bucket "infoprodutos" pros criativos (imagem/MP4). PÚBLICO
-- (diferente do bucket "producao", que é privado com signed URL) porque
-- criativo de anúncio é material de marketing, não documento sensível de
-- cliente — sem essa simplificação, cada card do grid geraria uma signed
-- URL nova a cada render, sem ganho real de segurança.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('infoprodutos', 'infoprodutos', true)
on conflict (id) do update set public = true;

drop policy if exists "infoprodutos_bucket_public_select" on storage.objects;
create policy "infoprodutos_bucket_public_select" on storage.objects
  for select to public
  using (bucket_id = 'infoprodutos');

drop policy if exists "infoprodutos_bucket_staff_insert" on storage.objects;
create policy "infoprodutos_bucket_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'infoprodutos' and public.is_staff());

drop policy if exists "infoprodutos_bucket_staff_update" on storage.objects;
create policy "infoprodutos_bucket_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'infoprodutos' and public.is_staff())
  with check (bucket_id = 'infoprodutos' and public.is_staff());

drop policy if exists "infoprodutos_bucket_staff_delete" on storage.objects;
create policy "infoprodutos_bucket_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'infoprodutos' and public.is_staff());
