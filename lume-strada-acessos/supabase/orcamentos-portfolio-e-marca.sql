-- Fase 1 do sistema guiado de Orçamentos/Contratos: Portfólio de trabalhos +
-- marca própria da agência (logo/banner/rodapé) pra estampar em
-- orçamentos/contratos. As duas coisas ficam juntas neste arquivo porque
-- compartilham o mesmo bucket de Storage ("orcamentos-midia") e o mesmo
-- grupo de permissão (`requireModulo("orcamentos")` pro portfólio;
-- `requireAdmin()` pra marca, ver comentário mais abaixo).

-- ----------------------------------------------------------------------------
-- 1) Marca da agência para Orçamentos — POR EMPRESA. Diferente de
-- `branding_config` (singleton global — é a identidade do PRÓPRIO SaaS: tela
-- de login, sidebar do painel), isto aqui é a identidade da AGÊNCIA CLIENTE
-- que usa o sistema, estampada nos orçamentos/contratos que ELA manda pros
-- próprios clientes. Mesmo precedente de `companies.nome_app`
-- (`supabase/companies-nome-app.sql`): coluna direta em `companies`, escrita
-- via Service Role (`requireAdmin()` + `.eq("id", companyId)`), nunca por
-- RLS de UPDATE (que em `companies` é só pra super_admin — ver
-- `multitenant-migration.sql`). Guarda só o PATH no bucket (não a URL
-- pública), mesmo padrão de `orc_portfolio_itens.path` abaixo.
alter table public.companies
  add column if not exists orc_logo_path text,
  add column if not exists orc_banner_path text,
  add column if not exists orc_rodape_path text;

comment on column public.companies.orc_logo_path is 'Path no bucket orcamentos-midia do logo da agência, estampado no topo de orçamentos/contratos gerados. Null = sem logo próprio configurado ainda.';
comment on column public.companies.orc_banner_path is 'Path do banner de topo (imagem larga) exibido na capa do orçamento/contrato. Opcional.';
comment on column public.companies.orc_rodape_path is 'Path da imagem de rodapé (assinatura/selo/contato) exibida no fim de cada orçamento/contrato impresso. Opcional.';

-- ----------------------------------------------------------------------------
-- 2) Portfólio — biblioteca de trabalhos (imagem/vídeo) da agência,
-- cadastrada uma vez e reaproveitada em vários orçamentos ("Nossos
-- Trabalhos"). Mesma forma de `orc_categorias`/`orc_servicos`: company_id +
-- RLS `is_staff()`, sem policy pra `anon` (a exibição pública, quando
-- existir, passa por Service Role + token, igual `orcamentos`/`orc_itens`).
create table if not exists public.orc_portfolio_itens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  titulo text not null,
  tipo_midia text not null check (tipo_midia in ('imagem', 'video')),
  path text not null,
  -- Tag livre (não FK) pro tipo de profissão/serviço do exemplo — filtra a
  -- seleção de portfólio na hora de montar um orçamento de um tipo
  -- específico (Filmmaker, Social Media, Design...). Null = serve pra
  -- qualquer tipo.
  categoria_profissao text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orc_portfolio_itens_company_id_idx on public.orc_portfolio_itens(company_id);

alter table public.orc_portfolio_itens enable row level security;

drop policy if exists orc_portfolio_itens_staff_all on public.orc_portfolio_itens;
create policy orc_portfolio_itens_staff_all on public.orc_portfolio_itens
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists set_updated_at on public.orc_portfolio_itens;
create trigger set_updated_at before update on public.orc_portfolio_itens
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3) Vínculo N:N entre um orçamento e os itens de portfólio selecionados pra
-- aparecer nele — seleção por referência, nunca cópia: se o item sumir da
-- biblioteca, some do orçamento também (ON DELETE CASCADE), que é o
-- comportamento certo (nunca mostrar pro cliente uma mídia já apagada).
-- Preparado desde já pra quando a seleção de portfólio por orçamento for
-- ligada na tela do construtor (fase seguinte) — a tabela não depende disso
-- pra existir.
create table if not exists public.orc_orcamento_portfolio (
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  portfolio_item_id uuid not null references public.orc_portfolio_itens(id) on delete cascade,
  ordem integer not null default 0,
  primary key (orcamento_id, portfolio_item_id)
);

alter table public.orc_orcamento_portfolio enable row level security;

drop policy if exists orc_orcamento_portfolio_staff_all on public.orc_orcamento_portfolio;
create policy orc_orcamento_portfolio_staff_all on public.orc_orcamento_portfolio
  for all
  using (is_staff() and exists (select 1 from public.orcamentos o where o.id = orcamento_id and o.company_id = current_company_id()))
  with check (is_staff() and exists (select 1 from public.orcamentos o where o.id = orcamento_id and o.company_id = current_company_id()));

-- ----------------------------------------------------------------------------
-- 4) Bucket de Storage "orcamentos-midia" — logo/banner/rodapé da agência +
-- itens de portfólio (imagem/vídeo), tudo público (mesmo motivo de
-- "infoprodutos": o link entra direto num orçamento/contrato/PDF exibido
-- pro cliente final, sem passar por signed URL toda vez). 80MB de limite,
-- mesmo teto de "infoprodutos", pra caber vídeo de portfólio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'orcamentos-midia',
  'orcamentos-midia',
  true,
  83886080,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 83886080,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

drop policy if exists "orcamentos_midia_bucket_public_select" on storage.objects;
create policy "orcamentos_midia_bucket_public_select" on storage.objects
  for select to public
  using (bucket_id = 'orcamentos-midia');

drop policy if exists "orcamentos_midia_bucket_staff_insert" on storage.objects;
create policy "orcamentos_midia_bucket_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'orcamentos-midia' and public.is_staff());

drop policy if exists "orcamentos_midia_bucket_staff_update" on storage.objects;
create policy "orcamentos_midia_bucket_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'orcamentos-midia' and public.is_staff());

drop policy if exists "orcamentos_midia_bucket_staff_delete" on storage.objects;
create policy "orcamentos_midia_bucket_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'orcamentos-midia' and public.is_staff());
