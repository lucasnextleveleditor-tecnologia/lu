-- ============================================================================
-- Lume Strada Filmes — Aparência: Banner de Destaque
-- ============================================================================
-- Rode DEPOIS de `schema.sql` (precisa de `branding_config` já existir).
-- Idempotente — seguro rodar de novo.
--
-- Adiciona um banner de destaque configurável em `branding_config` (a mesma
-- linha singleton do resto do White-Label — ver seção 7 de `schema.sql`).
-- É UM banner só (mesmo título/descrição/link/imagem/tom), com 3 chaves
-- independentes pra decidir ONDE ele aparece: tela de Login, área
-- Admin/Funcionário (todo `/admin/*`, inclusive o Dashboard) e Portal do
-- Cliente (`/dashboard`). O admin liga cada uma via toggle na tela de
-- Aparência — nenhuma delas precisa estar ligada.
--
-- "Ativo" sozinho não é suficiente pra aparecer: o componente
-- (`src/components/branding/AnnouncementBanner.tsx`) também exige
-- `banner_titulo` preenchido, então ligar o toggle sem preencher nada ainda
-- não mostra um banner vazio pra ninguém.
-- ============================================================================

alter table public.branding_config
  add column if not exists banner_ativo_login boolean not null default false,
  add column if not exists banner_ativo_admin boolean not null default false,
  add column if not exists banner_ativo_cliente boolean not null default false,
  add column if not exists banner_titulo text not null default '',
  add column if not exists banner_descricao text not null default '',
  add column if not exists banner_link_url text,
  add column if not exists banner_link_label text not null default 'Saiba mais',
  add column if not exists banner_img_url text,
  add column if not exists banner_tone text not null default 'neutral',
  add column if not exists banner_dispensavel boolean not null default true;

alter table public.branding_config drop constraint if exists branding_config_banner_tone_check;
alter table public.branding_config add constraint branding_config_banner_tone_check
  check (banner_tone in ('neutral', 'good', 'warning', 'critical'));

-- Sem policy nova de storage: o upload da imagem do banner (`banner_img_url`)
-- usa o mesmo bucket "branding" (logo/favicon/fundo do login) já liberado
-- pra leitura pública + escrita só-admin em `schema.sql` seção 7.1 — a
-- policy é por BUCKET, não por coluna, então já cobre o campo novo.
