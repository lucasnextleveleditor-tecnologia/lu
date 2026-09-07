-- ============================================================================
-- Info-Produtos — Taxa da Plataforma (percentual + fixa por venda)
-- ============================================================================
-- Pedido do dono da conta: cada venda perde um pedaço pra taxa da
-- plataforma (Hotmart/Kiwify/etc) — parte percentual, parte fixa em R$ (a
-- fixa pode ser R$0,00, não é opcional/nula, é OBRIGATÓRIA-com-zero-permitido,
-- por isso `not null default 0` em vez de nullable). Guardado por LANÇAMENTO
-- (`anuncios_tracking`), não só um valor global, porque o requisito pede
-- "valor padrão que preenche sozinho, mas dá pra sobrescrever" — exatamente
-- o mesmo padrão já usado em `receita_bruta` (calculado, sempre editável).
--
-- Receita Líquida = Receita Bruta - (Receita Bruta × taxa_percentual/100) -
-- (taxa_fixa × total de vendas) — ver `calcularReceitaLiquida` em
-- `lib/utils/infoprodutos.ts`. NUNCA gravada (sempre recalculada), mesmo
-- espírito de `calcularStatusPeriodo`/`calcularReceitaBruta`.
--
-- Idempotente — seguro rodar de novo.
-- ============================================================================

alter table public.anuncios_tracking
  add column if not exists taxa_percentual numeric(5, 2) not null default 0,
  add column if not exists taxa_fixa numeric(12, 2) not null default 0;

-- ----------------------------------------------------------------------------
-- Taxa padrão por cliente (marca/infoproduto) — pré-preenche todo NOVO
-- lançamento de anúncio daquele cliente, mas continua editável campo a campo
-- (ver AnuncioModal). Uma linha por cliente; ausência de linha = padrão 0/0.
-- ----------------------------------------------------------------------------
create table if not exists public.infoprodutos_taxas_padrao (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  cliente_cadastro_id uuid not null references public.clientes(id) on delete cascade,
  taxa_percentual numeric(5, 2) not null default 0,
  taxa_fixa numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, cliente_cadastro_id)
);

drop trigger if exists infoprodutos_taxas_padrao_set_updated_at on public.infoprodutos_taxas_padrao;
create trigger infoprodutos_taxas_padrao_set_updated_at
  before update on public.infoprodutos_taxas_padrao
  for each row execute function public.set_updated_at();

alter table public.infoprodutos_taxas_padrao enable row level security;
drop policy if exists "infoprodutos_taxas_padrao_staff_all" on public.infoprodutos_taxas_padrao;
create policy "infoprodutos_taxas_padrao_staff_all" on public.infoprodutos_taxas_padrao
  for all to authenticated using (public.is_staff() and company_id = current_company_id())
  with check (public.is_staff() and company_id = current_company_id());

-- ----------------------------------------------------------------------------
-- Fechamento semanal passa a travar também a Receita Líquida (além da
-- Bruta, que já existia) — `lucro_liquido_real` passa a ser calculado a
-- partir da líquida a partir de agora. Fechamentos ANTIGOS (antes dessa
-- coluna existir) não tinham taxa nenhuma registrada, então o valor mais
-- correto pra eles é assumir líquida = bruta (taxa 0) — só backfill, nunca
-- recalculado de verdade pra trás.
-- ----------------------------------------------------------------------------
alter table public.fechamentos_semanais
  add column if not exists receita_liquida_total numeric(12, 2) not null default 0;

update public.fechamentos_semanais
set receita_liquida_total = receita_bruta_total
where receita_liquida_total = 0;
