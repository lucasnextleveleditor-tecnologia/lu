-- ============================================================================
-- Lume Strada Filmes — Sistema de Gestão de Clientes e Acessos
-- Schema do banco de dados (Supabase / PostgreSQL)
-- ============================================================================
-- Como usar:
-- 1. Crie um projeto em https://supabase.com
-- 2. Abra "SQL Editor" no painel do projeto
-- 3. Cole este arquivo inteiro e clique em "Run"
-- 4. Crie o primeiro administrador (ver instruções no fim deste arquivo)
--
-- Este arquivo é a fonte da verdade do banco. É seguro rodar de novo
-- (idempotente) se você precisar reaplicar depois de alguma alteração.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela `profiles`
-- ----------------------------------------------------------------------------
-- Extensão 1:1 de `auth.users` (que é gerenciada pelo Supabase Auth e não
-- pode ser alterada livremente). Guardamos aqui tudo que é específico do
-- nosso sistema: papel do usuário, controle de expiração e suspensão manual.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,

  role text not null default 'cliente' check (role in ('admin', 'cliente')),

  -- Suspensão manual (botão Suspender/Reativar no painel admin). Independe
  -- da data de expiração — um admin pode suspender mesmo com prazo válido.
  active boolean not null default true,

  -- Controle de acesso manual: null = sem expiração definida (acesso
  -- permanente até ser suspenso). Comparado com `now()` a cada requisição
  -- pelo middleware do Next.js (ver src/middleware.ts).
  expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_expires_at_idx on public.profiles (expires_at);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Criação automática do perfil ao cadastrar um usuário no Auth
-- ----------------------------------------------------------------------------
-- Dispara tanto para convites (`auth.admin.inviteUserByEmail`, usado pelo
-- botão "Convidar Cliente" do painel) quanto para qualquer outro fluxo de
-- criação de usuário. `full_name`, se enviado nos metadados do convite,
-- já entra populado; o papel nasce sempre como 'cliente' por segurança —
-- promover alguém a admin é uma ação deliberada (ver seção 8 no fim deste
-- arquivo), nunca automática.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'cliente',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. Helper `is_admin()` — usado dentro das policies de RLS
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER é essencial aqui: se a policy de `profiles` consultasse
-- `profiles` diretamente para checar o papel do usuário, isso criaria uma
-- recursão infinita de RLS (a policy tentando avaliar a si mesma). Rodando
-- como função "dona" da tabela, essa consulta interna ignora RLS e resolve
-- o problema — é o padrão recomendado pela documentação do Supabase para
-- checagem de papel (role-based access) em RLS.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Nenhuma policy de INSERT/DELETE é concedida à role authenticated de
-- propósito: perfis nascem exclusivamente pelo trigger `handle_new_user`
-- (disparado pela criação do usuário no Auth) e nunca são apagados
-- diretamente — para "remover" o acesso de alguém, suspenda (active=false)
-- ou exclua o usuário no Auth (o `on delete cascade` do id cuida do resto).

-- ============================================================================
-- 5. Metas Diárias & Tráfego — integrados, sem silos
-- ============================================================================
-- Cada `cliente` aqui É um usuário do Portal (linha em `profiles` com
-- role = 'cliente') — não existe uma tabela "clientes" separada. Uma Meta
-- Diária é o objetivo daquele cliente para UM dia específico; um Registro de
-- Tráfego é um lançamento real de investimento/leads DAQUELE dia, sempre
-- amarrado à Meta (nunca solto) — é o que garante a visão unificada
-- Cliente -> Meta do Dia -> Status Atual sem precisar cruzar tabelas soltas.
-- ----------------------------------------------------------------------------

create table if not exists public.metas_diarias (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,

  valor_investido_meta numeric(12, 2) not null default 0, -- meta de investimento do dia (R$)
  leads_meta integer, -- meta de leads do dia (opcional — nem toda campanha mede por lead)
  objetivo text, -- objetivo em texto livre do dia (ex: "Lançamento da campanha X")

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (cliente_id, data) -- uma única Meta Diária por cliente por dia
);

create index if not exists metas_diarias_cliente_data_idx on public.metas_diarias (cliente_id, data);

drop trigger if exists metas_diarias_set_updated_at on public.metas_diarias;
create trigger metas_diarias_set_updated_at
  before update on public.metas_diarias
  for each row execute function public.set_updated_at();

-- Lançamentos reais de tráfego do dia — SEMPRE vinculados a uma Meta Diária
-- (nunca existe um registro de tráfego "solto"). Pode haver mais de um
-- registro por meta (ex: duas campanhas rodando no mesmo dia pro mesmo
-- cliente) — o card do painel soma todos pra comparar com a meta.
create table if not exists public.trafego_registros (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references public.metas_diarias(id) on delete cascade,

  nome_campanha text, -- rótulo livre (ex: "Campanha Institucional - Meta Ads"); opcional
  valor_investido numeric(12, 2) not null default 0,
  leads_gerados integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trafego_registros_meta_idx on public.trafego_registros (meta_id);

drop trigger if exists trafego_registros_set_updated_at on public.trafego_registros;
create trigger trafego_registros_set_updated_at
  before update on public.trafego_registros
  for each row execute function public.set_updated_at();

alter table public.metas_diarias enable row level security;
alter table public.trafego_registros enable row level security;

-- Admin: acesso total (define metas, lança/edita registros de tráfego).
drop policy if exists "metas_diarias_admin_all" on public.metas_diarias;
create policy "metas_diarias_admin_all" on public.metas_diarias
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trafego_registros_admin_all" on public.trafego_registros;
create policy "trafego_registros_admin_all" on public.trafego_registros
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cliente: só ENXERGA (select) a própria meta e os próprios registros —
-- quem define a meta e lança tráfego é sempre o admin (ver requisito 3: "o
-- cliente visualiza apenas... liberado pelo admin"). Nenhuma policy de
-- insert/update/delete é concedida à role authenticated fora do admin.
drop policy if exists "metas_diarias_select_own" on public.metas_diarias;
create policy "metas_diarias_select_own" on public.metas_diarias
  for select to authenticated
  using (cliente_id = auth.uid());

drop policy if exists "trafego_registros_select_own" on public.trafego_registros;
create policy "trafego_registros_select_own" on public.trafego_registros
  for select to authenticated
  using (
    exists (
      select 1 from public.metas_diarias m
      where m.id = trafego_registros.meta_id and m.cliente_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Inventário & Patrimônio
-- ============================================================================
-- Módulo interno de gestão de bens da agência (equipamentos, informática,
-- imóveis, mobiliário...). É uso exclusivo da equipe — nenhuma policy de
-- select é concedida a `cliente`, só a admin (ver RLS abaixo). Toda etiqueta
-- (`itens_inventario`) pertence a exatamente uma categoria (nunca solta),
-- igual ao padrão já usado em Metas/Tráfego da seção 5.
-- ----------------------------------------------------------------------------

create table if not exists public.categorias_inventario (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  codigo text not null, -- código de identificação da categoria (ex: "INFO", "EQP", "IMOV")

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (codigo)
);

drop trigger if exists categorias_inventario_set_updated_at on public.categorias_inventario;
create trigger categorias_inventario_set_updated_at
  before update on public.categorias_inventario
  for each row execute function public.set_updated_at();

create table if not exists public.itens_inventario (
  id uuid primary key default gen_random_uuid(),
  codigo_etiqueta text not null, -- número da etiqueta / código de barras
  categoria_id uuid not null references public.categorias_inventario(id) on delete restrict,

  nome_item text not null,
  status text not null default 'ativo' check (status in ('ativo', 'manutencao', 'baixado', 'emprestado')),
  localizacao text,
  data_aquisicao date,
  valor_pago numeric(12, 2), -- quanto foi investido na aquisição (era `valor_estimado`)
  valor_atual numeric(12, 2), -- valor de mercado hoje — junto com `valor_pago` alimenta o Dashboard Financeiro (depreciação)
  responsavel_atual text, -- colaborador ou setor — texto livre (nem todo bem é "dono" de um usuário do sistema)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (codigo_etiqueta)
);

-- ON DELETE RESTRICT (categoria -> item) de propósito: apagar uma categoria
-- que ainda tem bens vinculados é quase sempre um erro operacional. O admin
-- precisa reclassificar ou dar baixa nos itens primeiro — a UI mostra o erro
-- do banco de forma amigável (ver src/app/admin/inventario/actions.ts).

create index if not exists itens_inventario_categoria_idx on public.itens_inventario (categoria_id);
create index if not exists itens_inventario_status_idx on public.itens_inventario (status);

drop trigger if exists itens_inventario_set_updated_at on public.itens_inventario;
create trigger itens_inventario_set_updated_at
  before update on public.itens_inventario
  for each row execute function public.set_updated_at();

alter table public.categorias_inventario enable row level security;
alter table public.itens_inventario enable row level security;

-- Só admin enxerga e mexe no patrimônio — não é um dado que o cliente
-- precisa ver, então nenhuma policy de select é criada pra `cliente`.
drop policy if exists "categorias_inventario_admin_all" on public.categorias_inventario;
create policy "categorias_inventario_admin_all" on public.categorias_inventario
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "itens_inventario_admin_all" on public.itens_inventario;
create policy "itens_inventario_admin_all" on public.itens_inventario
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 7. Personalização Visual (White-Label / Branding)
-- ============================================================================
-- Tabela SINGLETON (uma única linha, sempre com o mesmo id fixo) que guarda
-- a identidade visual dinâmica do app: logos, favicon, cores, fundo/título/
-- posição da tela de login, tema rápido e o padrão do menu lateral. O app
-- inteiro (layout raiz, sidebar do admin, header do cliente, tela de login)
-- lê essa linha a cada request — mudar aqui muda a plataforma pra todo
-- mundo, sem precisar de novo deploy. `singleton` com `unique` é uma trava
-- extra (clássica em Postgres) que impede uma segunda linha de existir,
-- além do id fixo usado por toda leitura/escrita da aplicação.
-- ----------------------------------------------------------------------------

create table if not exists public.branding_config (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  singleton boolean not null default true unique,

  -- Logotipo — três variantes (padrão, versão para fundo escuro, versão
  -- para fundo claro) porque o app hoje é fixo em Dark Mode; os campos de
  -- claro/escuro já ficam prontos para quando (se) existir um toggle de tema.
  logo_url text,
  logo_dark_url text,
  logo_light_url text,
  favicon_url text,

  -- Cor primária (`--primary` / token `accent` do Tailwind): botões, links,
  -- badges e destaques em geral. Cor de acentuação: um segundo tom usado no
  -- fundo da tela de login e em destaques secundários — deliberadamente NÃO
  -- reescreve a paleta de base/tinta/status (essas seguem fixas e validadas
  -- por contraste, ver tailwind.config.ts).
  primary_color text not null default '#d4a24e',
  accent_color text not null default '#e8bd72',

  -- Tela de login
  login_bg_url text,
  login_bg_preset text not null default 'grain' check (login_bg_preset in ('grain', 'projector', 'film-strip', 'none')),
  login_title text not null default 'Lume Strada Filmes',
  login_subtitle text not null default 'Acesso a clientes e projetos',
  login_box_position text not null default 'centro' check (login_box_position in ('esquerda', 'direita', 'centro')),

  -- Tema rápido (apenas registra qual preset foi aplicado por último — quem
  -- de fato pinta a UI são `primary_color`/`accent_color` acima) e padrão do
  -- menu lateral (cada usuário pode alternar por conta própria depois; isto
  -- só define o estado inicial).
  theme_preset text not null default 'cinematic_dark' check (theme_preset in ('cinematic_dark', 'minimalist_clean', 'midnight_blue')),
  sidebar_compacto_padrao boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.branding_config (id) values ('00000000-0000-0000-0000-000000000001')
  on conflict (id) do nothing;

drop trigger if exists branding_config_set_updated_at on public.branding_config;
create trigger branding_config_set_updated_at
  before update on public.branding_config
  for each row execute function public.set_updated_at();

alter table public.branding_config enable row level security;

-- SELECT é público (inclusive pra `anon`) de propósito: a tela de LOGIN
-- (ninguém autenticado ainda) também precisa ler logo/cores/título antes de
-- qualquer sessão existir. Nada aqui é sensível — é literalmente a
-- identidade visual pública da plataforma.
drop policy if exists "branding_config_select_all" on public.branding_config;
create policy "branding_config_select_all" on public.branding_config
  for select
  to anon, authenticated
  using (true);

drop policy if exists "branding_config_update_admin" on public.branding_config;
create policy "branding_config_update_admin" on public.branding_config
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem policy de insert/delete: a única linha nasce pelo `insert ... on
-- conflict do nothing` acima e nunca é recriada ou apagada pela aplicação.

-- ----------------------------------------------------------------------------
-- 7.1. Storage — bucket "branding" (logos, favicon, fundo do login)
-- ----------------------------------------------------------------------------
-- Bucket público de leitura (os assets precisam carregar na tela de login,
-- sem sessão) e só-admin de escrita — mesmo padrão de camadas usado nas
-- tabelas acima, aplicado aqui via policy em `storage.objects`.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists "branding_bucket_public_read" on storage.objects;
create policy "branding_bucket_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'branding');

drop policy if exists "branding_bucket_admin_insert" on storage.objects;
create policy "branding_bucket_admin_insert" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "branding_bucket_admin_update" on storage.objects;
create policy "branding_bucket_admin_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'branding' and public.is_admin())
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "branding_bucket_admin_delete" on storage.objects;
create policy "branding_bucket_admin_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'branding' and public.is_admin());

-- ============================================================================
-- 8. Criando o primeiro administrador
-- ============================================================================
-- Este sistema não tem cadastro público — todo usuário nasce como 'cliente'
-- via convite. Para criar o PRIMEIRO admin (e destravar o uso do painel):
--
-- 1. No painel do Supabase → Authentication → Users → "Add user" (ou "Invite
--    user"), crie o seu próprio usuário com e-mail + senha.
-- 2. Volte aqui no SQL Editor e rode (trocando o e-mail):
--
--      update public.profiles set role = 'admin' where email = 'voce@lumestrada.com';
--
-- 3. Pronto — faça login em /login com esse e-mail/senha e você cai direto
--    em /admin. A partir daí, todo novo admin ou cliente pode ser gerenciado
--    pelo próprio painel (convite sempre cria como 'cliente'; promover a
--    admin continua sendo uma ação manual e deliberada via SQL, por design).
-- ============================================================================
