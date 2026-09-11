-- ============================================================================
-- Formatos de post cadastráveis pela empresa
-- ============================================================================
-- Rode DEPOIS de `calendario-de-conteudo.sql` e `receita-de-post.sql`.
-- Idempotente: seguro rodar de novo.
--
-- O problema: a lista de formatos ("reels, carrossel, story, estático, vídeo,
-- texto, outro") estava chumbada em três lugares — `FORMATOS_DO_POST` no
-- TypeScript, o CHECK de `prod_tarefas.post_formato` e o CHECK de
-- `post_receitas.formato`. Uma agência que vende "Podcast" ou "Newsletter" não
-- tinha onde cadastrar, e a única saída era classificar tudo como "Outro" —
-- que é exatamente o formato para o qual um padrão de produção não serve de
-- nada, porque "Outro" não implica nem tipo de serviço nem prazo.
--
-- O que este arquivo faz:
--   1. Cria `post_formatos`, uma linha por formato POR EMPRESA.
--   2. Semeia os 7 nativos em toda empresa (existente e futura), com
--      `nome` NULO — o rótulo deles continua vindo do dicionário, nos três
--      idiomas. Formato criado pela agência tem `nome` preenchido e aparece
--      igual nas três línguas, que é o certo: "Podcast" não se traduz.
--   3. Marca como ATIVO só o que a empresa usa. É o que faz a tela de
--      Padrões de produção mostrar três cards em vez de sete vazios, e o
--      seletor do Calendário oferecer o que a agência vende em vez de uma
--      lista genérica.
--   4. Derruba os dois CHECKs de lista fechada.
--
-- Por que NÃO há chave estrangeira de `prod_tarefas.post_formato` para cá:
-- um post que foi ao ar em março como "Reels" foi ao ar como Reels, mesmo que
-- a agência pare de vender Reels em julho. Com FK, remover o formato ou
-- apagaria a classificação histórica (`on delete set null`) ou travaria a
-- remoção para sempre (`restrict`). Sem FK, o slug fica gravado na tarefa como
-- o fato que ele é, e a UI cai no próprio slug quando não acha o cadastro —
-- feio de propósito, e só na peça antiga.
-- ============================================================================

create table if not exists public.post_formatos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- O valor gravado em `prod_tarefas.post_formato` e `post_receitas.formato`.
  -- Imutável depois de criado: é ele que liga a tarefa ao formato, e trocá-lo
  -- órfãaria toda peça já classificada. Renomear mexe em `nome`, não aqui.
  slug text not null check (slug ~ '^[a-z0-9_]{1,32}$'),

  -- NULO = formato nativo, rótulo traduzido pelo dicionário (pt/en/es).
  -- Preenchido = formato da agência, mesmo nome nas três línguas.
  nome text check (nome is null or length(btrim(nome)) between 1 and 40),

  ordem smallint not null default 0,

  -- `false` = a agência não usa este formato. Continua cadastrado (e a peça
  -- antiga que o usa continua legível), mas sai do seletor do Calendário e
  -- dos cards de Padrões de produção. É o oposto de apagar: apagar perderia
  -- a receita junto.
  ativo boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint post_formatos_um_por_slug unique (company_id, slug),

  -- Um slug desconhecido sem nome não teria rótulo em língua nenhuma: ou é
  -- um dos sete que o dicionário traduz, ou tem nome próprio.
  constraint post_formatos_nativo_ou_nomeado check (
    nome is not null
    or slug in ('reels', 'carrossel', 'story', 'estatico', 'video', 'texto', 'outro')
  )
);

drop trigger if exists post_formatos_set_updated_at on public.post_formatos;
create trigger post_formatos_set_updated_at
  before update on public.post_formatos
  for each row execute function public.set_updated_at();

-- A leitura é da equipe inteira: o Calendário monta o seletor de formato com
-- esta tabela, e quem monta o mês é a social media. A escrita é de admin,
-- mesma divisão de `post_receitas` e pelo mesmo motivo — criar ou sumir com um
-- formato muda como toda peça futura é classificada.
alter table public.post_formatos enable row level security;

drop policy if exists post_formatos_staff_select on public.post_formatos;
create policy post_formatos_staff_select on public.post_formatos
  for select
  using (is_staff() and company_id = current_company_id());

drop policy if exists post_formatos_admin_write on public.post_formatos;
create policy post_formatos_admin_write on public.post_formatos
  for all
  using (is_admin() and company_id = current_company_id())
  with check (is_admin() and company_id = current_company_id());

comment on table public.post_formatos is
  'Formatos de post por empresa. Os 7 nativos tem nome nulo (rotulo vem do dicionario); os criados pela agencia tem nome proprio.';
comment on column public.post_formatos.slug is
  'Valor gravado em prod_tarefas.post_formato. Imutavel: trocar orfanaria as pecas ja classificadas.';
comment on column public.post_formatos.ativo is
  'false = formato que a agencia nao usa. Sai do seletor do Calendario e dos cards de Padroes de producao, sem apagar a receita nem a classificacao das pecas antigas.';

create index if not exists post_formatos_empresa_idx
  on public.post_formatos(company_id, ordem);

-- ============================================================================
-- Semeadura dos nativos
-- ============================================================================
-- Empresa nova nasce com os quatro formatos que praticamente toda agência de
-- social usa. Os outros três ficam inativos, atrás do "+ adicionar formato" —
-- uma tela que abre com quatro cards preenchíveis ensina o que ela faz; uma
-- que abre com sete cards vazios parece relatório.

create or replace function public.seed_post_formatos_empresa(p_company_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.post_formatos (company_id, slug, nome, ordem, ativo) values
    (p_company_id, 'reels',     null, 0, true),
    (p_company_id, 'carrossel', null, 1, true),
    (p_company_id, 'story',     null, 2, true),
    (p_company_id, 'estatico',  null, 3, true),
    (p_company_id, 'video',     null, 4, false),
    (p_company_id, 'texto',     null, 5, false),
    (p_company_id, 'outro',     null, 6, false)
  on conflict (company_id, slug) do nothing;
$$;

create or replace function public.seed_post_formatos_nova_empresa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_post_formatos_empresa(new.id);
  return new;
end;
$$;

drop trigger if exists companies_seed_post_formatos on public.companies;
create trigger companies_seed_post_formatos
  after insert on public.companies
  for each row execute function public.seed_post_formatos_nova_empresa();

-- SECURITY DEFINER recebendo `company_id` como parâmetro: sem os revokes,
-- qualquer autenticado chamaria `/rest/v1/rpc/seed_post_formatos_empresa` com
-- o id de OUTRA empresa. `revoke from public` não basta — o Supabase concede
-- EXECUTE a `anon` e `authenticated` por nome em toda função nova, e um grant
-- nominal não é removido por revogar de `public`.
revoke execute on function public.seed_post_formatos_empresa(uuid) from public;
revoke execute on function public.seed_post_formatos_empresa(uuid) from anon;
revoke execute on function public.seed_post_formatos_empresa(uuid) from authenticated;

revoke execute on function public.seed_post_formatos_nova_empresa() from public;
revoke execute on function public.seed_post_formatos_nova_empresa() from anon;
revoke execute on function public.seed_post_formatos_nova_empresa() from authenticated;

-- ============================================================================
-- Backfill
-- ============================================================================

do $$
declare
  r record;
begin
  for r in select id from public.companies loop
    perform public.seed_post_formatos_empresa(r.id);
  end loop;
end;
$$;

-- Quem JÁ usa um formato não pode vê-lo sumir do seletor por causa da
-- semeadura acima. Ativa tudo que aparece em peça classificada ou em receita
-- já configurada — inclusive 'video', 'texto' e 'outro', que nascem inativos.
update public.post_formatos f
set ativo = true
where ativo = false
  and (
    exists (
      select 1 from public.prod_tarefas t
      where t.company_id = f.company_id and t.post_formato = f.slug
    )
    or exists (
      select 1 from public.post_receitas r
      where r.company_id = f.company_id and r.formato = f.slug
    )
  );

-- ============================================================================
-- Fim da lista fechada
-- ============================================================================
-- Os dois CHECKs abaixo eram a lista dos 7 repetida no banco. A validação
-- passa a ser a tabela: a UI só oferece formato cadastrado, e a action de
-- receita confere o slug contra `post_formatos` antes de gravar.
--
-- O CHECK de `post_canal` FICA: canal é Instagram, TikTok, YouTube — nomes de
-- plataformas que existem no mundo, não vocabulário da agência. Esse é fechado
-- com razão.

alter table public.prod_tarefas drop constraint if exists prod_tarefas_post_formato_check;
alter table public.post_receitas drop constraint if exists post_receitas_formato_check;

comment on column public.prod_tarefas.post_formato is
  'Slug do formato da peca, de post_formatos. Sem FK de proposito: a classificacao historica sobrevive a remocao do formato.';
